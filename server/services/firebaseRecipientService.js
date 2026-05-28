import { getFirestore } from "../config/firebase.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const fetchEmailsFromFirebase = async ({
  collectionPath,
  emailField = "email",
  limit
}) => {
  if (!collectionPath || typeof collectionPath !== "string") {
    throw new Error("collectionPath is required to fetch recipients from Firebase.");
  }

  const db = getFirestore();
  let query = db.collection(collectionPath.trim());

  if (limit !== undefined) {
    const parsedLimit = Number.parseInt(limit, 10);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      throw new Error("limit must be a positive integer when provided.");
    }
    query = query.limit(parsedLimit);
  }

  const snapshot = await query.get();
  const collected = [];

  snapshot.forEach((doc) => {
    const value = doc.get(emailField);
    if (typeof value === "string") {
      collected.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "string") {
          collected.push(entry);
        }
      });
    }
  });

  const normalized = [...new Set(
    collected.map((email) => String(email).trim().toLowerCase()).filter(Boolean)
  )];
  const validEmails = normalized.filter((email) => isValidEmail(email));

  return {
    totalFetched: snapshot.size,
    extractedEmails: normalized.length,
    validEmails
  };
};
