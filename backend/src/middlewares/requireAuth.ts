import { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { firebaseAdmin } from "../config/firebase";
import { prisma } from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    name: string | null;
    role: UserRole;
    organizationId: string | null;
  };
}

type JwtPayload = {
  aud?: string;
  iss?: string;
  email?: string;
  name?: string;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const getFirebaseAuthErrorMessage = (
  error: unknown,
  token?: string
) => {
  const code = (error as { code?: string })?.code;
  if (code === "auth/id-token-expired") {
    return "Token expired. Please sign in again.";
  }
  if (code === "auth/id-token-revoked") {
    return "Token revoked. Please sign in again.";
  }
  if (code === "auth/user-disabled") {
    return "User account is disabled.";
  }
  if (code === "auth/invalid-id-token" || code === "auth/invalid-argument") {
    const expectedProject = process.env.FIREBASE_PROJECT_ID;
    const payload = token ? decodeJwtPayload(token) : null;
    if (
      payload?.aud &&
      expectedProject &&
      payload.aud !== expectedProject &&
      process.env.NODE_ENV !== "production"
    ) {
      return `Token project mismatch. Frontend uses ${payload.aud}, backend expects ${expectedProject}.`;
    }
  }
  return "Invalid or expired token";
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  let decoded: { uid: string; email?: string; name?: string };
  try {
    decoded = await firebaseAdmin.auth().verifyIdToken(token, true);
  } catch (error) {
    return res
      .status(401)
      .json({ message: getFirebaseAuthErrorMessage(error, token) });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      const email = decoded.email;
      if (!email) {
        return res.status(401).json({ message: "User not found" });
      }

      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { firebaseUid: decoded.uid },
        });
      } else {
        user = await prisma.user.create({
          data: {
            firebaseUid: decoded.uid,
            email,
            name: decoded.name ?? email.split("@")[0],
          },
        });
      }
    } else if (!user.name && decoded.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: decoded.name },
      });
    }

    req.user = {
      id: user.id,
      firebaseUid: decoded.uid,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (error) {
    console.error("Auth user lookup failed:", error);
    return res
      .status(500)
      .json({ message: "Failed to load user profile" });
  }
};
