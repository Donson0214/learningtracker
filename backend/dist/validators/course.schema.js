"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonSchema = exports.createLessonSchema = exports.updateModuleSchema = exports.createModuleSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "Title is required"),
    description: zod_1.z.string().trim().optional().nullable(),
    estimatedHours: zod_1.z
        .number()
        .int()
        .nonnegative()
        .optional()
        .nullable(),
});
exports.updateCourseSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().trim().optional().nullable(),
    estimatedHours: zod_1.z
        .number()
        .int()
        .nonnegative()
        .optional()
        .nullable(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
});
exports.createModuleSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "Title is required"),
    order: zod_1.z.number().int().positive(),
});
exports.updateModuleSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).optional(),
    order: zod_1.z.number().int().positive().optional(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
});
exports.createLessonSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "Title is required"),
    estimatedMinutes: zod_1.z.number().int().positive(),
});
exports.updateLessonSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
});
