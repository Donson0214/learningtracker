"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
if (!(0, app_1.getApps)().length) {
    // OPTION 1: Use service account JSON file (recommended)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path_1.default.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        let serviceAccount = null;
        try {
            const raw = fs_1.default.readFileSync(serviceAccountPath, "utf-8");
            if (!raw.trim()) {
                throw new Error("Firebase service account JSON is empty");
            }
            serviceAccount = JSON.parse(raw);
        }
        catch (error) {
            console.warn("Failed to read FIREBASE_SERVICE_ACCOUNT_PATH, falling back to env vars.", error.message);
        }
        if (serviceAccount && !serviceAccount.project_id) {
            throw new Error("Firebase service account JSON is missing project_id");
        }
        if (serviceAccount) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
        }
    }
    // OPTION 2: Fallback to env variables (your current setup)
    if (!(0, app_1.getApps)().length &&
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
    }
    // OPTION 3: Fail loudly (better than silent crash)
    if (!(0, app_1.getApps)().length) {
        throw new Error("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or env vars.");
    }
}
exports.firebaseAdmin = firebase_admin_1.default;
