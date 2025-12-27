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

    <NoOrganizationState v-if="!hasOrganization" class="mb-6" />

    <StateMessage
      v-else-if="isLoading"
      variant="loading"
      title="Loading courses"
      message="Fetching your enrollments."
    />

    <div v-else>
      <section class="mb-10">
        <StateMessage
          v-if="courseCards.length === 0"
          variant="empty"
          title="No courses yet"
          message="You are not enrolled in any courses."
        />

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Available Courses
          </h3>
          <span class="text-sm text-gray-500">
            Enroll to start tracking progress.
          </span>
        </div>

        <StateMessage
          v-if="availableCourseCards.length === 0"
          variant="empty"
          title="No courses to enroll"
          message="You're already enrolled in all available courses."
        />

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CourseCard
            v-for="course in availableCourseCards"
            :key="course.id"
            :title="course.title"
            :description="course.description"
            :percent="course.percent"
            :hours="course.estimatedHours"
            :modules="course.modules"
            :cta="course.cta"
            :disabled="course.disabled"
            @action="() => enrollCourse(course.courseId)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import CourseCard from "@/components/ui/CourseCard.vue";
import NoOrganizationState from "@/components/ui/NoOrganizationState.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { fetchStudySessions } from "@/features/study-sessions/api";
import { fetchCourseCatalog, selfEnroll } from "@/features/courses/api";
import type { Course, StudySession } from "@/shared/types";
import { useCoursesStore } from "@/features/courses/store";
import { useAuthStore } from "@/features/auth/store";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const auth = useAuthStore();
const coursesStore = useCoursesStore();
const enrollments = computed(() => coursesStore.enrollments);
const sessions = ref<StudySession[]>([]);
const catalogCourses = ref<Course[]>([]);
const enrollingCourseIds = ref<string[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const hasOrganization = computed(
  () => Boolean(auth.user?.organization)
);

const loadData = async () => {
  if (!hasOrganization.value) {
    errorMessage.value = "";
    sessions.value = [];
    catalogCourses.value = [];
    isLoading.value = false;
    return;
  }
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const [, sessionData, catalogResponse] = await Promise.all([
      coursesStore.loadEnrollments(),
      fetchStudySessions(),
      fetchCourseCatalog(),
    ]);
    sessions.value = sessionData;
    catalogCourses.value = catalogResponse.items;
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

const availableCourseCards = computed(() => {
  const enrolledIds = new Set(
    coursesStore.enrolledCourseIds
  );
  return catalogCourses.value
    .filter((course) => !enrolledIds.has(course.id))
    .map((course) => {
      const modules =
        course.modulesCount ??
        course.modules?.length ??
        0;
      const isEnrolling = enrollingCourseIds.value.includes(
        course.id
      );
      return {
        id: course.id,
        courseId: course.id,
        title: course.title ?? "Untitled course",
        description: course.description ?? "No description yet.",
        estimatedHours: course.estimatedHours ?? 0,
        modules,
        percent: 0,
        disabled: isEnrolling,
        cta: isEnrolling ? "Enrolling..." : "Enroll",
      };
    });
});

const enrollCourse = async (courseId: string) => {
  if (enrollingCourseIds.value.includes(courseId)) {
    return;
  }
  errorMessage.value = "";
  enrollingCourseIds.value = [
    ...enrollingCourseIds.value,
    courseId,
  ];
  try {
    await selfEnroll(courseId);
    await loadData();
  } catch (error) {
    errorMessage.value = "Unable to enroll in this course.";
  } finally {
    enrollingCourseIds.value =
      enrollingCourseIds.value.filter((id) => id !== courseId);
  }
};
</script>
