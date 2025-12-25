"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireRole_1 = require("../../middlewares/requireRole");
const enrollment_controller_1 = require("./enrollment.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// LEARNER
router.get("/me", enrollment_controller_1.myEnrollments);
// ORG ADMIN
router.post("/", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.enrollLearner);
router.delete("/:id", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.unenrollLearner);
router.get("/course/:courseId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), enrollment_controller_1.courseEnrollments);
exports.default = router;
