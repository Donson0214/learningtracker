"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudyPlan = void 0;
const generateStudyPlan = ({ lessons, startDate, endDate, minutesPerWeek, }) => {
    const minutesPerDay = Math.floor(minutesPerWeek / 7);
    const plan = [];
    if (minutesPerDay <= 0 || startDate > endDate) {
        return plan;
    }
    let currentDate = new Date(startDate);
    for (const lesson of lessons) {
        let remaining = lesson.estimatedMinutes;
        while (remaining > 0) {
            if (currentDate > endDate) {
                break;
            }
            plan.push({
                courseId: lesson.courseId,
                moduleId: lesson.moduleId,
                scheduledDate: new Date(currentDate),
                durationMinutes: Math.min(minutesPerDay, remaining),
            });
            remaining -= minutesPerDay;
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate > endDate)
                break;
        }
    }
    return plan;
};
exports.generateStudyPlan = generateStudyPlan;
