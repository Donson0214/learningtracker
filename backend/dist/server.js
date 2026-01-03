"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // dY`^ MUST BE FIRST
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const notification_scheduler_1 = require("./modules/notifications/notification.scheduler");
const realtime_1 = require("./realtime/realtime");
const PORT = process.env.PORT || 4000;
const server = http_1.default.createServer(app_1.default);
(0, realtime_1.initRealtimeServer)(server);
server.listen(PORT, () => {
    console.log(`dYs? Server running on port ${PORT}`);
    (0, notification_scheduler_1.startNotificationScheduler)();
});
