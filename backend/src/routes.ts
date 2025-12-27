import { Router } from "express";

import orgRoutes from "./modules/organizations/organization.routes";
import inviteRoutes from "./modules/invites/invite.routes";
import courseRoutes from "./modules/courses/course.routes";
import enrollmentRoutes from "./modules/enrollments/enrollment.routes";
import studySessionRoutes from "./modules/study-sessions/studySession.routes";

// ✅ Add these
import studyGoalRoutes from "./modules/study-goals/studyGoal.routes";
import studyPlanRoutes from "./modules/study-plans/studyPlan.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import reminderRoutes from "./modules/notifications/reminder.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import userRoutes from "./modules/users/user.routes";
import systemRoutes from "./modules/system/system.routes";
import { requireAuth } from "./middlewares/requireAuth";
import { requireRole } from "./middlewares/requireRole";
import { requireActiveOrganization } from "./middlewares/requireActiveOrganization";
import { createLesson } from "./modules/courses/lesson.controller";

const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

router.use("/organizations", orgRoutes);
router.use("/invites", inviteRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/study-sessions", studySessionRoutes);

// ✅ required by spec
router.use("/study-goals", studyGoalRoutes);
router.use("/study-plans", studyPlanRoutes);
router.use("/notifications", notificationRoutes);
router.use("/notifications/reminders", reminderRoutes);

// ✅ required analytics feature
router.use("/analytics", analyticsRoutes);

// ✅ profile endpoint (useful)
router.use("/users", userRoutes);
router.use("/system", systemRoutes);

// Legacy/alternate lesson endpoint
router.post(
  "/modules/:moduleId/lessons",
  requireAuth,
  requireActiveOrganization,
  requireRole(["ORG_ADMIN"]),
  createLesson
);

export default router;
