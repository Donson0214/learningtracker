import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as courseService from "./course.service";
import { broadcast } from "../../realtime/realtime";
import { buildPaginationResponse, parsePagination } from "../../utils/pagination";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../../validators/course.schema";
import { buildValidationError } from "../../utils/validation";

export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const course = await courseService.createCourse(
    req.user!.organizationId!,
    parsed.data
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.status(201).json(course);
};

export const listCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const { page, pageSize, skip, take } = parsePagination(req.query);
  const includeModules = req.query.includeModules === "true";
  const { items, total } =
    req.user.role === "LEARNER"
      ? await courseService.getCoursesForLearnerPaged(
          req.user.id,
          { skip, take, includeModules }
        )
      : await courseService.getCoursesByOrgPaged(
          req.user.organizationId,
          { skip, take, includeModules }
        );

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const listCourseCatalog = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const { page, pageSize, skip, take } = parsePagination(req.query);
  const includeModules = req.query.includeModules === "true";

  const { items, total } = await courseService.getCoursesByOrgPaged(
    req.user.organizationId,
    { skip, take, includeModules }
  );

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const getCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const course =
    req.user.role === "LEARNER"
      ? await courseService.getCourseForLearnerById(
          req.params.id,
          req.user.id
        )
      : await courseService.getCourseById(
          req.params.id,
          req.user.organizationId
        );

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
};

export const updateCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  await courseService.updateCourse(
    req.params.id,
    req.user!.organizationId!,
    parsed.data
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json({ success: true });
};

export const deleteCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  await courseService.deleteCourse(
    req.params.id,
    req.user!.organizationId!
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json({ success: true });
};
