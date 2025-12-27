import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set");
}

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(serviceAccountPath), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAdmin = admin;
