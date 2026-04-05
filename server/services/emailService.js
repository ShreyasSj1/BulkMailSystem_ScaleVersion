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

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();

  return mailTransporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
    text
  });
};
