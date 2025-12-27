import { z } from "zod";

export const enrollSelfSchema = z.object({
  courseId: z.string().trim().min(1),
});
