import "dotenv/config";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const emailThrottleConfig = {
  // Conservative Gmail-safe defaults
  emailsPerSecond: parsePositiveInt(process.env.EMAILS_PER_SECOND, 1),
  maxConcurrency: parsePositiveInt(process.env.MAX_CONCURRENCY, 1),
  batchSize: parsePositiveInt(process.env.BATCH_SIZE, 10),
  minJitterMs: 300,
  maxJitterMs: 2000
};

export const getRandomJitterMs = () => {
  const { minJitterMs, maxJitterMs } = emailThrottleConfig;
  return (
    Math.floor(Math.random() * (maxJitterMs - minJitterMs + 1)) + minJitterMs
  );
};

export const getBaseIntervalMs = () =>
  Math.max(1, Math.ceil(1000 / emailThrottleConfig.emailsPerSecond));
