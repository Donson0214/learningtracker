import { z } from "zod";

const dateString = z.string().refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  { message: "Invalid date" }
);

export const createStudyGoalSchema = z.object({
  hoursPerWeek: z.number().int().positive(),
  targetDate: dateString.optional().nullable(),
});

export const updateStudyGoalSchema = z
  .object({
    hoursPerWeek: z.number().int().positive().optional(),
    targetDate: dateString.optional().nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
