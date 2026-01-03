"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleStudyPlanItemSchema = exports.generateStudyPlanSchema = void 0;
const zod_1 = require("zod");
const dateString = zod_1.z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), { message: "Invalid date" });
exports.generateStudyPlanSchema = zod_1.z.object({
    courseIds: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1),
    hoursPerWeek: zod_1.z.number().positive(),
    targetDate: dateString,
});
exports.rescheduleStudyPlanItemSchema = zod_1.z.object({
    scheduledDate: dateString,
});
