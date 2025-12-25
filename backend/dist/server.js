"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // 👈 MUST BE FIRST
const app_1 = __importDefault(require("./app"));
const notification_scheduler_1 = require("./modules/notifications/notification.scheduler");
const PORT = process.env.PORT || 4000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    (0, notification_scheduler_1.startNotificationScheduler)();
});
