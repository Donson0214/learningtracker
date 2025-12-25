import { generateStudyPlan } from "../src/modules/study-plans/studyPlan.generator";

describe("generateStudyPlan", () => {
  it("distributes lesson minutes across days until endDate", () => {
    const startDate = new Date("2025-01-01T00:00:00.000Z");
    const endDate = new Date("2025-01-07T00:00:00.000Z"); // 7 days
    const minutesPerWeek = 7 * 60; // 60 mins/day

    const lessons = [
      {
        id: "lesson-1",
        estimatedMinutes: 120,
        moduleId: "module-1",
        courseId: "course-1",
      },
      {
        id: "lesson-2",
        estimatedMinutes: 60,
        moduleId: "module-1",
        courseId: "course-1",
      },
    ];

    const items = generateStudyPlan({
      lessons,
      startDate,
      endDate,
      minutesPerWeek,
    });

    // Total minutes should be >= total lesson minutes, but split by minutesPerDay chunks
    const totalPlanned = items.reduce((sum, i) => sum + i.durationMinutes, 0);
    expect(totalPlanned).toBeGreaterThanOrEqual(180);

    // Should schedule starting on startDate
    expect(items[0].scheduledDate.toISOString()).toBe(startDate.toISOString());

    // Each item should not exceed 60 minutes/day chunk
    for (const item of items) {
      expect(item.durationMinutes).toBeLessThanOrEqual(60);
    }
  });

  it("never schedules beyond endDate", () => {
    const startDate = new Date("2025-01-01T00:00:00.000Z");
    const endDate = new Date("2025-01-02T00:00:00.000Z"); // only 2 days
    const minutesPerWeek = 7 * 60; // 60 mins/day

    const lessons = [
      {
        id: "lesson-1",
        estimatedMinutes: 5000, // huge
        moduleId: "module-1",
        courseId: "course-1",
      },
    ];

    const items = generateStudyPlan({
      lessons,
      startDate,
      endDate,
      minutesPerWeek,
    });

    const latest = items.reduce((max, i) => (i.scheduledDate > max ? i.scheduledDate : max), startDate);
    expect(latest.getTime()).toBeLessThanOrEqual(endDate.getTime());
  });
});
