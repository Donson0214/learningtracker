import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as orgService from "./organization.service";

export const createOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Organization name required" });
  }

  const org = await orgService.createOrganization(name, req.user!.id);

  res.status(201).json(org);
};

export const getMyOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const org = await orgService.getOrganizationById(
    req.user.organizationId
  );

  res.json(org);
};

export const updateOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name } = req.body;

  const org = await orgService.updateOrganization(
    req.user!.organizationId!,
    name
  );

  res.json(org);
};

export const deactivateOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const org = await orgService.deactivateOrganization(
    req.user!.organizationId!
  );

  res.json(org);
};
