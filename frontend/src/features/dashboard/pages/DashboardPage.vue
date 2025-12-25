<template>
  <div>
    <!-- Welcome -->
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Welcome back, {{ displayName }}!
    </h2>
    <p class="text-gray-500 mb-6">
      Track your learning progress and stay on top of your goals.
    </p>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Study Hours"
        :value="totalStudyHours"
        sub="All time"
        :icon="ClockIcon"
      />

      <StatCard
        label="This Week"
        :value="weeklyStudyHours"
        sub="Last 7 days"
        :icon="ArrowTrendingUpIcon"
      />

      <StatCard
        label="Completion"
        :value="completionRate"
        sub="Avg across courses"
        :icon="ChartBarIcon"
      />

      <StatCard
        label="Study Streak"
        :value="studyStreakLabel"
        sub="Keep it up!"
        :icon="FireIcon"
      />
    </div>

    <!-- Weekly chart -->
    <WeeklyStudyChart class="mb-10" :labels="weekLabels" :values="weekValues" />

    <!-- Course Progress -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">
        Course Progress
      </h3>

      <RouterLink
        to="/courses"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        View All
      </RouterLink>
    </div>

    <StateMessage
      v-if="isLoading"
      class="mb-10"
      variant="loading"
      title="Loading progress"
      message="Gathering your latest study data."
    />

    <StateMessage
      v-else-if="courseProgressCards.length === 0"
      class="mb-10"
      variant="empty"
      title="No courses yet"
      message="Enroll to start tracking progress."
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <CourseProgressCard
        v-for="course in courseProgressCards"
        :key="course.id"
        :title="course.title"
        :description="course.description"
        :percent="course.percent"
        :hours="course.estimatedHours"
        :to="`/courses/${course.courseId}`"
      />
    </div>

    <!-- Continue Learning CTA -->
    <ContinueLearningCTA />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/features/auth/store";
import { fetchLearnerDashboard } from "@/features/dashboard/api";
import { fetchMyEnrollments } from "@/features/courses/api";
import { fetchStudySessions } from "@/features/study-sessions/api";
import type { Enrollment, StudySession } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

import StatCard from "@/components/ui/StatCard.vue";
import WeeklyStudyChart from "@/components/charts/WeeklyStudyChart.vue";
import CourseProgressCard from "@/components/ui/CourseProgressCard.vue";
import ContinueLearningCTA from "@/components/ui/ContinueLearningCTA.vue";
import StateMessage from "@/components/ui/StateMessage.vue";

import {
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const enrollments = ref<Enrollment[]>([]);
const sessions = ref<StudySession[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const loadData = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await Promise.all([
      fetchLearnerDashboard(),
      fetchMyEnrollments().then((data) => {
        enrollments.value = data;
      }),
      fetchStudySessions().then((data) => {
        sessions.value = data;
      }),
    ]);
  } catch (error) {
    errorMessage.value = "Unable to load dashboard data.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadData, { intervalMs: 30000 });
useRealtimeRefresh(
  [
    "studySessions.changed",
    "enrollments.changed",
    "courses.changed",
    "studyPlans.changed",
    "studyGoals.changed",
    "analytics.changed",
  ],
  loadData
);

const displayName = computed(
  () => auth.user?.name || auth.user?.email || "Learner"
);

const totalStudyMinutes = computed(() =>
  sessions.value.reduce((sum, session) => sum + session.durationMinutes, 0)
);

const totalStudyHours = computed(() =>
  (totalStudyMinutes.value / 60).toFixed(1)
);

const weekRange = () => {
  const now = new Date();
  const start = new Date(now);
  const day = (now.getDay() + 6) % 7;
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
};

const weekValues = computed(() => {
  const { start, end } = weekRange();
  const values = Array.from({ length: 7 }, () => 0);

  sessions.value.forEach((session) => {
    const studiedAt = new Date(session.studiedAt);
    if (studiedAt < start || studiedAt >= end) {
      return;
    }
    const dayIndex = (studiedAt.getDay() + 6) % 7;
    values[dayIndex] += session.durationMinutes / 60;
  });

  return values.map((value) => Number(value.toFixed(1)));
});

const weeklyStudyHours = computed(() => {
  const sum = weekValues.value.reduce((total, value) => total + value, 0);
  return `${sum.toFixed(1)}h`;
});

const completionRate = computed(() => {
  if (!enrollments.value.length) {
    return "0%";
  }
  const minutesByCourse = new Map<string, number>();
  sessions.value.forEach((session) => {
    minutesByCourse.set(
      session.courseId,
      (minutesByCourse.get(session.courseId) ?? 0) + session.durationMinutes
    );
  });

  const totalPercent = enrollments.value.reduce((sum, enrollment) => {
    const course = enrollment.course;
    const estimatedMinutes = (course?.estimatedHours ?? 0) * 60;
    const completedMinutes = minutesByCourse.get(enrollment.courseId) ?? 0;
    const percent = estimatedMinutes
      ? Math.min(
          100,
          Math.round((completedMinutes / estimatedMinutes) * 100)
        )
      : 0;
    return sum + percent;
  }, 0);

  return `${Math.round(totalPercent / enrollments.value.length)}%`;
});

const studyStreakLabel = computed(() => {
  const dates = new Set(
    sessions.value.map((session) => {
      const date = new Date(session.studiedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dates.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return `${streak} day${streak === 1 ? "" : "s"}`;
});

const courseProgressCards = computed(() => {
  const minutesByCourse = new Map<string, number>();
  sessions.value.forEach((session) => {
    minutesByCourse.set(
      session.courseId,
      (minutesByCourse.get(session.courseId) ?? 0) + session.durationMinutes
    );
  });

  return enrollments.value.slice(0, 3).map((enrollment) => {
    const course = enrollment.course;
    const estimatedMinutes =
      (course?.estimatedHours ?? 0) * 60;
    const completedMinutes = minutesByCourse.get(enrollment.courseId) ?? 0;
    const percent = estimatedMinutes
      ? Math.min(
          100,
          Math.round((completedMinutes / estimatedMinutes) * 100)
        )
      : 0;

    return {
      id: enrollment.courseId,
      courseId: enrollment.courseId,
      title: course?.title ?? "Untitled course",
      description: course?.description ?? "No description yet.",
      estimatedHours: course?.estimatedHours ?? 0,
      percent,
    };
  });
});
</script>
