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
  rescheduleFrom?: Date;
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
  rescheduleFrom,
}: StudyPlanInput): StudyPlanItemInput[] => {
  const plan: StudyPlanItemInput[] = [];

  if (minutesPerWeek <= 0 || startDate > endDate) {
    return plan;
  }

  const scheduleStart =
    rescheduleFrom && rescheduleFrom > startDate
      ? rescheduleFrom
      : startDate;
  let currentDate = new Date(scheduleStart);
  const dailyCap = Math.ceil(minutesPerWeek / 7);

  let currentWeekIndex = 0;
  let minutesScheduledThisWeek = 0;

  for (const lesson of lessons) {
    let remaining = lesson.estimatedMinutes;

    while (remaining > 0) {
      if (currentDate > endDate) break;

      const daysFromStart = Math.floor(
        (currentDate.getTime() - scheduleStart.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const weekIndex = Math.floor(daysFromStart / 7);
      if (weekIndex !== currentWeekIndex) {
        currentWeekIndex = weekIndex;
        minutesScheduledThisWeek = 0;
      }

      const weekRemaining = Math.max(
        0,
        minutesPerWeek - minutesScheduledThisWeek
      );
      if (weekRemaining === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const minutesForDay = Math.min(
        remaining,
        weekRemaining,
        dailyCap
      );

      plan.push({
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        scheduledDate: new Date(currentDate),
        durationMinutes: minutesForDay,
      });

      remaining -= minutesForDay;
      minutesScheduledThisWeek += minutesForDay;
      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > endDate) break;
    }
  }

  return plan;
};
