import type { ZodError } from "zod";

export const buildValidationError = (error: ZodError) => ({
  message: "Invalid request payload",
  details: error.flatten().fieldErrors,
});
