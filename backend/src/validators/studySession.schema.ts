import { z } from "zod";

const dateString = z.string().refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  { message: "Invalid date" }
);

export const createStudySessionSchema = z.object({
  courseId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1).optional().nullable(),
  durationMinutes: z.number().int().positive(),
  notes: z.string().trim().optional().nullable(),
  mood: z.string().trim().optional().nullable(),
  studiedAt: dateString,
});

export const updateStudySessionSchema = z
  .object({
    durationMinutes: z.number().int().positive().optional(),
    notes: z.string().trim().optional().nullable(),
    mood: z.string().trim().optional().nullable(),
    studiedAt: dateString.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
