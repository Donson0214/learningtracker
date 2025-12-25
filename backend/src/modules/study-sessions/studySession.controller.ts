import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyService from "./studySession.service";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import { broadcast } from "../../realtime/realtime";



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

  broadcast({
    type: "studySessions.changed",
    scope: { userId: req.user!.id },
  });
  if (session.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: session.course.organizationId },
    });
  }

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
  const existing = await studyService.getSessionById(
    req.params.id,
    req.user!.id
  );

  await studyService.updateStudySession(
    req.params.id,
    req.user!.id,
    req.body
  );

  broadcast({
    type: "studySessions.changed",
    scope: { userId: req.user!.id },
  });
  if (existing?.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: existing.course.organizationId },
    });
  }

  res.json({ success: true });
};

export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const existing = await studyService.getSessionById(
    req.params.id,
    req.user!.id
  );

  await studyService.deleteStudySession(
    req.params.id,
    req.user!.id
  );

  broadcast({
    type: "studySessions.changed",
    scope: { userId: req.user!.id },
  });
  if (existing?.course?.organizationId) {
    broadcast({
      type: "analytics.changed",
      scope: { organizationId: existing.course.organizationId },
    });
  }

  res.json({ success: true });
};
