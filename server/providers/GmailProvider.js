import "dotenv/config";
import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    const { EMAIL, PASSWORD } = process.env;

    if (!EMAIL || !PASSWORD) {
      throw new Error("EMAIL and PASSWORD must be configured.");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD
      }
    });
  }

  return transporter;
};

export class GmailProvider {
  async sendEmail({ to, subject, html, text, senderName, replyTo }) {
    const mailTransporter = getTransporter();
    const resolvedSenderName = senderName || process.env.SENDER_NAME || "NIEdge";
    const resolvedReplyTo = replyTo || process.env.REPLY_TO;
    const fromAddress = `"${resolvedSenderName.replace(/"/g, "")}" <${process.env.EMAIL}>`;

    return mailTransporter.sendMail({
      from: fromAddress,
      replyTo: resolvedReplyTo,
      to,
      subject,
      html,
      text
    });
  }
}
