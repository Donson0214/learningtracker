import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  createOrg,
  getMyOrg,
  getMyOrgMembers,
  updateOrg,
  deactivateOrg,
  activateOrg,
  removeOrgMember,
  deleteOrg,
} from "./organization.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  createOrg
);

router.get(
  "/me",
  requireAuth,
  getMyOrg
);

router.get(
  "/me/members",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  getMyOrgMembers
);

router.delete(
  "/me/members/:memberId",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  removeOrgMember
);

router.put(
  "/",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  updateOrg
);

router.delete(
  "/",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  deactivateOrg
);

router.delete(
  "/permanent",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  deleteOrg
);

router.patch(
  "/activate",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  activateOrg
);

export default router;
