interface Lesson {
  id: string;
  estimatedMinutes: number;
  moduleId: string;
  courseId: string;
}

interface StudyPlanInput {
  lessons: Lesson[];
  startDate: Date;
  endDate: Date;
  minutesPerWeek: number;
}

export interface StudyPlanItemInput {
  courseId: string;
  moduleId?: string;
  scheduledDate: Date;
  durationMinutes: number;
}

export const generateStudyPlan = ({
  lessons,
  startDate,
  endDate,
  minutesPerWeek,
}: StudyPlanInput): StudyPlanItemInput[] => {
  const days =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const minutesPerDay = Math.floor(minutesPerWeek / 7);
  const plan: StudyPlanItemInput[] = [];

  let currentDate = new Date(startDate);

  for (const lesson of lessons) {
    let remaining = lesson.estimatedMinutes;

    while (remaining > 0) {
      plan.push({
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        scheduledDate: new Date(currentDate),
        durationMinutes: Math.min(minutesPerDay, remaining),
      });

      remaining -= minutesPerDay;
      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > endDate) break;
    }
  }

  return plan;
};
