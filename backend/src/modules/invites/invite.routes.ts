import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";
import {
  acceptInvite,
  acceptInviteById,
  createInvite,
  declineInviteById,
  listInvites,
  listMyInvites,
  revokeInvite,
} from "./invite.controller";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

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
router.get("/me", listMyInvites);
router.delete(
  "/:id",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  revokeInvite
);
router.post("/accept", acceptInvite);
router.post("/:id/accept", acceptInviteById);
router.post("/:id/decline", declineInviteById);

export default router;
