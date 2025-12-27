import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../config/firebase";
import { prisma } from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    organizationId: string | null;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
