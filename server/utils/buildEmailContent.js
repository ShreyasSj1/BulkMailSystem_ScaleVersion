import { generateEmailTemplate } from "./emailTemplate.js";
import { generatePlainText } from "./generatePlainText.js";

export const buildEmailContent = ({
  recipientName,
  subject,
  message,
  ctaText,
  ctaUrl,
  heading,
  intro,
  footerName
}) => {
  const html = generateEmailTemplate({
    recipientName,
    preheader: `${subject} - NIEdge update`,
    heading,
    intro,
    message,
    ctaText,
    ctaUrl,
    footerName
  });

  const text = generatePlainText({
    recipientName,
    subject,
    message,
    ctaUrl
  });

  return { html, text };
};
