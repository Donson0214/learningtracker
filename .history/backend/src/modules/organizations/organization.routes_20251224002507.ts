import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  createOrg,
  getMyOrg,
  updateOrg,
  deactivateOrg,
} from "./organization.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["ORG_ADMIN"]),
  createOrg
);

router.get(
  "/me",
  requireAuth,
  getMyOrg
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

export default router;
