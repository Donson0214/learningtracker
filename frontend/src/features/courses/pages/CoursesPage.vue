<template>
  <div>
    <!-- Header -->
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      My Courses
    </h2>
    <p class="text-gray-500 mb-8">
      Browse and track your learning journey
    </p>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <StateMessage
      v-if="isLoading"
      variant="loading"
      title="Loading courses"
      message="Fetching your enrollments."
    />

    <StateMessage
      v-else-if="courseCards.length === 0"
      variant="empty"
      title="No courses yet"
      message="You are not enrolled in any courses."
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Courses Grid -->
      <CourseCard
        v-for="course in courseCards"
        :key="course.id"
        :title="course.title"
        :description="course.description"
        :percent="course.percent"
        :hours="course.estimatedHours"
        :modules="course.modules"
        :cta="course.cta"
        :to="`/courses/${course.courseId}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CourseCard from "@/components/ui/CourseCard.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { fetchStudySessions } from "@/features/study-sessions/api";
import type { StudySession } from "@/shared/types";
import { useCoursesStore } from "@/features/courses/store";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const coursesStore = useCoursesStore();
const enrollments = computed(() => coursesStore.enrollments);
const sessions = ref<StudySession[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const loadData = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const [, sessionData] = await Promise.all([
      coursesStore.loadEnrollments(),
      fetchStudySessions(),
    ]);
    sessions.value = sessionData;
  } catch (error) {
    errorMessage.value = "Unable to load courses.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadData, { intervalMs: 30000 });
useRealtimeRefresh(
  [
    "enrollments.changed",
    "courses.changed",
    "modules.changed",
    "lessons.changed",
    "studySessions.changed",
  ],
  loadData
);

const courseCards = computed(() => {
  const minutesByCourse = new Map<string, number>();
  sessions.value.forEach((session) => {
    minutesByCourse.set(
      session.courseId,
      (minutesByCourse.get(session.courseId) ?? 0) + session.durationMinutes
    );
  });

  return enrollments.value.map((enrollment) => {
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
      modules: course?.modules?.length ?? 0,
      percent,
      cta: percent > 0 ? "Continue" : "Start Course",
    };
  });
});
</script>
