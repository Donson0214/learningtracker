<template>
  <div>
    <div class="mb-6">
      <button
        type="button"
        class="text-sm text-gray-500 hover:text-gray-700 mb-3"
        @click="router.push('/courses')"
      >
        <- Back to courses
      </button>

      <div class="flex items-start justify-between gap-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-1">
            {{ course?.title || "Course" }}
          </h2>
          <p class="text-gray-500">
            {{ course?.description || "No description yet." }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="isEnrolled"
            class="border border-red-200 text-red-600 px-3 py-2 rounded-lg
                   text-xs font-medium hover:bg-red-50 disabled:opacity-70"
            :disabled="isDropping"
            @click="requestDropCourse"
          >
            {{ isDropping ? "Leaving..." : "Drop Course" }}
          </button>
          <button
            class="bg-gray-900 text-white px-4 py-2 rounded-lg
                   text-sm font-medium hover:bg-gray-800"
            @click="startSession()"
          >
            Log Session
          </button>
        </div>
      </div>
    </div>

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
      title="Loading course"
      message="Fetching course details."
    />

    <StateMessage
      v-else-if="!course"
      variant="empty"
      title="Course not found"
      message="Return to courses to choose another."
    />

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <p class="text-sm text-gray-500 mb-1">Progress</p>
          <p class="text-2xl font-semibold text-gray-900">
            {{ completionPercent }}%
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ completedLessons }} of {{ totalLessons }} lessons
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <p class="text-sm text-gray-500 mb-1">Modules</p>
          <p class="text-2xl font-semibold text-gray-900">
            {{ course.modules?.length ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Total modules</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <p class="text-sm text-gray-500 mb-1">Study Sessions</p>
          <p class="text-2xl font-semibold text-gray-900">
            {{ courseSessions.length }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Logged so far</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl">
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">Modules & Lessons</h3>
          <p class="text-sm text-gray-500">
            Track progress and log time per module
          </p>
        </div>
        <div class="p-4 space-y-4">
          <template v-if="moduleRows.length === 0">
            <StateMessage
              variant="empty"
              title="No modules yet"
              message="This course does not have modules yet."
            />
          </template>
          <template v-else>
            <div
              v-for="module in moduleRows"
              :key="module.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-semibold text-gray-900">
                    {{ module.title }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ module.completedLessons }} / {{ module.lessonCount }} lessons completed
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">
                    {{ module.percent }}%
                  </p>
                  <span
                    class="inline-flex items-center justify-center text-[11px] font-medium px-2 py-0.5 rounded-full"
                    :class="module.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : module.status === 'In progress'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'"
                  >
                    {{ module.status }}
                  </span>
                  <button
                    class="mt-2 text-xs text-gray-600 hover:text-gray-900"
                    @click="startSession(module.id)"
                  >
                    Log module session
                  </button>
                </div>
              </div>

              <div class="mt-3 space-y-2">
                <div
                  v-for="lesson in module.lessons"
                  :key="lesson.id"
                  class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-gray-900"
                      :checked="Boolean(lesson.isCompleted)"
                      :disabled="isLessonUpdating(lesson.id)"
                      @change="toggleLessonCompletion(lesson.id, Boolean(lesson.isCompleted))"
                    />
                    <div>
                      <p
                        class="text-sm font-medium"
                        :class="lesson.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'"
                      >
                        {{ lesson.title }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ lesson.estimatedMinutes }} min
                      </p>
                    </div>
                  </label>
                  <div class="flex items-center gap-2">
                    <button
                      class="text-xs text-gray-600 hover:text-gray-900"
                      @click="startSession(module.id)"
                    >
                      Log time
                    </button>
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

                <div v-if="module.lessons.length === 0" class="text-xs text-gray-500">
                  No lessons yet.
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirming="isDropping"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCoursesStore } from "@/features/courses/store";
import StateMessage from "@/components/ui/StateMessage.vue";
import { fetchStudySessions } from "@/features/study-sessions/api";
import { selfUnenroll, completeLesson, clearLessonCompletion } from "@/features/courses/api";
import type { Course, StudySession } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();

const course = ref<Course | null>(null);
const courseSessions = ref<StudySession[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const isDropping = ref(false);
const updatingLessonIds = ref<string[]>([]);
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Leave course",
  onConfirm: null as null | (() => Promise<void>),
});

const loadData = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    if (!coursesStore.initialized) {
      await coursesStore.loadEnrollments();
    }
    const courseId = route.params.courseId as string;
    course.value = await coursesStore.getCourse(courseId);
    courseSessions.value = await fetchStudySessions({ courseId });
  } catch (error) {
    errorMessage.value = "Unable to load course details.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadData, { intervalMs: 45000 });
useRealtimeRefresh(
  [
    "courses.changed",
    "modules.changed",
    "lessons.changed",
    "lessonProgress.changed",
    "studySessions.changed",
    "enrollments.changed",
  ],
  loadData
);

watch(
  () => route.params.courseId,
  () => loadData()
);

const courseId = computed(() => route.params.courseId as string);

const isEnrolled = computed(() =>
  coursesStore.enrolledCourseIds.includes(courseId.value)
);

const totalLessons = computed(() =>
  course.value?.modules?.reduce(
    (sum, module) => sum + (module.lessons?.length ?? 0),
    0
  ) ?? 0
);

const completedLessons = computed(() =>
  course.value?.modules?.reduce(
    (sum, module) =>
      sum + (module.lessons?.filter((lesson) => lesson.isCompleted).length ?? 0),
    0
  ) ?? 0
);

const completionPercent = computed(() => {
  if (!totalLessons.value) {
    return 0;
  }
  return Math.min(
    100,
    Math.round((completedLessons.value / totalLessons.value) * 100)
  );
});

const moduleRows = computed(() => {
  if (!course.value?.modules) {
    return [];
  }
  return course.value.modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const lessonCount = module.lessons?.length ?? 0;
      const completedLessons =
        module.lessons?.filter((lesson) => lesson.isCompleted).length ?? 0;
      const percent = lessonCount
        ? Math.min(
            100,
            Math.round((completedLessons / lessonCount) * 100)
          )
        : 0;
      const status =
        percent >= 100
          ? "Completed"
          : percent > 0
            ? "In progress"
            : "Not started";

      return {
        id: module.id,
        title: module.title,
        lessons: module.lessons ?? [],
        lessonCount,
        completedLessons,
        percent,
        status,
      };
    });
});

const startSession = (moduleId?: string) => {
  const courseId = route.params.courseId as string;
  router.push({
    path: "/study-sessions",
    query: {
      courseId,
      ...(moduleId ? { moduleId } : {}),
    },
  });
};

const openConfirm = (payload: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}) => {
  confirmDialog.value = {
    open: true,
    title: payload.title,
    message: payload.message,
    confirmLabel: payload.confirmLabel ?? "Leave course",
    onConfirm: payload.onConfirm,
  };
};

const closeConfirm = () => {
  confirmDialog.value.open = false;
  confirmDialog.value.onConfirm = null;
};

const handleConfirm = async () => {
  if (!confirmDialog.value.onConfirm) {
    return;
  }
  await confirmDialog.value.onConfirm();
  confirmDialog.value.open = false;
};

const requestDropCourse = () => {
  if (!courseId.value) {
    return;
  }
  openConfirm({
    title: "Leave course",
    message:
      "You will lose access to this course and its study plan items. You can re-enroll later.",
    confirmLabel: "Leave course",
    onConfirm: dropCourse,
  });
};

const dropCourse = async () => {
  if (!courseId.value) {
    return;
  }
  errorMessage.value = "";
  isDropping.value = true;
  try {
    await selfUnenroll(courseId.value);
    await coursesStore.loadEnrollments();
    router.push("/courses");
  } catch (error) {
    errorMessage.value = "Unable to leave this course.";
  } finally {
    isDropping.value = false;
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
    await loadData();
  } finally {
    updatingLessonIds.value = updatingLessonIds.value.filter(
      (id) => id !== lessonId
    );
  }
};
</script>
