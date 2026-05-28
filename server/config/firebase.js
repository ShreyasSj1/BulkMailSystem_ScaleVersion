import "dotenv/config";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let firebaseApp;

const readServiceAccountFromEnv = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return null;
  }

  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full JSON string."
    );
  }
};

const readServiceAccountFromPath = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return null;
  }

  const absolutePath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    : path.join(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Firebase service account file not found at ${absolutePath}`
    );
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
  } catch {
    throw new Error(
      `Unable to parse Firebase service account JSON file at ${absolutePath}`
    );
  }
};

const getServiceAccount = () => {
  const fromEnv = readServiceAccountFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  const fromPath = readServiceAccountFromPath();
  if (fromPath) {
    return fromPath;
  }

  throw new Error(
    "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
};

export const getFirebaseApp = () => {
  if (!firebaseApp) {
    const serviceAccount = getServiceAccount();
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return firebaseApp;
};

export const getFirestore = () => {
  const app = getFirebaseApp();
  return admin.firestore(app);
};
