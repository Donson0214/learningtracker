import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyService from "./studySession.service";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import { broadcast } from "../../realtime/realtime";
import { prisma } from "../../prisma";
import {
  createStudySessionSchema,
  updateStudySessionSchema,
} from "../../validators/studySession.schema";
import { buildValidationError } from "../../utils/validation";



export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = createStudySessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }
  const {
    courseId,
    moduleId,
    durationMinutes,
    notes,
    mood,
    studiedAt,
  } = parsed.data;

  try {
    await ensureUserEnrolled(req.user!.id, courseId);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }

  if (moduleId) {
    const module = await prisma.module.findFirst({
      where: { id: moduleId, courseId },
      select: { id: true },
    });
    if (!module) {
      return res
        .status(400)
        .json({ message: "Module does not belong to course" });
    }
  }

  const session = await studyService.createStudySession(
    req.user!.id,
    {
      courseId,
      moduleId: moduleId ?? undefined,
      durationMinutes,
      notes: notes ?? undefined,
      mood: mood ?? undefined,
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
  const { courseId, moduleId, limit } = req.query;

  if (courseId !== undefined && typeof courseId !== "string") {
    return res.status(400).json({ message: "courseId must be a string" });
  }
  if (moduleId !== undefined && typeof moduleId !== "string") {
    return res.status(400).json({ message: "moduleId must be a string" });
  }

  let parsedLimit: number | undefined;
  if (limit !== undefined) {
    const raw = Array.isArray(limit) ? limit[0] : limit;
    const parsed = Number(raw);
    if (
      !Number.isFinite(parsed) ||
      !Number.isInteger(parsed) ||
      parsed <= 0 ||
      parsed > 500
    ) {
      return res
        .status(400)
        .json({ message: "limit must be between 1 and 500" });
    }
    parsedLimit = Math.floor(parsed);
  }

  const sessions = await studyService.getSessionsForUser(req.user!.id, {
    courseId: courseId ? courseId : undefined,
    moduleId: moduleId ? moduleId : undefined,
    limit: parsedLimit,
  });

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
  if (!existing) {
    return res.status(404).json({ message: "Session not found" });
  }

  const parsed = updateStudySessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const { studiedAt, ...rest } = parsed.data;
  const updates = {
    ...rest,
    ...(studiedAt ? { studiedAt: new Date(studiedAt) } : {}),
  };

  await studyService.updateStudySession(
    req.params.id,
    req.user!.id,
    updates
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
  if (!existing) {
    return res.status(404).json({ message: "Session not found" });
  }

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
