import { defineStore } from "pinia";
import { computed, ref } from "vue";

type StudyTopic = {
  id: string;
  title: string;
  targetHours: number;
  completedHours: number;
};

export const useStudyPlanStore = defineStore("studyPlan", () => {
  const weeklyGoal = ref(12);
  const topics = ref<StudyTopic[]>([
    {
      id: "math",
      title: "Calculus II",
      targetHours: 4,
      completedHours: 2,
    },
    {
      id: "cs",
      title: "Algorithms",
      targetHours: 5,
      completedHours: 3,
    },
    {
      id: "history",
      title: "Modern History",
      targetHours: 3,
      completedHours: 1,
    },
  ]);

  const totalTarget = computed(() =>
    topics.value.reduce((total, topic) => total + topic.targetHours, 0)
  );
  const totalCompleted = computed(() =>
    topics.value.reduce((total, topic) => total + topic.completedHours, 0)
  );

  const completionRate = computed(() => {
    if (!totalTarget.value) {
      return 0;
    }
    return Math.round((totalCompleted.value / totalTarget.value) * 100);
  });

  const updateWeeklyGoal = (value: number) => {
    weeklyGoal.value = value;
  };

  const logHours = (id: string, hours: number) => {
    const entry = topics.value.find((topic) => topic.id === id);
    if (!entry) {
      return;
    }
    entry.completedHours = Math.min(
      entry.targetHours,
      Math.max(0, entry.completedHours + hours)
    );
  };

  return {
    weeklyGoal,
    topics,
    totalTarget,
    totalCompleted,
    completionRate,
    updateWeeklyGoal,
    logHours,
  };
});
