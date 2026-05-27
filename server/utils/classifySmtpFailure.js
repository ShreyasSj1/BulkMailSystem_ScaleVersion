const HARD_BOUNCE_PATTERNS = [
  "user unknown",
  "mailbox unavailable",
  "no such user",
  "invalid recipient",
  "recipient address rejected",
  "unknown user",
  "account does not exist",
  "address rejected"
];

export const classifySmtpFailure = (error) => {
  const message = String(
    error?.response || error?.message || ""
  ).toLowerCase();
  const responseCode = Number(error?.responseCode || 0);

  const patternMatch = HARD_BOUNCE_PATTERNS.some((pattern) =>
    message.includes(pattern)
  );
  const is5xx = responseCode >= 500 && responseCode < 600;
  const isHardBounceCode = [550, 551, 552, 553, 554].includes(responseCode);

  const isPermanent = patternMatch || isHardBounceCode || is5xx;

  return {
    isPermanent,
    reason: `SMTP ${responseCode || "unknown"} ${message}`.trim()
  };
};
