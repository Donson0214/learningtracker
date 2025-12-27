import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as lessonService from "./lesson.service";

export const createLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { title, content, estimatedMinutes, order } = req.body;

  if (!title || order === undefined) {
    return res.status(400).json({ message: "Title and order required" });
  }

  const lesson = await lessonService.createLesson(
    req.params.moduleId,
    { title, content, estimatedMinutes, order }
  );

  res.status(201).json(lesson);
};

export const updateLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const lesson = await lessonService.updateLesson(
    req.params.lessonId,
    req.body
  );

  res.json(lesson);
};

export const deleteLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await lessonService.deleteLesson(req.params.lessonId);

  res.json({ success: true });
};
