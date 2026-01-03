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
exports.reschedulePlanItem = exports.completePlanItem = exports.myPlans = exports.generatePlan = void 0;
const enrollment_guard_1 = require("../enrollments/enrollment.guard");
const studyPlanService = __importStar(require("./studyPlan.service"));
const realtime_1 = require("../../realtime/realtime");
const studyPlan_schema_1 = require("../../validators/studyPlan.schema");
const validation_1 = require("../../utils/validation");
const generatePlan = async (req, res) => {
    const parsed = studyPlan_schema_1.generateStudyPlanSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const { courseIds, hoursPerWeek, targetDate } = parsed.data;
    const parsedTargetDate = new Date(targetDate);
    try {
        for (const courseId of courseIds) {
            await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, courseId);
        }
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
    const plan = await studyPlanService.createStudyPlan(req.user.id, courseIds, hoursPerWeek, parsedTargetDate);
    (0, realtime_1.broadcast)({
        type: "studyPlans.changed",
        scope: { userId: req.user.id },
    });
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
    (0, realtime_1.broadcast)({
        type: "studyPlanItems.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true });
};
exports.completePlanItem = completePlanItem;
const reschedulePlanItem = async (req, res) => {
    const parsed = studyPlan_schema_1.rescheduleStudyPlanItemSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const result = await studyPlanService.reschedulePlanItem(req.params.itemId, req.user.id, new Date(parsed.data.scheduledDate));
    if (result.count === 0) {
        return res.status(404).json({ message: "Plan item not found" });
    }
    (0, realtime_1.broadcast)({
        type: "studyPlanItems.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true });
};
exports.reschedulePlanItem = reschedulePlanItem;
