import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import { broadcast } from "../../realtime/realtime";
import * as lessonProgressService from "./lessonProgress.service";

export const completeLesson = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const lessonId = req.params.lessonId;
  const lesson = await lessonProgressService.getLessonCourseId(lessonId);

  if (!lesson) {
    return res.status(404).json({ message: "Lesson not found" });
  }

  try {
    await ensureUserEnrolled(req.user!.id, lesson.courseId);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }

  const progress = await lessonProgressService.completeLesson(
    req.user!.id,
    lessonId
  );

  broadcast({
    type: "lessonProgress.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true, completedAt: progress.completedAt });
};

export const clearLessonCompletion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const lessonId = req.params.lessonId;
  const lesson = await lessonProgressService.getLessonCourseId(lessonId);

  if (!lesson) {
    return res.status(404).json({ message: "Lesson not found" });
  }

  try {
    await ensureUserEnrolled(req.user!.id, lesson.courseId);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }

  await lessonProgressService.clearLessonCompletion(
    req.user!.id,
    lessonId
  );

  broadcast({
    type: "lessonProgress.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};
