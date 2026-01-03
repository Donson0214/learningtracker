"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireRole_1 = require("../../middlewares/requireRole");
const analytics_controller_1 = require("./analytics.controller");
const requireActiveOrganization_1 = require("../../middlewares/requireActiveOrganization");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
router.use(requireActiveOrganization_1.requireActiveOrganization);
// Learner analytics dashboard
router.get("/me", analytics_controller_1.learnerDashboard);
router.get("/org", (0, requireRole_1.requireRole)(["ORG_ADMIN", "SYSTEM_ADMIN"]), analytics_controller_1.orgDashboard);
exports.default = router;
