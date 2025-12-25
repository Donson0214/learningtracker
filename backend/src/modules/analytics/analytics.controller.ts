import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as analyticsService from "./analytics.service";

export const learnerDashboard = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const dashboard = await analyticsService.getLearnerDashboard(
    req.user!.id
  );

  res.json(dashboard);
};

export const orgDashboard = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res
      .status(404)
      .json({ message: "Organization not found" });
  }

  const dashboard = await analyticsService.getOrgDashboard(
    req.user.organizationId
  );

  res.json(dashboard);
};
