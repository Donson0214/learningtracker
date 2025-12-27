import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as orgService from "./organization.service";
import { broadcast } from "../../realtime/realtime";
import { buildPaginationResponse, parsePagination } from "../../utils/pagination";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../../validators/organization.schema";
import { buildValidationError } from "../../utils/validation";

export const createOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = createOrganizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }
  const { name } = parsed.data;

  if (req.user?.organizationId) {
    return res
      .status(409)
      .json({ message: "Organization already assigned" });
  }

  const nextRole =
    req.user?.role === "LEARNER" ? "ORG_ADMIN" : req.user!.role;
  const result = await orgService.createOrganization(
    name,
    req.user!.id,
    nextRole
  );
  const org = await orgService.getOrganizationById(
    result.organization.id
  );

  broadcast({
    type: "organizations.changed",
    scope: { userId: req.user!.id, organizationId: result.organization.id },
  });
  broadcast({
    type: "users.changed",
    scope: { userId: req.user!.id },
  });

  res.status(201).json(org ?? result.organization);
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
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }
  const parsed = updateOrganizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  await orgService.updateOrganization(
    req.user!.organizationId!,
    parsed.data.name
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
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

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

export const activateOrg = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  await orgService.activateOrganization(
    req.user.organizationId
  );

  const org = await orgService.getOrganizationById(
    req.user.organizationId
  );

  if (req.user.organizationId) {
    broadcast({
      type: "organizations.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json(org);
};

export const removeOrgMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  if (req.user.id === req.params.memberId) {
    return res.status(400).json({ message: "You cannot remove yourself" });
  }

  const result = await orgService.removeOrganizationMember(
    req.user.organizationId,
    req.params.memberId
  );

  if (result.status === "not_found") {
    return res.status(404).json({ message: "Member not found" });
  }

  if (result.status === "forbidden") {
    if (result.reason === "system_admin") {
      return res.status(403).json({ message: "Cannot remove system admin" });
    }
    return res.status(409).json({ message: "Cannot remove last admin" });
  }

  broadcast({
    type: "users.changed",
    scope: { organizationId: req.user.organizationId },
  });
  broadcast({
    type: "enrollments.changed",
    scope: { organizationId: req.user.organizationId },
  });
  broadcast({
    type: "organizations.changed",
    scope: { organizationId: req.user.organizationId },
  });

  res.json({ success: true });
};
