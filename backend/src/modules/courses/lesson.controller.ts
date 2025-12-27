import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as lessonService from "./lesson.service";
import * as moduleService from "./module.service";
import { broadcast } from "../../realtime/realtime";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../../validators/course.schema";
import { buildValidationError } from "../../utils/validation";

export const createLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const module = await moduleService.getModuleByIdForOrg(
    req.params.moduleId,
    req.user.organizationId
  );
  if (!module) {
    return res.status(404).json({ message: "Module not found" });
  }

  const lesson = await lessonService.createLesson(
    req.params.moduleId,
    {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
    }
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "lessons.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.status(201).json(lesson);
};

export const updateLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const existing = await lessonService.getLessonByIdForOrg(
    req.params.lessonId,
    req.user.organizationId
  );
  if (!existing) {
    return res.status(404).json({ message: "Lesson not found" });
  }

  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const lesson = await lessonService.updateLesson(
    req.params.lessonId,
    parsed.data
  );

  if (req.user?.organizationId) {
    broadcast({
      type: "lessons.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json(lesson);
};

export const deleteLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(404).json({ message: "No organization assigned" });
  }

  const existing = await lessonService.getLessonByIdForOrg(
    req.params.lessonId,
    req.user.organizationId
  );
  if (!existing) {
    return res.status(404).json({ message: "Lesson not found" });
  }

  await lessonService.deleteLesson(req.params.lessonId);

  if (req.user?.organizationId) {
    broadcast({
      type: "lessons.changed",
      scope: { organizationId: req.user.organizationId },
    });
    broadcast({
      type: "modules.changed",
      scope: { organizationId: req.user.organizationId },
    });
  }

  res.json({ success: true });
};
