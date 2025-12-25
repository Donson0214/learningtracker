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
const createSession = async (req, res) => {
    const { courseId, moduleId, durationMinutes, notes, mood, studiedAt, } = req.body;
    if (!courseId || !durationMinutes || !studiedAt) {
        return res.status(400).json({
            message: "courseId, durationMinutes, and studiedAt are required",
        });
    }
    const session = await studyService.createStudySession(req.user.id, {
        courseId,
        moduleId,
        durationMinutes,
        notes,
        mood,
        studiedAt: new Date(studiedAt),
    });
    res.status(201).json(session);
};
exports.createSession = createSession;
const listMySessions = async (req, res) => {
    const sessions = await studyService.getSessionsForUser(req.user.id);
    res.json(sessions);
};
exports.listMySessions = listMySessions;
const updateSession = async (req, res) => {
    await studyService.updateStudySession(req.params.id, req.user.id, req.body);
    res.json({ success: true });
};
exports.updateSession = updateSession;
const deleteSession = async (req, res) => {
    await studyService.deleteStudySession(req.params.id, req.user.id);
    res.json({ success: true });
};
exports.deleteSession = deleteSession;
