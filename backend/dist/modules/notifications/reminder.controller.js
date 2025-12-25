"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReminders = void 0;
const reminder_service_1 = require("./reminder.service");
const sendReminders = async (_req, res) => {
    const result = await (0, reminder_service_1.sendStudyPlanReminders)();
    res.json(result);
};
exports.sendReminders = sendReminders;
