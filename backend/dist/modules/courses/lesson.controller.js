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
const createLesson = async (req, res) => {
    const { title, estimatedMinutes } = req.body;
    if (!title || estimatedMinutes === undefined) {
        return res
            .status(400)
            .json({ message: "Title and estimatedMinutes required" });
    }
    const lesson = await lessonService.createLesson(req.params.moduleId, { title, estimatedMinutes });
    res.status(201).json(lesson);
};
exports.createLesson = createLesson;
const updateLesson = async (req, res) => {
    const { title, estimatedMinutes } = req.body;
    const lesson = await lessonService.updateLesson(req.params.lessonId, { title, estimatedMinutes });
    res.json(lesson);
};
exports.updateLesson = updateLesson;
const deleteLesson = async (req, res) => {
    await lessonService.deleteLesson(req.params.lessonId);
    res.json({ success: true });
};
exports.deleteLesson = deleteLesson;
