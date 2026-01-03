"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudyGoalSchema = exports.createStudyGoalSchema = void 0;
const zod_1 = require("zod");
const dateString = zod_1.z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), { message: "Invalid date" });
exports.createStudyGoalSchema = zod_1.z.object({
    hoursPerWeek: zod_1.z.number().int().positive(),
    targetDate: dateString.optional().nullable(),
});
exports.updateStudyGoalSchema = zod_1.z
    .object({
    hoursPerWeek: zod_1.z.number().int().positive().optional(),
    targetDate: dateString.optional().nullable(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
});
