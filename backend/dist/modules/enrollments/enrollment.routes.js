"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireRole_1 = require("../../middlewares/requireRole");
const requireActiveOrganization_1 = require("../../middlewares/requireActiveOrganization");
const enrollment_controller_1 = require("./enrollment.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
router.use(requireActiveOrganization_1.requireActiveOrganization);
// LEARNER
router.get("/my", enrollment_controller_1.myEnrollments);
router.get("/me", enrollment_controller_1.myEnrollments);
router.post("/self", (0, requireRole_1.requireRole)(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]), enrollment_controller_1.enrollSelf);
router.delete("/self/:courseId", (0, requireRole_1.requireRole)(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]), enrollment_controller_1.unenrollSelf);
// ORG ADMIN
router.post("/", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.enrollLearner);
router.delete("/:id", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.unenrollLearner);
router.get("/course/:courseId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.courseEnrollments);
router.get("/user/:userId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.userEnrollments);
exports.default = router;
