import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyService from "./studySession.service";

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    courseId,
    moduleId,
    durationMinutes,
    notes,
    mood,
    studiedAt,
  } = req.body;

  if (!courseId || !durationMinutes || !studiedAt) {
    return res.status(400).json({
      message: "courseId, durationMinutes, and studiedAt are required",
    });
  }

  const session = await studyService.createStudySession(
    req.user!.id,
    {
      courseId,
      moduleId,
      durationMinutes,
      notes,
      mood,
      studiedAt: new Date(studiedAt),
    }
  );

  res.status(201).json(session);
};

export const listMySessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const sessions = await studyService.getSessionsForUser(
    req.user!.id
  );

  res.json(sessions);
};

export const updateSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await studyService.updateStudySession(
    req.params.id,
    req.user!.id,
    req.body
  );

  res.json({ success: true });
};

export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await studyService.deleteStudySession(
    req.params.id,
    req.user!.id
  );

  res.json({ success: true });
};
