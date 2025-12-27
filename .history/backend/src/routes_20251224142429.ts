import { Router } from "express";

import orgRoutes from "./modules/organizations/organization.routes";
import courseRoutes from "./modules/courses/course.routes";
import enrollmentRoutes from "./modules/enrollments/enrollment.routes";
import studySessionRoutes from "./modules/study-sessions/studySession.routes";

// ✅ Add these
import studyGoalRoutes from "./modules/study-goals/studyGoal.routes";
import studyPlanRoutes from "./modules/study-plans/studyPlan.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import userRoutes from "./modules/users/user.routes";

const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

router.use("/organizations", orgRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/study-sessions", studySessionRoutes);

// ✅ required by spec
router.use("/study-goals", studyGoalRoutes);
router.use("/study-plans", studyPlanRoutes);
router.use("/notifications", notificationRoutes);

// ✅ required analytics feature
router.use("/analytics", analyticsRoutes);

// ✅ profile endpoint (useful)
router.use("/users", userRoutes);

export default router;
