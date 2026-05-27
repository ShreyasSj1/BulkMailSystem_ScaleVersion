export const generatePlainText = ({
  recipientName = "Subscriber",
  subject,
  message,
  ctaUrl = "https://niedge.vercel.app/"
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
    "Thanks,",
    "Team NIEdge"
  ].join("\n");
};
