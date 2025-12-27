import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as enrollmentService from "./enrollment.service";
import { broadcast } from "../../realtime/realtime";
import { prisma } from "../../prisma";
import { enrollSelfSchema } from "../../validators/enrollment.schema";
import { buildValidationError } from "../../utils/validation";

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

  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true, role: true },
    }),
    prisma.course.findFirst({
      where: { id: courseId, organizationId: req.user.organizationId },
      select: { id: true, organizationId: true },
    }),
  ]);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (user.organizationId !== req.user.organizationId) {
    return res
      .status(403)
      .json({ message: "User is not in your organization" });
  }

  if (user.role !== "LEARNER") {
    return res
      .status(400)
      .json({ message: "Only learners can be enrolled" });
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

export const enrollSelf = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = enrollSelfSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const course = await prisma.course.findFirst({
    where: {
      id: parsed.data.courseId,
      organizationId: req.user.organizationId,
    },
    select: { id: true, organizationId: true },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: req.user.id,
        courseId: course.id,
      },
    },
    select: { id: true },
  });
  if (existing) {
    return res.status(409).json({ message: "Already enrolled" });
  }

  const enrollment = await enrollmentService.enrollUser(
    req.user.id,
    course.id
  );

  if (enrollment.course?.organizationId) {
    broadcast({
      type: "enrollments.changed",
      scope: { organizationId: enrollment.course.organizationId },
    });
  }
  broadcast({
    type: "enrollments.changed",
    scope: { userId: req.user.id },
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
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const existing = await enrollmentService.getEnrollmentByIdForOrg(
    req.params.id,
    req.user.organizationId
  );
  if (!existing) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

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

export const unenrollSelf = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const courseId = req.params.courseId;
  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: req.user.id,
        courseId,
      },
    },
    include: { course: true },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  const deleted = await enrollmentService.unenrollUser(enrollment.id);

  if (deleted.course?.organizationId) {
    broadcast({
      type: "enrollments.changed",
      scope: { organizationId: deleted.course.organizationId },
    });
  }
  broadcast({
    type: "enrollments.changed",
    scope: { userId: req.user.id },
  });
  if (deleted.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: deleted.course.organizationId },
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
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const course = await prisma.course.findFirst({
    where: { id: req.params.courseId, organizationId: req.user.organizationId },
    select: { id: true },
  });
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

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
