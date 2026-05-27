export const generatePlainText = ({
  recipientEmail,
  recipientName = "Subscriber",
  subject,
  message,
  ctaUrl = "https://niedge.vercel.app/",
  unsubscribeUrl
}) => {
  return [
    `Subject: ${subject}`,
    "",
    `Hey ${recipientName},`,
    "",
    message,
    "",
    `Explore: ${ctaUrl}`,
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    "",
    "Thanks,",
    "Team NIEdge",
    "",
    `Email: ${recipientEmail}`
  ].join("\n");
};
