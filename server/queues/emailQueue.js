import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import {
  emailThrottleConfig,
  getChunkPauseMs,
  getRandomJitterMs,
  getRecipientSpacingMs
} from "../config/emailThrottle.js";

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});

export const addBulkEmailJobs = async (emails) => {
  const jobs = [];
  const {
    enableChunking,
    recipientChunkSize,
    safeModeEnabled
  } = emailThrottleConfig;
  const effectiveChunkSize = enableChunking
    ? Math.max(1, recipientChunkSize)
    : Number.POSITIVE_INFINITY;
  let scheduledDelayMs = 0;

  emails.forEach((emailJob, index) => {
    if (index > 0) {
      const startsNewChunk = enableChunking && index % effectiveChunkSize === 0;
      if (startsNewChunk) {
        scheduledDelayMs += getChunkPauseMs();
      } else {
        scheduledDelayMs += getRecipientSpacingMs();
      }
    }

    const timestampPatternJitterMs = getRandomJitterMs();

    jobs.push({
      name: "send-email",
      data: emailJob,
      opts: {
        delay: scheduledDelayMs + timestampPatternJitterMs
      }
    });
  });

  const queuedJobs = await emailQueue.addBulk(jobs);
  const chunkCount = enableChunking
    ? Math.ceil(emails.length / effectiveChunkSize)
    : 1;

  console.log(
    `[${new Date().toISOString()}] Scheduled ${emails.length} jobs with gradual draining. SAFE_MODE=${safeModeEnabled} CHUNKING=${enableChunking} CHUNK_SIZE=${enableChunking ? effectiveChunkSize : "disabled"} CHUNKS=${chunkCount}`
  );

  return queuedJobs;
};
