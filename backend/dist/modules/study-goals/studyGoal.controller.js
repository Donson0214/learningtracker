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
exports.updateGoal = exports.createGoal = exports.getMyGoal = void 0;
const studyGoalService = __importStar(require("./studyGoal.service"));
const realtime_1 = require("../../realtime/realtime");
const studyGoal_schema_1 = require("../../validators/studyGoal.schema");
const validation_1 = require("../../utils/validation");
const getMyGoal = async (req, res) => {
    const goal = await studyGoalService.getLatestStudyGoal(req.user.id);
    if (!goal) {
        return res.status(404).json({ message: "Study goal not found" });
    }
    res.json(goal);
};
exports.getMyGoal = getMyGoal;
const createGoal = async (req, res) => {
    const parsed = studyGoal_schema_1.createStudyGoalSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const targetCompletionAt = parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : undefined;
    const goal = await studyGoalService.createStudyGoal(req.user.id, parsed.data.hoursPerWeek, targetCompletionAt);
    (0, realtime_1.broadcast)({
        type: "studyGoals.changed",
        scope: { userId: req.user.id },
    });
    res.status(201).json(goal);
};
exports.createGoal = createGoal;
const updateGoal = async (req, res) => {
    const parsed = studyGoal_schema_1.updateStudyGoalSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const targetCompletionAt = parsed.data.targetDate === null
        ? null
        : parsed.data.targetDate
            ? new Date(parsed.data.targetDate)
            : undefined;
    const result = await studyGoalService.updateStudyGoal(req.params.id, req.user.id, {
        hoursPerWeek: parsed.data.hoursPerWeek,
        targetCompletionAt,
    });
    if (result.count === 0) {
        return res.status(404).json({ message: "Study goal not found" });
    }
    (0, realtime_1.broadcast)({
        type: "studyGoals.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true });
};
exports.updateGoal = updateGoal;
