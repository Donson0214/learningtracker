import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { buildPaginationResponse, parsePagination } from "../../utils/pagination";
import { broadcast } from "../../realtime/realtime";
import * as systemService from "./system.service";
import * as orgService from "../organizations/organization.service";
import { notifyOrganizationUsers } from "../notifications/notification.service";

export const listOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });

  const { items, total } = await systemService.listOrganizationsPaged({
    skip,
    take,
  });

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const org = await systemService.getOrganizationSummaryById(
    req.params.id
  );

  if (!org) {
    return res.status(404).json({ message: "Organization not found" });
  }

  res.json(org);
};

export const listOrganizationMembers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });

  const { items, total } =
    await systemService.listOrganizationMembersPaged(req.params.id, {
      skip,
      take,
    });

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const listOrganizationCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });
  const includeModules = req.query.includeModules === "true";

  const { items, total } =
    await systemService.listOrganizationCoursesPaged(req.params.id, {
      skip,
      take,
      includeModules,
    });

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const listMembers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });

  const { items, total } = await systemService.listMembersPaged({
    skip,
    take,
  });

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const listCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page, pageSize, skip, take } = parsePagination(req.query, {
    pageSize: 20,
    maxPageSize: 100,
  });
  const includeModules = req.query.includeModules === "true";

  const { items, total } = await systemService.listCoursesPaged({
    skip,
    take,
    includeModules,
  });

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const activateOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const updated = await systemService.setOrganizationActive(
    req.params.id,
    true
  );

  if (!updated) {
    return res.status(404).json({ message: "Organization not found" });
  }

  broadcast({
    type: "organizations.changed",
    scope: { organizationId: updated.id },
  });
  broadcast({ type: "system.organizations.changed" });
  broadcast({ type: "system.analytics.changed" });

  res.json(updated);
};

export const deactivateOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const updated = await systemService.setOrganizationActive(
    req.params.id,
    false
  );

  if (!updated) {
    return res.status(404).json({ message: "Organization not found" });
  }

  const notifiedUserIds = await notifyOrganizationUsers(
    updated.id,
    "Organization paused",
    "Your organization has been paused by an administrator.",
    {
      excludeRoles: ["ORG_ADMIN", "SYSTEM_ADMIN"],
    }
  );

  broadcast({
    type: "organizations.changed",
    scope: { organizationId: updated.id },
  });
  broadcast({ type: "system.organizations.changed" });
  broadcast({ type: "system.analytics.changed" });

  notifiedUserIds.forEach((userId) => {
    broadcast({
      type: "notifications.changed",
      scope: { userId },
    });
  });

  res.json(updated);
};

export const deleteOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const organizationId = req.params.id;

  const notifiedUserIds = await notifyOrganizationUsers(
    organizationId,
    "Organization deleted",
    "Your organization has been permanently deleted by a system administrator.",
    {
      excludeRoles: ["ORG_ADMIN", "SYSTEM_ADMIN"],
    }
  );

  const deleted = await orgService.deleteOrganization(organizationId);

  if (!deleted) {
    return res.status(404).json({ message: "Organization not found" });
  }

  broadcast({
    type: "organizations.changed",
    scope: { organizationId },
  });
  broadcast({ type: "system.organizations.changed" });
  broadcast({ type: "system.analytics.changed" });
  broadcast({
    type: "users.changed",
    scope: { organizationId },
  });
  broadcast({
    type: "enrollments.changed",
    scope: { organizationId },
  });

  notifiedUserIds.forEach((userId) => {
    broadcast({
      type: "notifications.changed",
      scope: { userId },
    });
  });

  res.json({ success: true });
};

export const getSystemAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const analytics = await systemService.getSystemAnalytics();
  res.json(analytics);
};
