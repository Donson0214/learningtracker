import { Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AuthenticatedRequest } from "./requireAuth";

export const requireActiveOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.organizationId) {
    return next();
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { isActive: true },
    });

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!org.isActive) {
      return res.status(403).json({ message: "Organization is inactive" });
    }

    return next();
  } catch (error) {
    console.error("Organization status check failed:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify organization status" });
  }
};
