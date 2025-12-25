import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as courseService from "./course.service";
import { broadcast } from "../../realtime/realtime";
import { buildPaginationResponse, parsePagination } from "../../utils/pagination";

export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { title, description, estimatedHours } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const course = await courseService.createCourse(
    req.user!.organizationId!,
    { title, description, estimatedHours }
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
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const includeModules = req.query.includeModules === "true";
  const { items, total } = await courseService.getCoursesByOrgPaged(
    req.user!.organizationId!,
    { skip, take, includeModules }
  );

  res.json(buildPaginationResponse(items, total, page, pageSize));
};

export const getCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const course = await courseService.getCourseById(
    req.params.id,
    req.user!.organizationId!
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
  await courseService.updateCourse(
    req.params.id,
    req.user!.organizationId!,
    req.body
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
