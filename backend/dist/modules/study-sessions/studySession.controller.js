"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.updateSession = exports.listMySessions = exports.createSession = void 0;
const studyService = __importStar(require("./studySession.service"));
const enrollment_guard_1 = require("../enrollments/enrollment.guard");
const realtime_1 = require("../../realtime/realtime");
const prisma_1 = require("../../prisma");
const studySession_schema_1 = require("../../validators/studySession.schema");
const validation_1 = require("../../utils/validation");
const createSession = async (req, res) => {
    const parsed = studySession_schema_1.createStudySessionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const { courseId, moduleId, durationMinutes, notes, mood, studiedAt, } = parsed.data;
    try {
        await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, courseId);
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
    if (moduleId) {
        const module = await prisma_1.prisma.module.findFirst({
            where: { id: moduleId, courseId },
            select: { id: true },
        });
        if (!module) {
            return res
                .status(400)
                .json({ message: "Module does not belong to course" });
        }
    }
    const session = await studyService.createStudySession(req.user.id, {
        courseId,
        moduleId: moduleId ?? undefined,
        durationMinutes,
        notes: notes ?? undefined,
        mood: mood ?? undefined,
        studiedAt: new Date(studiedAt),
    });
    (0, realtime_1.broadcast)({
        type: "studySessions.changed",
        scope: { userId: req.user.id },
    });
    if (session.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: session.course.organizationId },
        });
    }
    res.status(201).json(session);
};
exports.createSession = createSession;
const listMySessions = async (req, res) => {
    const { courseId, moduleId, limit } = req.query;
    if (courseId !== undefined && typeof courseId !== "string") {
        return res.status(400).json({ message: "courseId must be a string" });
    }
    if (moduleId !== undefined && typeof moduleId !== "string") {
        return res.status(400).json({ message: "moduleId must be a string" });
    }
    let parsedLimit;
    if (limit !== undefined) {
        const raw = Array.isArray(limit) ? limit[0] : limit;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed) ||
            !Number.isInteger(parsed) ||
            parsed <= 0 ||
            parsed > 500) {
            return res
                .status(400)
                .json({ message: "limit must be between 1 and 500" });
        }
        parsedLimit = Math.floor(parsed);
    }
    const sessions = await studyService.getSessionsForUser(req.user.id, {
        courseId: courseId ? courseId : undefined,
        moduleId: moduleId ? moduleId : undefined,
        limit: parsedLimit,
    });
    res.json(sessions);
};
exports.listMySessions = listMySessions;
const updateSession = async (req, res) => {
    const existing = await studyService.getSessionById(req.params.id, req.user.id);
    if (!existing) {
        return res.status(404).json({ message: "Session not found" });
    }
    const parsed = studySession_schema_1.updateStudySessionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const { studiedAt, ...rest } = parsed.data;
    const updates = {
        ...rest,
        ...(studiedAt ? { studiedAt: new Date(studiedAt) } : {}),
    };
    await studyService.updateStudySession(req.params.id, req.user.id, updates);
    (0, realtime_1.broadcast)({
        type: "studySessions.changed",
        scope: { userId: req.user.id },
    });
    if (existing?.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: existing.course.organizationId },
        });
    }
    res.json({ success: true });
};
exports.updateSession = updateSession;
const deleteSession = async (req, res) => {
    const existing = await studyService.getSessionById(req.params.id, req.user.id);
    if (!existing) {
        return res.status(404).json({ message: "Session not found" });
    }
    await studyService.deleteStudySession(req.params.id, req.user.id);
    (0, realtime_1.broadcast)({
        type: "studySessions.changed",
        scope: { userId: req.user.id },
    });
    if (existing?.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: existing.course.organizationId },
        });
    }
    res.json({ success: true });
};
exports.deleteSession = deleteSession;
