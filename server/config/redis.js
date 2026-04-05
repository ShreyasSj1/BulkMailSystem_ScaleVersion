import "dotenv/config";
import IORedis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT
};

export const createRedisClient = () =>
  new IORedis({
    ...redisConnection,
    maxRetriesPerRequest: null
  });
