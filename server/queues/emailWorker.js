import "dotenv/config";
import { Queue, QueueEvents, UnrecoverableError, Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { createRedisClient, redisConnection } from "../config/redis.js";
import {
  emailThrottleConfig,
  getDrainCooldownMs,
  getRandomJitterMs
} from "../config/emailThrottle.js";
import SuppressionList from "../models/suppressionListModel.js";
import User from "../models/userModel.js";
import { getEmailProvider } from "../providers/index.js";
import { buildEmailContent } from "../utils/buildEmailContent.js";
import { classifySmtpFailure } from "../utils/classifySmtpFailure.js";
import { isSuppressedEmail } from "../utils/isSuppressedEmail.js";
import { sleep } from "../utils/sleep.js";

const queueName = "emailQueue";

const startWorker = async () => {
  try {
    await connectDB();
    const stats = {
      sent: 0,
      totalSent: 0,
      failed: 0,
      retried: 0,
      hardBounces: 0,
      suppressedSkips: 0,
      cooldownsApplied: 0,
      sentSinceCooldown: 0
    };
    const queue = new Queue(queueName, { connection: redisConnection });
    const provider = getEmailProvider();

    const worker = new Worker(
      queueName,
      async (job) => {
        const { email, subject, message, senderName, replyTo } = job.data;
        const suppressed = await isSuppressedEmail(email);
        if (suppressed) {
          stats.suppressedSkips += 1;
          console.log(
            `[${new Date().toISOString()}] Skipping suppressed recipient ${email} for job ${job.id}`
          );
          return {
            email,
            skipped: true,
            reason: "suppressed"
          };
        }

        const jitterMs = getRandomJitterMs();
        await sleep(jitterMs);

        const user = await User.findOne({ email }).lean();
        const recipientName = user?.name || "Subscriber";
        const { html, text } = buildEmailContent({
          recipientEmail: email,
          recipientName,
          subject,
          message,
          ctaText: "Explore Now",
          ctaUrl: "https://niedge.vercel.app/",
          heading: "NIEdge just became better.",
          intro: "A smarter place to prepare, explore, and stay ready for what comes next.",
          footerName: "Team NIEdge"
        });

        let info;
        try {
          info = await provider.sendEmail({
            to: email,
            subject,
            html,
            text,
            senderName,
            replyTo
          });
        } catch (error) {
          const failure = classifySmtpFailure(error);
          if (failure.isPermanent) {
            await SuppressionList.updateOne(
              { email },
              {
                $set: {
                  email,
                  reason: failure.reason,
                  type: "hard_bounce",
                  createdAt: new Date()
                }
              },
              { upsert: true }
            );
            stats.hardBounces += 1;
            console.error(
              `[${new Date().toISOString()}] Permanent SMTP failure for ${email}. Added to suppression list. Reason=${failure.reason}`
            );
            throw new UnrecoverableError(
              `Permanent SMTP failure (suppressed): ${failure.reason}`
            );
          }

          throw error;
        }
        stats.sent += 1;
        stats.totalSent += 1;
        stats.sentSinceCooldown += 1;

        console.log(
          `[${new Date().toISOString()}] Email sent to ${email}. Message ID: ${info.messageId}. Jitter=${jitterMs}ms Attempt=${job.attemptsMade + 1}/${job.opts.attempts}`
        );

        if (
          emailThrottleConfig.enableChunking &&
          stats.sentSinceCooldown >= emailThrottleConfig.recipientChunkSize
        ) {
          const cooldownMs = getDrainCooldownMs();
          stats.cooldownsApplied += 1;
          stats.sentSinceCooldown = 0;
          console.log(
            `[${new Date().toISOString()}] Applying gradual drain cooldown for ${cooldownMs}ms after ${emailThrottleConfig.recipientChunkSize} sends`
          );
          await sleep(cooldownMs);
        }

        return {
          email,
          messageId: info.messageId,
          jitterMs
        };
      },
      {
        connection: redisConnection,
        concurrency: emailThrottleConfig.maxConcurrency,
        limiter: {
          max: emailThrottleConfig.emailsPerSecond,
          duration: 1000
        }
      }
    );

    const queueEvents = new QueueEvents(queueName, {
      connection: createRedisClient()
    });

    worker.on("failed", (job, error) => {
      stats.failed += 1;
      const attemptsMade = job?.attemptsMade || 0;
      const maxAttempts = job?.opts?.attempts || 1;
      const willRetry = attemptsMade < maxAttempts;
      if (willRetry) {
        stats.retried += 1;
      }
      console.error(
        `[${new Date().toISOString()}] Job ${job?.id} failed for ${job?.data?.email}. Attempts=${attemptsMade}/${maxAttempts} WillRetry=${willRetry}:`,
        error.message
      );
    });

    worker.on("completed", (job) => {
      console.log(
        `[${new Date().toISOString()}] Job ${job.id} completed for ${job.data.email}`
      );
    });

    queueEvents.on("waiting", ({ jobId }) => {
      console.log(
        `[${new Date().toISOString()}] Job ${jobId} is waiting in queue`
      );
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      console.error(
        `[${new Date().toISOString()}] Queue event failure for job ${jobId}: ${failedReason}`
      );
    });

    const metricsInterval = setInterval(async () => {
      try {
        const counts = await queue.getJobCounts(
          "waiting",
          "active",
          "delayed",
          "failed",
          "completed"
        );
        const sendRatePerSecond = (stats.sent / 15).toFixed(2);
        console.log(
          `[${new Date().toISOString()}] Worker metrics | rate=${sendRatePerSecond} emails/s | queue(waiting=${counts.waiting}, active=${counts.active}, delayed=${counts.delayed}) | retries=${stats.retried} | failures=${stats.failed} | hardBounces=${stats.hardBounces} | suppressedSkips=${stats.suppressedSkips} | cooldowns=${stats.cooldownsApplied} | totalSent=${stats.totalSent}`
        );
        stats.sent = 0;
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Failed to fetch worker metrics:`,
          error.message
        );
      }
    }, 15000);

    metricsInterval.unref();

    console.log(
      `[${new Date().toISOString()}] Email worker started | SAFE_MODE=${emailThrottleConfig.safeModeEnabled} EMAILS_PER_SECOND=${emailThrottleConfig.emailsPerSecond} MAX_CONCURRENCY=${emailThrottleConfig.maxConcurrency} BATCH_SIZE=${emailThrottleConfig.batchSize} CHUNKING=${emailThrottleConfig.enableChunking} CHUNK_SIZE=${emailThrottleConfig.recipientChunkSize} CHUNK_INTERVAL_MS=${emailThrottleConfig.chunkIntervalMinMs}-${emailThrottleConfig.chunkIntervalMaxMs} DRAIN_COOLDOWN_MS=${emailThrottleConfig.drainCooldownMinMs}-${emailThrottleConfig.drainCooldownMaxMs} JITTER_MS=${emailThrottleConfig.minJitterMs}-${emailThrottleConfig.maxJitterMs}`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Worker startup failed:`, error);
    process.exit(1);
  }
};

startWorker();
