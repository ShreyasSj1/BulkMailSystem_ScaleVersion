import "dotenv/config";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const parseRangedInt = (value, fallback, minimum) => {
  const parsed = parsePositiveInt(value, fallback);
  return Math.max(minimum, parsed);
};

const createRange = (minimum, maximum) => ({
  minimum: Math.min(minimum, maximum),
  maximum: Math.max(minimum, maximum)
});

const getRandomInRange = (minimum, maximum) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const safeModeEnabled = parseBoolean(process.env.SAFE_MODE, true);
const configuredEmailsPerSecond = parsePositiveInt(
  process.env.EMAILS_PER_SECOND,
  1
);
const configuredMaxConcurrency = parsePositiveInt(
  process.env.MAX_CONCURRENCY,
  1
);
const configuredBatchSize = parsePositiveInt(process.env.BATCH_SIZE, 10);
const configuredChunkSize = parsePositiveInt(
  process.env.RECIPIENT_CHUNK_SIZE,
  25
);
const chunkIntervalRange = createRange(
  parseRangedInt(
    process.env.CHUNK_INTERVAL_MIN_MS,
    safeModeEnabled ? 120000 : 45000,
    1000
  ),
  parseRangedInt(
    process.env.CHUNK_INTERVAL_MAX_MS,
    safeModeEnabled ? 240000 : 120000,
    1000
  )
);
const drainCooldownRange = createRange(
  parseRangedInt(
    process.env.DRAIN_COOLDOWN_MIN_MS,
    safeModeEnabled ? 15000 : 5000,
    1000
  ),
  parseRangedInt(
    process.env.DRAIN_COOLDOWN_MAX_MS,
    safeModeEnabled ? 45000 : 15000,
    1000
  )
);

export const emailThrottleConfig = {
  // SAFE_MODE clamps aggressive values into a Gmail-friendly profile.
  safeModeEnabled,
  emailsPerSecond: safeModeEnabled
    ? Math.min(configuredEmailsPerSecond, 1)
    : configuredEmailsPerSecond,
  maxConcurrency: safeModeEnabled
    ? Math.min(configuredMaxConcurrency, 1)
    : configuredMaxConcurrency,
  batchSize: safeModeEnabled ? Math.min(configuredBatchSize, 25) : configuredBatchSize,
  enableChunking: parseBoolean(process.env.ENABLE_RECIPIENT_CHUNKING, true),
  recipientChunkSize: safeModeEnabled
    ? Math.min(configuredChunkSize, 25)
    : configuredChunkSize,
  chunkIntervalMinMs: chunkIntervalRange.minimum,
  chunkIntervalMaxMs: chunkIntervalRange.maximum,
  drainCooldownMinMs: drainCooldownRange.minimum,
  drainCooldownMaxMs: drainCooldownRange.maximum,
  minJitterMs: safeModeEnabled ? 500 : 300,
  maxJitterMs: safeModeEnabled ? 2200 : 2000,
  recipientSpacingJitterMinMs: safeModeEnabled ? 250 : 100,
  recipientSpacingJitterMaxMs: safeModeEnabled ? 1400 : 900
};

export const getRandomJitterMs = () => {
  const { minJitterMs, maxJitterMs } = emailThrottleConfig;
  return getRandomInRange(minJitterMs, maxJitterMs);
};

export const getBaseIntervalMs = () =>
  Math.max(1, Math.ceil(1000 / emailThrottleConfig.emailsPerSecond));

export const getChunkPauseMs = () =>
  getRandomInRange(
    emailThrottleConfig.chunkIntervalMinMs,
    emailThrottleConfig.chunkIntervalMaxMs
  );

export const getDrainCooldownMs = () =>
  getRandomInRange(
    emailThrottleConfig.drainCooldownMinMs,
    emailThrottleConfig.drainCooldownMaxMs
  );

export const getRecipientSpacingMs = () => {
  const baseIntervalMs = getBaseIntervalMs();
  const spacingJitterMs = getRandomInRange(
    emailThrottleConfig.recipientSpacingJitterMinMs,
    emailThrottleConfig.recipientSpacingJitterMaxMs
  );
  return baseIntervalMs + spacingJitterMs;
};
