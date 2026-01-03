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
exports.clearLessonCompletion = exports.completeLesson = void 0;
const enrollment_guard_1 = require("../enrollments/enrollment.guard");
const realtime_1 = require("../../realtime/realtime");
const lessonProgressService = __importStar(require("./lessonProgress.service"));
const completeLesson = async (req, res) => {
    const lessonId = req.params.lessonId;
    const lesson = await lessonProgressService.getLessonCourseId(lessonId);
    if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
    }
    try {
        await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, lesson.courseId);
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
    const progress = await lessonProgressService.completeLesson(req.user.id, lessonId);
    (0, realtime_1.broadcast)({
        type: "lessonProgress.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true, completedAt: progress.completedAt });
};
exports.completeLesson = completeLesson;
const clearLessonCompletion = async (req, res) => {
    const lessonId = req.params.lessonId;
    const lesson = await lessonProgressService.getLessonCourseId(lessonId);
    if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
    }
    try {
        await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, lesson.courseId);
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
    await lessonProgressService.clearLessonCompletion(req.user.id, lessonId);
    (0, realtime_1.broadcast)({
        type: "lessonProgress.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true });
};
exports.clearLessonCompletion = clearLessonCompletion;
