import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().nullable(),
  estimatedHours: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .nullable(),
});

export const updateCourseSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    estimatedHours: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const createModuleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  order: z.number().int().positive(),
});

export const updateModuleSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    order: z.number().int().positive().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const createLessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  estimatedMinutes: z.number().int().positive(),
});

export const updateLessonSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    estimatedMinutes: z.number().int().positive().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
