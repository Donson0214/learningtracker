"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const analytics_controller_1 = require("./analytics.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// Learner analytics dashboard
router.get("/me", analytics_controller_1.learnerDashboard);
exports.default = router;
