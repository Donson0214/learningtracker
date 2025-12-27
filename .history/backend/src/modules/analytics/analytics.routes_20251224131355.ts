import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { learnerDashboard } from "./analytics.controller";

const router = Router();

router.use(requireAuth);

// Learner analytics dashboard
router.get("/me", learnerDashboard);

export default router;
