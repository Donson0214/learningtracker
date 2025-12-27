import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as moduleService from "./module.service";
import * as courseService from "./course.service";
import { broadcast } from "../../realtime/realtime";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../../validators/course.schema";
import { buildValidationError } from "../../utils/validation";

export const createModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = createModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const course = await courseService.getCourseById(
    req.params.courseId,
    req.user.organizationId
  );
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const module = await moduleService.createModule(req.params.courseId, {
    title: parsed.data.title,
    order: parsed.data.order,
  });

  if (req.user?.organizationId) {
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.status(201).json(module);
};

export const listModules = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (req.user?.role === "LEARNER") {
    try {
      await ensureUserEnrolled(req.user.id, req.params.courseId);
    } catch (error: any) {
      return res.status(403).json({ message: error.message });
    }
  } else {
    if (!req.user?.organizationId) {
      return res.status(404).json({ message: "No organization assigned" });
    }
    const course = await courseService.getCourseById(
      req.params.courseId,
      req.user.organizationId
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
  }

  const modules = await moduleService.getModulesByCourse(
    req.params.courseId
  );

  res.json(modules);
};

export const updateModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const existing = await moduleService.getModuleByIdForOrg(
    req.params.moduleId,
    req.user.organizationId
  );
  if (!existing) {
    return res.status(404).json({ message: "Module not found" });
  }

  const parsed = updateModuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const module = await moduleService.updateModule(
    req.params.moduleId,
    parsed.data
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json(module);
};

export const deleteModule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const existing = await moduleService.getModuleByIdForOrg(
    req.params.moduleId,
    req.user.organizationId
  );
  if (!existing) {
    return res.status(404).json({ message: "Module not found" });
  }

  await moduleService.deleteModule(req.params.moduleId);

  if (req.user?.organizationId) {
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "courses.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json({ success: true });
};
