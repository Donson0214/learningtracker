<script setup lang="ts">
import { computed, ref } from "vue";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BookOpenIcon,
  SquaresPlusIcon,
} from "@heroicons/vue/24/outline";
import Modal from "@/components/ui/Modal.vue";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import PaginationControls from "@/components/ui/PaginationControls.vue";
import type { Course, Module, Lesson } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useAdminCoursesStore } from "./store";

const coursesStore = useAdminCoursesStore();
const courses = computed(() => coursesStore.courses);
const isLoading = computed(() => coursesStore.isLoading);
const errorMessage = computed(() => coursesStore.errorMessage);
const page = computed(() => coursesStore.page);
const pageSize = computed(() => coursesStore.pageSize);
const total = computed(() => coursesStore.total);
const totalPages = computed(() => coursesStore.totalPages);

const selectedCourseId = ref<string | null>(null);
const showCourseModal = ref(false);
const showModuleModal = ref(false);
const showLessonModal = ref(false);

const courseForm = ref({
  id: "",
  title: "",
  description: "",
  estimatedHours: 0,
});

const moduleForm = ref({
  id: "",
  title: "",
  order: 1,
});

const lessonForm = ref({
  id: "",
  moduleId: "",
  title: "",
  estimatedMinutes: 30,
});

const isSaving = ref(false);
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Delete",
  onConfirm: null as null | (() => Promise<void>),
});
const isConfirming = ref(false);

const loadCourses = async (options: { page?: number; force?: boolean } = {}) => {
  await coursesStore.loadCourses({
    page: options.page ?? page.value,
    pageSize: pageSize.value,
    includeModules: true,
    force: options.force,
  });
};

useAutoRefresh(() => loadCourses({ force: true }), { intervalMs: 60000 });
useRealtimeRefresh(
  ["courses.changed", "modules.changed", "lessons.changed"],
  () => loadCourses({ force: true })
);

const selectedCourse = computed(() =>
  courses.value.find((course) => course.id === selectedCourseId.value)
);

const openCreateCourse = () => {
  courseForm.value = {
    id: "",
    title: "",
    description: "",
    estimatedHours: 0,
  };
  showCourseModal.value = true;
};

const openEditCourse = (course: Course) => {
  courseForm.value = {
    id: course.id,
    title: course.title,
    description: course.description ?? "",
    estimatedHours: course.estimatedHours ?? 0,
  };
  showCourseModal.value = true;
};

const saveCourse = async () => {
  if (!courseForm.value.title.trim()) {
    coursesStore.clearError();
    coursesStore.errorMessage = "Course title is required.";
    return;
  }
  isSaving.value = true;
  try {
    if (courseForm.value.id) {
      await coursesStore.updateCourseEntry(courseForm.value.id, {
        title: courseForm.value.title,
        description: courseForm.value.description,
        estimatedHours: courseForm.value.estimatedHours || null,
      });
    } else {
      await coursesStore.createCourseEntry({
        title: courseForm.value.title,
        description: courseForm.value.description,
        estimatedHours: courseForm.value.estimatedHours || null,
      });
    }
    showCourseModal.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isSaving.value = false;
  }
};

const removeCourse = async (courseId: string) => {
  await coursesStore.deleteCourseEntry(courseId);
  if (selectedCourseId.value === courseId) {
    selectedCourseId.value = null;
  }
};

const openCreateModule = () => {
  if (!selectedCourse.value) return;
  moduleForm.value = {
    id: "",
    title: "",
    order: selectedCourse.value.modules?.length
      ? selectedCourse.value.modules.length + 1
      : 1,
  };
  showModuleModal.value = true;
};

const openEditModule = (module: Module) => {
  moduleForm.value = {
    id: module.id,
    title: module.title,
    order: module.order,
  };
  showModuleModal.value = true;
};

const saveModule = async () => {
  if (!selectedCourse.value) return;
  if (!moduleForm.value.title.trim()) {
    coursesStore.clearError();
    coursesStore.errorMessage = "Module title is required.";
    return;
  }
  const orderValue = Number(moduleForm.value.order);
  if (!Number.isFinite(orderValue) || orderValue <= 0) {
    coursesStore.clearError();
    coursesStore.errorMessage = "Module order must be a positive number.";
    return;
  }
  isSaving.value = true;
  try {
    if (moduleForm.value.id) {
      await coursesStore.updateModuleEntry(moduleForm.value.id, {
        title: moduleForm.value.title,
        order: orderValue,
      });
    } else {
      await coursesStore.createModuleEntry(selectedCourse.value.id, {
        title: moduleForm.value.title,
        order: orderValue,
      });
    }
    showModuleModal.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isSaving.value = false;
  }
};

const removeModule = async (moduleId: string) => {
  await coursesStore.deleteModuleEntry(moduleId);
};

const openCreateLesson = (moduleId: string) => {
  lessonForm.value = {
    id: "",
    moduleId,
    title: "",
    estimatedMinutes: 30,
  };
  showLessonModal.value = true;
};

const openEditLesson = (lesson: Lesson) => {
  lessonForm.value = {
    id: lesson.id,
    moduleId: lesson.moduleId,
    title: lesson.title,
    estimatedMinutes: lesson.estimatedMinutes,
  };
  showLessonModal.value = true;
};

const saveLesson = async () => {
  if (!lessonForm.value.title.trim()) {
    coursesStore.clearError();
    coursesStore.errorMessage = "Lesson title is required.";
    return;
  }
  const minutesValue = Number(lessonForm.value.estimatedMinutes);
  if (!Number.isFinite(minutesValue) || minutesValue <= 0) {
    coursesStore.clearError();
    coursesStore.errorMessage = "Estimated minutes must be a positive number.";
    return;
  }
  isSaving.value = true;
  try {
    if (lessonForm.value.id) {
      await coursesStore.updateLessonEntry(lessonForm.value.id, {
        title: lessonForm.value.title,
        estimatedMinutes: minutesValue,
      });
    } else {
      await coursesStore.createLessonEntry(lessonForm.value.moduleId, {
        title: lessonForm.value.title,
        estimatedMinutes: minutesValue,
      });
    }
    showLessonModal.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isSaving.value = false;
  }
};

const removeLesson = async (lessonId: string) => {
  await coursesStore.deleteLessonEntry(lessonId);
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
    confirmLabel: payload.confirmLabel ?? "Delete",
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
  isConfirming.value = true;
  try {
    await confirmDialog.value.onConfirm();
    confirmDialog.value.open = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isConfirming.value = false;
  }
};

const requestDeleteCourse = (course: Course) => {
  openConfirm({
    title: "Delete course",
    message: `Delete "${course.title}" and all its modules? This cannot be undone.`,
    confirmLabel: "Delete course",
    onConfirm: () => removeCourse(course.id),
  });
};

const requestDeleteModule = (module: Module) => {
  openConfirm({
    title: "Delete module",
    message: `Delete "${module.title}" and all its lessons? This cannot be undone.`,
    confirmLabel: "Delete module",
    onConfirm: () => removeModule(module.id),
  });
};

const requestDeleteLesson = (lesson: Lesson) => {
  openConfirm({
    title: "Delete lesson",
    message: `Delete "${lesson.title}"? This cannot be undone.`,
    confirmLabel: "Delete lesson",
    onConfirm: () => removeLesson(lesson.id),
  });
};

const goToPage = async (targetPage: number) => {
  if (targetPage < 1 || targetPage > totalPages.value) {
    return;
  }
  selectedCourseId.value = null;
  await loadCourses({ page: targetPage });
};
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Course Management
        </h2>
        <p class="text-gray-500">
          Manage courses, modules, and lessons
        </p>
      </div>

      <button
        class="flex items-center gap-2
               bg-gray-900 text-white
               px-4 py-2 rounded-lg
               text-sm font-medium
               hover:bg-gray-800"
        @click="openCreateCourse"
      >
        <PlusIcon class="h-4 w-4" />
        Add Course
      </button>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">All Courses</h3>
        <p class="text-sm text-gray-500">
          Manage your organization's course catalog
        </p>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Course Name</th>
            <th class="text-left px-4 py-3">Description</th>
            <th class="text-left px-4 py-3">Duration</th>
            <th class="text-left px-4 py-3">Modules</th>
            <th class="text-left px-4 py-3">Status</th>
            <th class="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="6"
            variant="loading"
            title="Loading courses"
            message="Fetching your catalog."
          />
          <TableStateRow
            v-else-if="courses.length === 0 && total > 0"
            :colspan="6"
            variant="empty"
            title="No courses on this page"
            message="Try navigating to a previous page."
          />
          <TableStateRow
            v-else-if="courses.length === 0"
            :colspan="6"
            variant="empty"
            title="No courses yet"
            message="Create a course to get started."
          />
          <tr
            v-for="course in courses"
            :key="course.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 font-medium text-gray-900">
                <BookOpenIcon class="h-4 w-4 text-gray-500" />
                {{ course.title }}
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ course.description || "No description yet." }}
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ course.estimatedHours ?? 0 }}h
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ course.modulesCount ?? course.modules?.length ?? 0 }}
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-gray-100 text-gray-700
                       text-xs font-medium"
              >
                Active
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="openEditCourse(course)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="requestDeleteCourse(course)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="selectedCourseId = course.id"
                >
                  <SquaresPlusIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <PaginationControls
        :page="page"
        :page-size="pageSize"
        :total="total"
        :total-pages="totalPages"
        :is-loading="isLoading"
        @prev="goToPage(page - 1)"
        @next="goToPage(page + 1)"
      />
    </div>

    <div v-if="selectedCourse" class="mt-6 bg-white border border-gray-200 rounded-xl p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-900">
            Modules for {{ selectedCourse.title }}
          </h3>
          <p class="text-sm text-gray-500">
            Manage modules and lessons for this course.
          </p>
        </div>
        <button
          class="flex items-center gap-2 text-sm text-gray-700
                 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          @click="openCreateModule"
        >
          <PlusIcon class="h-4 w-4" />
          Add Module
        </button>
      </div>

      <div v-if="selectedCourse.modules?.length" class="space-y-4">
        <div
          v-for="module in selectedCourse.modules"
          :key="module.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">{{ module.title }}</p>
              <p class="text-xs text-gray-500">Order {{ module.order }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="text-gray-500 hover:text-gray-700"
                @click="openEditModule(module)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="requestDeleteModule(module)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              <button
                class="text-gray-500 hover:text-gray-700"
                @click="openCreateLesson(module.id)"
              >
                <PlusIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="mt-3 space-y-2">
            <div
              v-for="lesson in module.lessons ?? []"
              :key="lesson.id"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ lesson.title }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ lesson.estimatedMinutes }} min
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="openEditLesson(lesson)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="requestDeleteLesson(lesson)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div v-if="!(module.lessons?.length)" class="text-xs text-gray-500">
              No lessons yet.
            </div>
          </div>
        </div>
      </div>

      <StateMessage
        v-else
        variant="empty"
        title="No modules yet"
        message="Add a module to structure this course."
      />
    </div>

    <Modal :open="showCourseModal" title="Course" @close="showCourseModal = false">
      <form class="space-y-4" @submit.prevent="saveCourse">
        <div>
          <label class="text-sm text-slate-300">Title</label>
          <Input v-model="courseForm.title" placeholder="Course title" />
        </div>
        <div>
          <label class="text-sm text-slate-300">Description</label>
          <Input v-model="courseForm.description" placeholder="Course description" />
        </div>
        <div>
          <label class="text-sm text-slate-300">Estimated hours</label>
          <Input v-model="courseForm.estimatedHours" type="number" placeholder="12" />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="showCourseModal = false"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save Course" }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal :open="showModuleModal" title="Module" @close="showModuleModal = false">
      <form class="space-y-4" @submit.prevent="saveModule">
        <div>
          <label class="text-sm text-slate-300">Title</label>
          <Input v-model="moduleForm.title" placeholder="Module title" />
        </div>
        <div>
          <label class="text-sm text-slate-300">Order</label>
          <Input v-model="moduleForm.order" type="number" placeholder="1" />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="showModuleModal = false"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save Module" }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal :open="showLessonModal" title="Lesson" @close="showLessonModal = false">
      <form class="space-y-4" @submit.prevent="saveLesson">
        <div>
          <label class="text-sm text-slate-300">Title</label>
          <Input v-model="lessonForm.title" placeholder="Lesson title" />
        </div>
        <div>
          <label class="text-sm text-slate-300">Estimated minutes</label>
          <Input v-model="lessonForm.estimatedMinutes" type="number" placeholder="30" />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="showLessonModal = false"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save Lesson" }}
          </Button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirming="isConfirming"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
