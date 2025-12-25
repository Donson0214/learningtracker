import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as lessonService from "./lesson.service";
import { broadcast } from "../../realtime/realtime";

export const createLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { title, estimatedMinutes } = req.body;

  if (!title || estimatedMinutes === undefined) {
    return res
      .status(400)
      .json({ message: "Title and estimatedMinutes required" });
  }

  const lesson = await lessonService.createLesson(
    req.params.moduleId,
    { title, estimatedMinutes }
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
  const { title, estimatedMinutes } = req.body;

  const lesson = await lessonService.updateLesson(
    req.params.lessonId,
    { title, estimatedMinutes }
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
