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
exports.courseEnrollments = exports.myEnrollments = exports.unenrollLearner = exports.enrollLearner = void 0;
const enrollmentService = __importStar(require("./enrollment.service"));
const enrollLearner = async (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({
            message: "userId and courseId are required",
        });
    }
    const enrollment = await enrollmentService.enrollUser(userId, courseId);
    res.status(201).json(enrollment);
};
exports.enrollLearner = enrollLearner;
const unenrollLearner = async (req, res) => {
    await enrollmentService.unenrollUser(req.params.id);
    res.json({ success: true });
};
exports.unenrollLearner = unenrollLearner;
const myEnrollments = async (req, res) => {
    const enrollments = await enrollmentService.getEnrollmentsForUser(req.user.id);
    res.json(enrollments);
};
exports.myEnrollments = myEnrollments;
const courseEnrollments = async (req, res) => {
    const enrollments = await enrollmentService.getEnrollmentsForCourse(req.params.courseId);
    res.json(enrollments);
};
exports.courseEnrollments = courseEnrollments;
