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
exports.completePlanItem = exports.myPlans = exports.generatePlan = void 0;
const enrollment_guard_1 = require("../enrollments/enrollment.guard");
const studyPlanService = __importStar(require("./studyPlan.service"));
const generatePlan = async (req, res) => {
    const { courseIds, hoursPerWeek, targetDate } = req.body;
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ message: "courseIds is required" });
    }
    if (!hoursPerWeek || typeof hoursPerWeek !== "number") {
        return res
            .status(400)
            .json({ message: "hoursPerWeek is required" });
    }
    const parsedTargetDate = new Date(targetDate);
    if (!targetDate || Number.isNaN(parsedTargetDate.getTime())) {
        return res.status(400).json({ message: "targetDate is invalid" });
    }
    try {
        for (const courseId of courseIds) {
            await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, courseId);
        }
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
    const plan = await studyPlanService.createStudyPlan(req.user.id, courseIds, hoursPerWeek, parsedTargetDate);
    res.status(201).json(plan);
};
exports.generatePlan = generatePlan;
const myPlans = async (req, res) => {
    const plans = await studyPlanService.getMyStudyPlans(req.user.id);
    res.json(plans);
};
exports.myPlans = myPlans;
const completePlanItem = async (req, res) => {
    const result = await studyPlanService.markPlanItemComplete(req.params.itemId, req.user.id);
    if (result.count === 0) {
        return res.status(404).json({ message: "Plan item not found" });
    }
    res.json({ success: true });
};
exports.completePlanItem = completePlanItem;
