import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  acceptInvite,
  createInvite,
  listInvites,
  revokeInvite,
} from "./invite.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  createInvite
);
router.get(
  "/",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  listInvites
);
router.delete(
  "/:id",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  revokeInvite
);
router.post("/accept", acceptInvite);

export default router;
