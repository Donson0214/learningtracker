import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as enrollmentService from "./enrollment.service";

export const enrollLearner = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({
      message: "userId and courseId are required",
    });
  }

  const enrollment = await enrollmentService.enrollUser(
    userId,
    courseId
  );

  res.status(201).json(enrollment);
};

export const unenrollLearner = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await enrollmentService.unenrollUser(req.params.id);

  res.json({ success: true });
};

export const myEnrollments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const enrollments = await enrollmentService.getEnrollmentsForUser(
    req.user!.id
  );

  res.json(enrollments);
};

export const courseEnrollments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const enrollments =
    await enrollmentService.getEnrollmentsForCourse(
      req.params.courseId
    );

  res.json(enrollments);
};
