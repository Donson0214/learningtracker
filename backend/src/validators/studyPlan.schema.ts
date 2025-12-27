import { z } from "zod";

const dateString = z.string().refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  { message: "Invalid date" }
);

export const generateStudyPlanSchema = z.object({
  courseIds: z.array(z.string().trim().min(1)).min(1),
  hoursPerWeek: z.number().positive(),
  targetDate: dateString,
});

export const rescheduleStudyPlanItemSchema = z.object({
  scheduledDate: dateString,
});
