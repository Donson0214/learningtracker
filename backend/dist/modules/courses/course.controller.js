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
exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.listCourses = exports.createCourse = void 0;
const courseService = __importStar(require("./course.service"));
const createCourse = async (req, res) => {
    const { title, description, estimatedHours } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    const course = await courseService.createCourse(req.user.organizationId, { title, description, estimatedHours });
    res.status(201).json(course);
};
exports.createCourse = createCourse;
const listCourses = async (req, res) => {
    const courses = await courseService.getCoursesByOrg(req.user.organizationId);
    res.json(courses);
};
exports.listCourses = listCourses;
const getCourse = async (req, res) => {
    const course = await courseService.getCourseById(req.params.id, req.user.organizationId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
};
exports.getCourse = getCourse;
const updateCourse = async (req, res) => {
    await courseService.updateCourse(req.params.id, req.user.organizationId, req.body);
    res.json({ success: true });
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    await courseService.deleteCourse(req.params.id, req.user.organizationId);
    res.json({ success: true });
};
exports.deleteCourse = deleteCourse;
