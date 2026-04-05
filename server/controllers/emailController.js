import User from "../models/userModel.js";
import { addBulkEmailJobs } from "../queues/emailQueue.js";

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const queueBulkEmails = async (req, res, next) => {
  try {
    const { emails, subject, message } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "emails must be a non-empty array."
      });
    }

    if (typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "subject is required."
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required."
      });
    }

    const normalizedEmails = [...new Set(emails.map((email) => String(email).trim().toLowerCase()))];
    const invalidEmails = normalizedEmails.filter((email) => !isValidEmail(email));

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some emails are invalid.",
        invalidEmails
      });
    }

    await User.bulkWrite(
      normalizedEmails.map((email) => ({
        updateOne: {
          filter: { email },
          update: { $setOnInsert: { email } },
          upsert: true
        }
      }))
    );

    const jobs = await addBulkEmailJobs(
      normalizedEmails.map((email) => ({
        email,
        subject: subject.trim(),
        message: message.trim()
      }))
    );

    console.log(
      `[${new Date().toISOString()}] Queued ${jobs.length} email jobs`
    );

    return res.status(202).json({
      success: true,
      message: "Emails queued successfully.",
      queuedCount: jobs.length,
      jobIds: jobs.map((job) => job.id)
    });
  } catch (error) {
    next(error);
  }
};
