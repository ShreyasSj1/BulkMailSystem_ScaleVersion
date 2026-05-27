import { generateEmailTemplate } from "./emailTemplate.js";
import { generatePlainText } from "./generatePlainText.js";

const buildUnsubscribeUrl = (recipientEmail) => {
  const appBaseUrl = (process.env.APP_BASE_URL || "http://localhost:5000").replace(
    /\/$/,
    ""
  );
  return `${appBaseUrl}/api/email/unsubscribe?email=${encodeURIComponent(
    recipientEmail
  )}`;
};

export const buildEmailContent = ({
  recipientEmail,
  recipientName,
  subject,
  message,
  ctaText,
  ctaUrl,
  heading,
  intro,
  footerName
}) => {
  const unsubscribeUrl = buildUnsubscribeUrl(recipientEmail);

  const html = generateEmailTemplate({
    recipientName,
    preheader: `${subject} - NIEdge update`,
    heading,
    intro,
    message,
    ctaText,
    ctaUrl,
    footerName,
    unsubscribeUrl
  });

  const text = generatePlainText({
    recipientEmail,
    recipientName,
    subject,
    message,
    ctaUrl,
    unsubscribeUrl
  });

  return { html, text };
};
