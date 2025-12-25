import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { learnerDashboard, orgDashboard } from "./analytics.controller";

const router = Router();

router.use(requireAuth);

// Learner analytics dashboard
router.get("/me", learnerDashboard);
router.get(
  "/org",
  requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]),
  orgDashboard
);

export default router;
