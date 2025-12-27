import { Router } from "express";

import orgRoutes from "./modules/organizations/organization.routes";
import courseRoutes from "./modules/courses/course.routes";
import enrollmentRoutes from "./modules/enrollments/enrollment.routes";
import studySessionRoutes from "./modules/study-sessions/studySession.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import studyPlanRoutes from "./modules/study-plans/studyPlan.routes";
import notificationRoutes from "./modules/notifications/notification.routes";

const router = Router();

// Health check
router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// Core modules
router.use("/organizations", orgRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/study-sessions", studySessionRoutes);

// Advanced features
router.use("/analytics", analyticsRoutes);
router.use("/study-plans", studyPlanRoutes);
router.use("/notifications", notificationRoutes);

export default router;
