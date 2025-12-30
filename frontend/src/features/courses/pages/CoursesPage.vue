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
          <div
            v-for="course in courseCards"
            :key="course.id"
            class="space-y-3"
          >
            <CourseCard
              :title="course.title"
              :description="course.description"
              :percent="course.percent"
              :hours="course.estimatedHours"
              :modules="course.modules"
              :cta="course.cta"
              :to="`/courses/${course.courseId}`"
            />
            <button
              class="text-xs font-medium text-gray-600 hover:text-gray-900"
              @click="toggleCourseDetails(course.courseId)"
            >
              {{ isExpanded(course.courseId) ? "Hide modules" : "View modules" }}
            </button>
            <div
              v-if="isExpanded(course.courseId)"
              class="border border-gray-200 rounded-xl p-4 bg-white"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-gray-900">
                  Modules & Lessons
                </p>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="course.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : course.status === 'In progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'"
                >
                  {{ course.status }}
                </span>
              </div>

              <div v-if="course.moduleItems.length" class="space-y-3">
                <div
                  v-for="module in course.moduleItems"
                  :key="module.id"
                  class="border border-gray-100 rounded-lg p-3"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-gray-900">
                        {{ module.title }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ module.completedLessons }} / {{ module.lessonCount }} lessons completed
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-semibold text-gray-900">
                        {{ module.percent }}%
                      </p>
                      <span
                        class="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        :class="module.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : module.status === 'In progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'"
                      >
                        {{ module.status }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-2 space-y-1">
                    <div
                      v-for="lesson in module.lessons"
                      :key="lesson.id"
                      class="flex items-center justify-between text-xs text-gray-600"
                    >
                      <label class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-gray-900"
                          :checked="Boolean(lesson.isCompleted)"
                          :disabled="isLessonUpdating(lesson.id)"
                          @change="toggleLessonCompletion(lesson.id, Boolean(lesson.isCompleted))"
                        />
                        <span
                          :class="lesson.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'"
                        >
                          {{ lesson.title }}
                        </span>
                      </label>
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] text-gray-500">
                          {{ lesson.estimatedMinutes }} min
                        </span>
                        <span
                          class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          :class="lesson.isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'"
                        >
                          {{ lesson.isCompleted ? "Done" : "Pending" }}
                        </span>
                      </div>
                    </div>
                    <p v-if="module.lessons.length === 0" class="text-xs text-gray-500">
                      No lessons yet.
                    </p>
                  </div>
                </div>
              </div>

              <StateMessage
                v-else
                variant="empty"
                title="No modules yet"
                message="This course does not have modules yet."
              />
            </div>
          </div>
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
import { fetchCourseCatalog, selfEnroll, completeLesson, clearLessonCompletion } from "@/features/courses/api";
import type { Course } from "@/shared/types";
import { useCoursesStore } from "@/features/courses/store";
import { useAuthStore } from "@/features/auth/store";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const auth = useAuthStore();
const coursesStore = useCoursesStore();
const enrollments = computed(() => coursesStore.enrollments);
const catalogCourses = ref<Course[]>([]);
const enrollingCourseIds = ref<string[]>([]);
const updatingLessonIds = ref<string[]>([]);
const expandedCourseIds = ref<string[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const hasOrganization = computed(
  () => Boolean(auth.user?.organization?.isActive)
);

const loadData = async () => {
  if (!hasOrganization.value) {
    errorMessage.value = "";
    catalogCourses.value = [];
    isLoading.value = false;
    return;
  }
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const [, catalogResponse] = await Promise.all([
      coursesStore.loadEnrollments(),
      fetchCourseCatalog(),
    ]);
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
    "lessonProgress.changed",
  ],
  loadData
);

const courseCards = computed(() => {
  return enrollments.value.map((enrollment) => {
    const course = enrollment.course;
    const totalLessons =
      course?.modules?.reduce(
        (sum, module) => sum + (module.lessons?.length ?? 0),
        0
      ) ?? 0;
    const completedLessons =
      course?.modules?.reduce(
        (sum, module) =>
          sum + (module.lessons?.filter((lesson) => lesson.isCompleted).length ?? 0),
        0
      ) ?? 0;
    const percent = totalLessons
      ? Math.min(
          100,
          Math.round((completedLessons / totalLessons) * 100)
        )
      : 0;
    const status =
      percent >= 100
        ? "Completed"
        : percent > 0
          ? "In progress"
          : "Not started";
    const moduleItems =
      course?.modules
        ?.slice()
        .sort((a, b) => a.order - b.order)
        .map((module) => {
          const lessonCount = module.lessons?.length ?? 0;
          const completedModuleLessons =
            module.lessons?.filter((lesson) => lesson.isCompleted).length ?? 0;
          const modulePercent = lessonCount
            ? Math.min(
                100,
                Math.round(
                  (completedModuleLessons / lessonCount) * 100
                )
              )
            : 0;
          const moduleStatus =
            modulePercent >= 100
              ? "Completed"
              : modulePercent > 0
                ? "In progress"
                : "Not started";
          return {
            id: module.id,
            title: module.title,
            lessons: module.lessons ?? [],
            lessonCount,
            completedLessons: completedModuleLessons,
            percent: modulePercent,
            status: moduleStatus,
          };
        }) ?? [];

    return {
      id: enrollment.courseId,
      courseId: enrollment.courseId,
      title: course?.title ?? "Untitled course",
      description: course?.description ?? "No description yet.",
      estimatedHours: course?.estimatedHours ?? 0,
      modules: course?.modules?.length ?? 0,
      percent,
      status,
      moduleItems,
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

const isLessonUpdating = (lessonId: string) =>
  updatingLessonIds.value.includes(lessonId);

const toggleLessonCompletion = async (
  lessonId: string,
  isCompleted: boolean
) => {
  if (isLessonUpdating(lessonId)) {
    return;
  }
  errorMessage.value = "";
  updatingLessonIds.value = [...updatingLessonIds.value, lessonId];
  const nextCompleted = !isCompleted;
  coursesStore.setLessonCompletion(
    lessonId,
    nextCompleted,
    nextCompleted ? new Date().toISOString() : null
  );
  try {
    if (nextCompleted) {
      const result = await completeLesson(lessonId);
      coursesStore.setLessonCompletion(lessonId, true, result.completedAt);
    } else {
      await clearLessonCompletion(lessonId);
      coursesStore.setLessonCompletion(lessonId, false, null);
    }
  } catch (error) {
    errorMessage.value = "Unable to update lesson completion.";
    await coursesStore.loadEnrollments();
  } finally {
    updatingLessonIds.value = updatingLessonIds.value.filter(
      (id) => id !== lessonId
    );
  }
};

const isExpanded = (courseId: string) =>
  expandedCourseIds.value.includes(courseId);

const toggleCourseDetails = (courseId: string) => {
  if (isExpanded(courseId)) {
    expandedCourseIds.value = expandedCourseIds.value.filter(
      (id) => id !== courseId
    );
    return;
  }
  expandedCourseIds.value = [...expandedCourseIds.value, courseId];
};
</script>
