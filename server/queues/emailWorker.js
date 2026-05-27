import "dotenv/config";
import { QueueEvents, Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { createRedisClient, redisConnection } from "../config/redis.js";
import User from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
import { buildEmailContent } from "../utils/buildEmailContent.js";

const queueName = "emailQueue";

const startWorker = async () => {
  try {
    await connectDB();

    const worker = new Worker(
      queueName,
      async (job) => {
        const { email, subject, message, senderName, replyTo } = job.data;
        const user = await User.findOne({ email }).lean();
        const recipientName = user?.name || "Subscriber";
        const { html, text } = buildEmailContent({
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

        console.log(
          `[${new Date().toISOString()}] Email sent to ${email}. Message ID: ${info.messageId}`
        );

        return {
          email,
          messageId: info.messageId
        };
      },
      {
        connection: redisConnection,
        concurrency: 10
      }
    );

    const queueEvents = new QueueEvents(queueName, {
      connection: createRedisClient()
    });

    worker.on("failed", (job, error) => {
      console.error(
        `[${new Date().toISOString()}] Job ${job?.id} failed for ${job?.data?.email}:`,
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

    console.log(`[${new Date().toISOString()}] Email worker started`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Worker startup failed:`, error);
    process.exit(1);
  }
};

startWorker();
