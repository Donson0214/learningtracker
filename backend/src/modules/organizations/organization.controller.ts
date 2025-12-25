import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as orgService from "./organization.service";
import { broadcast } from "../../realtime/realtime";
import { buildPaginationResponse, parsePagination } from "../../utils/pagination";

export const createOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Organization name required" });
  }

  const org = await orgService.createOrganization(name, req.user!.id);

  broadcast({
    type: "organizations.changed",
    scope: { userId: req.user!.id, organizationId: org.id },
  });

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

  if (!org) {
    return res.status(404).json({ message: "Organization not found" });
  }

  res.json(org);
};

export const getMyOrgMembers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });
  const { items, total, summary } =
    await orgService.getOrganizationMembersPaged(
      req.user.organizationId,
      { skip, take }
    );

  res.json({
    ...buildPaginationResponse(items, total, page, pageSize),
    summary,
  });
};

export const updateOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name } = req.body;

  await orgService.updateOrganization(
    req.user!.organizationId!,
    name
  );

  const org = await orgService.getOrganizationById(
    req.user!.organizationId!
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "organizations.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json(org);
};

export const deactivateOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await orgService.deactivateOrganization(
    req.user!.organizationId!
  );

  const org = await orgService.getOrganizationById(
    req.user!.organizationId!
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "organizations.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json(org);
};
