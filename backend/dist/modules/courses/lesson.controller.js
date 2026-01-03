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
exports.deleteLesson = exports.updateLesson = exports.createLesson = void 0;
const lessonService = __importStar(require("./lesson.service"));
const moduleService = __importStar(require("./module.service"));
const realtime_1 = require("../../realtime/realtime");
const course_schema_1 = require("../../validators/course.schema");
const validation_1 = require("../../utils/validation");
const createLesson = async (req, res) => {
    const parsed = course_schema_1.createLessonSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const module = await moduleService.getModuleByIdForOrg(req.params.moduleId, req.user.organizationId);
    if (!module) {
        return res.status(404).json({ message: "Module not found" });
    }
    const lesson = await lessonService.createLesson(req.params.moduleId, {
        title: parsed.data.title,
        estimatedMinutes: parsed.data.estimatedMinutes,
    });
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "lessons.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.status(201).json(lesson);
};
exports.createLesson = createLesson;
const updateLesson = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const existing = await lessonService.getLessonByIdForOrg(req.params.lessonId, req.user.organizationId);
    if (!existing) {
        return res.status(404).json({ message: "Lesson not found" });
    }
    const parsed = course_schema_1.updateLessonSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const lesson = await lessonService.updateLesson(req.params.lessonId, parsed.data);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "lessons.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json(lesson);
};
exports.updateLesson = updateLesson;
const deleteLesson = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const existing = await lessonService.getLessonByIdForOrg(req.params.lessonId, req.user.organizationId);
    if (!existing) {
        return res.status(404).json({ message: "Lesson not found" });
    }
    await lessonService.deleteLesson(req.params.lessonId);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "lessons.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json({ success: true });
};
exports.deleteLesson = deleteLesson;
