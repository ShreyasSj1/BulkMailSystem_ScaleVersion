import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import {
  emailThrottleConfig,
  getBaseIntervalMs,
  getRandomJitterMs
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
  const baseIntervalMs = getBaseIntervalMs();
  const { batchSize } = emailThrottleConfig;

  const jobs = emails.map((emailJob, index) => {
    const batchIndex = Math.floor(index / batchSize);
    const indexInBatch = index % batchSize;
    const globalOffsetMs = index * baseIntervalMs;
    const batchBufferMs = batchIndex * 750;
    const batchJitterMs = getRandomJitterMs();
    const inBatchJitterMs = Math.floor(getRandomJitterMs() / 3);

    return {
      name: "send-email",
      data: emailJob,
      opts: {
        delay:
          globalOffsetMs +
          batchBufferMs +
          batchJitterMs +
          indexInBatch * 25 +
          inBatchJitterMs
      }
    };
  });

  return emailQueue.addBulk(jobs);
};
