import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { learnerDashboard, orgDashboard } from "./analytics.controller";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

// Learner analytics dashboard
router.get("/me", learnerDashboard);
router.get(
  "/org",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  orgDashboard
);

export default router;
