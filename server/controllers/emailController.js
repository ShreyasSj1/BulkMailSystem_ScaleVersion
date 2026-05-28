import User from "../models/userModel.js";
import { addBulkEmailJobs } from "../queues/emailQueue.js";
import { fetchEmailsFromFirebase } from "../services/firebaseRecipientService.js";
import { filterUnsubscribedRecipients } from "../utils/filterUnsubscribedRecipients.js";
import { filterSuppressedRecipients } from "../utils/filterSuppressedRecipients.js";

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const buildBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const queueBulkEmails = async (req, res, next) => {
  try {
    const { emails, subject, message, senderName, replyTo } = req.body;
    const result = await queueEmailJobs({
      emails,
      subject,
      message,
      senderName,
      replyTo
    });

    return res.status(202).json(result);
  } catch (error) {
    next(error);
  }
};

export const queueEmailsFromFirebase = async (req, res, next) => {
  try {
    const {
      collectionPath,
      emailField = "email",
      limit,
      subject,
      message,
      senderName,
      replyTo
    } = req.body;

    if (typeof collectionPath !== "string" || !collectionPath.trim()) {
      return res.status(400).json({
        success: false,
        message: "collectionPath is required."
      });
    }

    const {
      totalFetched,
      extractedEmails,
      validEmails
    } = await fetchEmailsFromFirebase({
      collectionPath,
      emailField,
      limit
    });

    const result = await queueEmailJobs({
      emails: validEmails,
      subject,
      message,
      senderName,
      replyTo
    });

    return res.status(202).json({
      ...result,
      source: "firebase",
      collectionPath: collectionPath.trim(),
      emailField,
      firebaseStats: {
        totalFetched,
        extractedEmails,
        validEmails: validEmails.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const queueEmailJobs = async ({
  emails,
  subject,
  message,
  senderName,
  replyTo
}) => {
  if (!Array.isArray(emails) || emails.length === 0) {
    return {
      success: true,
      message: "No emails found to queue.",
      queuedCount: 0,
      skippedUnsubscribed: [],
      skippedSuppressed: [],
      jobIds: []
    };
  }

  if (typeof subject !== "string" || !subject.trim()) {
    throw buildBadRequestError("subject is required.");
  }

  if (typeof message !== "string" || !message.trim()) {
    throw buildBadRequestError("message is required.");
  }

  if (
    senderName !== undefined &&
    (typeof senderName !== "string" || !senderName.trim())
  ) {
    throw buildBadRequestError(
      "senderName must be a non-empty string when provided."
    );
  }

  if (replyTo !== undefined) {
    const normalizedReplyTo = String(replyTo).trim().toLowerCase();
    if (!isValidEmail(normalizedReplyTo)) {
      throw buildBadRequestError("replyTo must be a valid email when provided.");
    }
  }

  const normalizedEmails = [...new Set(
    emails.map((email) => String(email).trim().toLowerCase())
  )];
  const invalidEmails = normalizedEmails.filter((email) => !isValidEmail(email));

  if (invalidEmails.length > 0) {
    throw buildBadRequestError(
      `Some emails are invalid: ${invalidEmails.join(", ")}`
    );
  }

  const { allowedRecipients: unsubscribedFiltered, skippedUnsubscribed } =
    await filterUnsubscribedRecipients(normalizedEmails);

  const { allowedRecipients, skippedSuppressed } =
    await filterSuppressedRecipients(unsubscribedFiltered);

  if (allowedRecipients.length === 0) {
    console.log(
      `[${new Date().toISOString()}] No jobs queued. All recipients are unsubscribed/suppressed.`
    );
    return {
      success: true,
      message: "No emails queued. All recipients are unsubscribed or suppressed.",
      queuedCount: 0,
      skippedUnsubscribed,
      skippedSuppressed,
      jobIds: []
    };
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
    `[${new Date().toISOString()}] Queued ${jobs.length} email jobs. Skipped unsubscribed=${skippedUnsubscribed.length} suppressed=${skippedSuppressed.length}`
  );

  return {
    success: true,
    message: "Emails queued successfully.",
    queuedCount: jobs.length,
    skippedUnsubscribed,
    skippedSuppressed,
    jobIds: jobs.map((job) => job.id)
  };
};
