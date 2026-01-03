"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_routes_1 = __importDefault(require("./modules/organizations/organization.routes"));
const invite_routes_1 = __importDefault(require("./modules/invites/invite.routes"));
const course_routes_1 = __importDefault(require("./modules/courses/course.routes"));
const enrollment_routes_1 = __importDefault(require("./modules/enrollments/enrollment.routes"));
const studySession_routes_1 = __importDefault(require("./modules/study-sessions/studySession.routes"));
// ✅ Add these
const studyGoal_routes_1 = __importDefault(require("./modules/study-goals/studyGoal.routes"));
const studyPlan_routes_1 = __importDefault(require("./modules/study-plans/studyPlan.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const reminder_routes_1 = __importDefault(require("./modules/notifications/reminder.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const system_routes_1 = __importDefault(require("./modules/system/system.routes"));
const requireAuth_1 = require("./middlewares/requireAuth");
const requireRole_1 = require("./middlewares/requireRole");
const requireActiveOrganization_1 = require("./middlewares/requireActiveOrganization");
const lesson_controller_1 = require("./modules/courses/lesson.controller");
const router = (0, express_1.Router)();
router.get("/health", (_, res) => {
    res.json({ status: "OK" });
});
router.use("/organizations", organization_routes_1.default);
router.use("/invites", invite_routes_1.default);
router.use("/courses", course_routes_1.default);
router.use("/enrollments", enrollment_routes_1.default);
router.use("/study-sessions", studySession_routes_1.default);
// ✅ required by spec
router.use("/study-goals", studyGoal_routes_1.default);
router.use("/study-plans", studyPlan_routes_1.default);
router.use("/notifications", notification_routes_1.default);
router.use("/notifications/reminders", reminder_routes_1.default);
// ✅ required analytics feature
router.use("/analytics", analytics_routes_1.default);
// ✅ profile endpoint (useful)
router.use("/users", user_routes_1.default);
router.use("/system", system_routes_1.default);
// Legacy/alternate lesson endpoint
router.post("/modules/:moduleId/lessons", requireAuth_1.requireAuth, requireActiveOrganization_1.requireActiveOrganization, (0, requireRole_1.requireRole)(["ORG_ADMIN"]), lesson_controller_1.createLesson);
exports.default = router;
