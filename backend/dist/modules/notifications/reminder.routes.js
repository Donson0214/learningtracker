"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireRole_1 = require("../../middlewares/requireRole");
const reminder_controller_1 = require("./reminder.controller");
const requireActiveOrganization_1 = require("../../middlewares/requireActiveOrganization");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
router.use(requireActiveOrganization_1.requireActiveOrganization);
router.use((0, requireRole_1.requireRole)(["ORG_ADMIN", "SYSTEM_ADMIN"]));
// manual trigger
router.post("/send", reminder_controller_1.sendReminders);
exports.default = router;
