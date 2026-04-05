import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

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
  const jobs = emails.map((emailJob) => ({
    name: "send-email",
    data: emailJob
  }));

  return emailQueue.addBulk(jobs);
};
