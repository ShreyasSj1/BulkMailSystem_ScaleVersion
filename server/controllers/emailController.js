import User from "../models/userModel.js";
import { addBulkEmailJobs } from "../queues/emailQueue.js";
import { filterUnsubscribedRecipients } from "../utils/filterUnsubscribedRecipients.js";

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const queueBulkEmails = async (req, res, next) => {
  try {
    const { emails, subject, message, senderName, replyTo } = req.body;

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

    if (senderName !== undefined && (typeof senderName !== "string" || !senderName.trim())) {
      return res.status(400).json({
        success: false,
        message: "senderName must be a non-empty string when provided."
      });
    }

    if (replyTo !== undefined) {
      const normalizedReplyTo = String(replyTo).trim().toLowerCase();
      if (!isValidEmail(normalizedReplyTo)) {
        return res.status(400).json({
          success: false,
          message: "replyTo must be a valid email when provided."
        });
      }
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

    const { allowedRecipients, skippedUnsubscribed } =
      await filterUnsubscribedRecipients(normalizedEmails);

    if (allowedRecipients.length === 0) {
      console.log(
        `[${new Date().toISOString()}] No jobs queued. All recipients are unsubscribed.`
      );
      return res.status(202).json({
        success: true,
        message: "No emails queued. All recipients are unsubscribed.",
        queuedCount: 0,
        skippedUnsubscribed
      });
    }

    await User.bulkWrite(
      allowedRecipients.map((email) => ({
        updateOne: {
          filter: { email },
          update: { $setOnInsert: { email } },
          upsert: true
        }
      }))
    );

    const jobs = await addBulkEmailJobs(
      allowedRecipients.map((email) => ({
        email,
        subject: subject.trim(),
        message: message.trim(),
        senderName: senderName?.trim(),
        replyTo: replyTo?.trim().toLowerCase()
      }))
    );

    console.log(
      `[${new Date().toISOString()}] Queued ${jobs.length} email jobs. Skipped unsubscribed=${skippedUnsubscribed.length}`
    );

    return res.status(202).json({
      success: true,
      message: "Emails queued successfully.",
      queuedCount: jobs.length,
      skippedUnsubscribed,
      jobIds: jobs.map((job) => job.id)
    });
  } catch (error) {
    next(error);
  }
};
