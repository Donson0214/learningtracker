import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import fs from "fs";
import path from "path";

if (!getApps().length) {
  // OPTION 1: Use service account JSON file (recommended)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    );

    let serviceAccount: any = null;
    try {
      const raw = fs.readFileSync(serviceAccountPath, "utf-8");
      if (!raw.trim()) {
        throw new Error("Firebase service account JSON is empty");
      }
      serviceAccount = JSON.parse(raw);
    } catch (error) {
      console.warn(
        "Failed to read FIREBASE_SERVICE_ACCOUNT_PATH, falling back to env vars.",
        (error as Error).message
      );
    }

    if (serviceAccount && !serviceAccount.project_id) {
      throw new Error(
        "Firebase service account JSON is missing project_id"
      );
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  // OPTION 2: Fallback to env variables (your current setup)
  if (
    !getApps().length &&
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  // OPTION 3: Fail loudly (better than silent crash)
  if (!getApps().length) {
    throw new Error(
      "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or env vars."
    );
  }
}

export const firebaseAdmin = admin;
