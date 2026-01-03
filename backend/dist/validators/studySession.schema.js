"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudySessionSchema = exports.createStudySessionSchema = void 0;
const zod_1 = require("zod");
const dateString = zod_1.z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), { message: "Invalid date" });
exports.createStudySessionSchema = zod_1.z.object({
    courseId: zod_1.z.string().trim().min(1),
    moduleId: zod_1.z.string().trim().min(1).optional().nullable(),
    durationMinutes: zod_1.z.number().int().positive(),
    notes: zod_1.z.string().trim().optional().nullable(),
    mood: zod_1.z.string().trim().optional().nullable(),
    studiedAt: dateString,
});
exports.updateStudySessionSchema = zod_1.z
    .object({
    durationMinutes: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().trim().optional().nullable(),
    mood: zod_1.z.string().trim().optional().nullable(),
    studiedAt: dateString.optional(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
});
