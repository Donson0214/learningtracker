"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const notification_controller_1 = require("./notification.controller");
const notification_token_controller_1 = require("./notification.token.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// list notifications
router.get("/me", notification_controller_1.myNotifications);
// mark read
router.post("/:id/read", notification_controller_1.markRead);
// save device token (separate controller to avoid breaking your file)
router.post("/device-token", notification_token_controller_1.saveDeviceTokenHandler);
exports.default = router;
