import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as enrollmentService from "./enrollment.service";
import { broadcast } from "../../realtime/realtime";

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

  if (enrollment.course?.organizationId) {
    broadcast({
      type: "enrollments.changed",
      scope: { organizationId: enrollment.course.organizationId },
    });
  }
  broadcast({
    type: "enrollments.changed",
    scope: { userId },
  });
  if (enrollment.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: enrollment.course.organizationId },
    });
  }

  res.status(201).json(enrollment);
};

export const unenrollLearner = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const enrollment = await enrollmentService.unenrollUser(req.params.id);

  if (enrollment.course?.organizationId) {
    broadcast({
      type: "enrollments.changed",
      scope: { organizationId: enrollment.course.organizationId },
    });
  }
  broadcast({
    type: "enrollments.changed",
    scope: { userId: enrollment.userId },
  });
  if (enrollment.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: enrollment.course.organizationId },
    });
  }

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

export const userEnrollments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const enrollments =
    await enrollmentService.getEnrollmentsForUserInOrg(
      req.params.userId,
      organizationId
    );

  res.json(enrollments);
};
