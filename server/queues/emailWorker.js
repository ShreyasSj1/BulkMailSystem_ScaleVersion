import "dotenv/config";
import { Queue, QueueEvents, Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { createRedisClient, redisConnection } from "../config/redis.js";
import {
  emailThrottleConfig,
  getRandomJitterMs
} from "../config/emailThrottle.js";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
import { buildEmailContent } from "../utils/buildEmailContent.js";
import { sleep } from "../utils/sleep.js";

const queueName = "emailQueue";

const startWorker = async () => {
  try {
    await connectDB();
    const stats = {
      sent: 0,
      failed: 0,
      retried: 0
    };
    const queue = new Queue(queueName, { connection: redisConnection });

    const worker = new Worker(
      queueName,
      async (job) => {
        const { email, subject, message, senderName, replyTo } = job.data;
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

        const info = await sendEmail({
          to: email,
          subject,
          html,
          text,
          senderName,
          replyTo
        });
        stats.sent += 1;

        console.log(
          `[${new Date().toISOString()}] Email sent to ${email}. Message ID: ${info.messageId}. Jitter=${jitterMs}ms Attempt=${job.attemptsMade + 1}/${job.opts.attempts}`
        );

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
          `[${new Date().toISOString()}] Worker metrics | rate=${sendRatePerSecond} emails/s | queue(waiting=${counts.waiting}, active=${counts.active}, delayed=${counts.delayed}) | retries=${stats.retried} | failures=${stats.failed}`
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
      `[${new Date().toISOString()}] Email worker started | EMAILS_PER_SECOND=${emailThrottleConfig.emailsPerSecond} MAX_CONCURRENCY=${emailThrottleConfig.maxConcurrency} BATCH_SIZE=${emailThrottleConfig.batchSize} JITTER_MS=${emailThrottleConfig.minJitterMs}-${emailThrottleConfig.maxJitterMs}`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Worker startup failed:`, error);
    process.exit(1);
  }
};

startWorker();
