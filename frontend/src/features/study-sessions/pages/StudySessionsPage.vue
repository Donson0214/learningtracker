<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Study Sessions
        </h2>
        <p class="text-gray-500">
          Log and track your study time
        </p>
      </div>

      <button
        class="bg-gray-900 text-white px-4 py-2 rounded-lg
               text-sm font-medium hover:bg-gray-800
               inline-flex items-center gap-2"
        @click="openCreate"
      >
        <PlusIcon class="h-4 w-4" />
        Log Session
      </button>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between">
        <h3 class="font-semibold text-gray-900">Recent Sessions</h3>
        <div class="relative">
          <select
            v-model="selectedCourseId"
            class="appearance-none border border-gray-200 rounded-lg
                   bg-gray-100 pl-3 pr-8 py-1.5 text-xs text-gray-700"
          >
            <option value="">All Courses</option>
            <option v-for="course in courseOptions" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
          <ChevronDownIcon
            class="h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th class="text-left px-4 py-3">Date</th>
            <th class="text-left px-4 py-3">Course</th>
            <th class="text-left px-4 py-3">Module</th>
            <th class="text-left px-4 py-3">Duration</th>
            <th class="text-left px-4 py-3">Mood</th>
            <th class="text-left px-4 py-3">Notes</th>
            <th class="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="7"
            variant="loading"
            title="Loading sessions"
            message="Fetching your recent study sessions."
          />
          <TableStateRow
            v-else-if="filteredSessions.length === 0"
            :colspan="7"
            variant="empty"
            title="No sessions yet"
            message="Log your first session to start tracking progress."
          />
          <tr v-for="row in filteredSessions" :key="row.id">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3">{{ row.course }}</td>
            <td class="px-4 py-3">{{ row.module }}</td>
            <td class="px-4 py-3">{{ row.duration }}</td>
            <td class="px-4 py-3">
              <MoodPill :mood="row.mood" />
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ row.notes }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="openEdit(row.raw)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="requestDeleteSession(row)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :open="showModal" :title="modalTitle" @close="closeModal">
      <form class="space-y-4" @submit.prevent="submitSession">
        <div>
          <label class="text-sm text-slate-300">Course</label>
          <select
            v-model="form.courseId"
            class="w-full rounded-xl border border-slate-800 bg-slate-900/70
                   px-3 py-2 text-sm text-slate-100"
          >
            <option value="" disabled>Select a course</option>
            <option v-for="course in courseOptions" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="text-sm text-slate-300">Module</label>
          <select
            v-model="form.moduleId"
            class="w-full rounded-xl border border-slate-800 bg-slate-900/70
                   px-3 py-2 text-sm text-slate-100"
          >
            <option value="">No module</option>
            <option v-for="module in moduleOptions" :key="module.id" :value="module.id">
              {{ module.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="text-sm text-slate-300">Duration (minutes)</label>
          <Input v-model="form.durationMinutes" type="number" placeholder="60" />
        </div>

        <div>
          <label class="text-sm text-slate-300">Date & time</label>
          <Input v-model="form.studiedAt" type="datetime-local" />
        </div>

        <div>
          <label class="text-sm text-slate-300">Mood</label>
          <select
            v-model="form.mood"
            class="w-full rounded-xl border border-slate-800 bg-slate-900/70
                   px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Select mood</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Neutral">Neutral</option>
            <option value="Challenging">Challenging</option>
          </select>
        </div>

        <div>
          <label class="text-sm text-slate-300">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full rounded-xl border border-slate-800 bg-slate-900/70
                   px-3 py-2 text-sm text-slate-100"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="closeModal"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isSaving">
            {{ isSaving ? "Saving..." : "Save Session" }}
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

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ChevronDownIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import MoodPill from "@/components/ui/MoodPill.vue";
import Modal from "@/components/ui/Modal.vue";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { fetchMyEnrollments } from "@/features/courses/api";
import {
  createStudySession,
  deleteStudySession,
  fetchStudySessions,
  updateStudySession,
} from "../api";
import type { Enrollment, StudySession } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const sessions = ref<StudySession[]>([]);
const enrollments = ref<Enrollment[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const selectedCourseId = ref("");

const showModal = ref(false);
const isSaving = ref(false);
const editingSessionId = ref<string | null>(null);
const route = useRoute();
const router = useRouter();
let queryHandled = false;
const form = ref({
  courseId: "",
  moduleId: "",
  durationMinutes: 60,
  studiedAt: new Date().toISOString().slice(0, 16),
  mood: "",
  notes: "",
});
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Delete",
  onConfirm: null as null | (() => Promise<void>),
});
const isConfirming = ref(false);

const loadData = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const [sessionData, enrollmentData] = await Promise.all([
      fetchStudySessions(),
      fetchMyEnrollments(),
    ]);
    sessions.value = sessionData;
    enrollments.value = enrollmentData;
  } catch (error) {
    errorMessage.value = "Unable to load study sessions.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadData, { intervalMs: 30000 });
useRealtimeRefresh(["studySessions.changed"], loadData);

watch(
  () => [enrollments.value.length, route.query.courseId],
  () => {
    if (enrollments.value.length) {
      openCreateFromQuery();
    }
  },
  { immediate: true }
);

const courseOptions = computed(() =>
  enrollments.value.map((enrollment) => ({
    id: enrollment.courseId,
    title: enrollment.course?.title ?? "Untitled course",
    modules: enrollment.course?.modules ?? [],
  }))
);

const moduleOptions = computed(() => {
  const course = courseOptions.value.find(
    (item) => item.id === form.value.courseId
  );
  return course?.modules ?? [];
});

watch(
  () => form.value.courseId,
  () => {
    if (
      form.value.moduleId &&
      !moduleOptions.value.find(
        (module) => module.id === form.value.moduleId
      )
    ) {
      form.value.moduleId = "";
    }
  }
);

const filteredSessions = computed(() => {
  const rows = sessions.value
    .filter((session) =>
      selectedCourseId.value
        ? session.courseId === selectedCourseId.value
        : true
    )
    .map((session) => ({
      id: session.id,
      date: formatDate(session.studiedAt),
      course: session.course?.title ?? "Course",
      module: session.module?.title ?? "General",
      duration: `${session.durationMinutes} min`,
      mood: session.mood ?? "Neutral",
      notes: session.notes ?? "--",
      raw: session,
    }));

  return rows;
});

const modalTitle = computed(() =>
  editingSessionId.value ? "Edit Session" : "Log Study Session"
);

const openCreate = (prefill?: { courseId?: string; moduleId?: string }) => {
  editingSessionId.value = null;
  form.value = {
    courseId: prefill?.courseId ?? courseOptions.value[0]?.id ?? "",
    moduleId: prefill?.moduleId ?? "",
    durationMinutes: 60,
    studiedAt: new Date().toISOString().slice(0, 16),
    mood: "",
    notes: "",
  };
  showModal.value = true;
};

const openCreateFromQuery = () => {
  if (queryHandled) {
    return;
  }
  const courseId = route.query.courseId;
  if (!courseId || typeof courseId !== "string") {
    return;
  }
  const moduleId =
    typeof route.query.moduleId === "string"
      ? route.query.moduleId
      : undefined;

  openCreate({ courseId, moduleId });
  queryHandled = true;
  router.replace({ query: {} });
};

const openEdit = (session: StudySession) => {
  editingSessionId.value = session.id;
  form.value = {
    courseId: session.courseId,
    moduleId: session.moduleId ?? "",
    durationMinutes: session.durationMinutes,
    studiedAt: new Date(session.studiedAt).toISOString().slice(0, 16),
    mood: session.mood ?? "",
    notes: session.notes ?? "",
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitSession = async () => {
  errorMessage.value = "";
  if (!form.value.courseId) {
    errorMessage.value = "Course is required.";
    return;
  }
  if (!form.value.durationMinutes || !form.value.studiedAt) {
    errorMessage.value = "Duration and date are required.";
    return;
  }

  isSaving.value = true;
  try {
    if (editingSessionId.value) {
      await updateStudySession(editingSessionId.value, {
        durationMinutes: form.value.durationMinutes,
        mood: form.value.mood,
        notes: form.value.notes,
        studiedAt: new Date(form.value.studiedAt).toISOString(),
      });
    } else {
      await createStudySession({
        courseId: form.value.courseId,
        moduleId: form.value.moduleId || undefined,
        durationMinutes: form.value.durationMinutes,
        mood: form.value.mood || undefined,
        notes: form.value.notes || undefined,
        studiedAt: new Date(form.value.studiedAt).toISOString(),
      });
    }
    await loadData();
    showModal.value = false;
  } catch (error) {
    errorMessage.value = "Unable to save session.";
  } finally {
    isSaving.value = false;
  }
};

const removeSession = async (sessionId: string) => {
  errorMessage.value = "";
  try {
    await deleteStudySession(sessionId);
    sessions.value = sessions.value.filter(
      (session) => session.id !== sessionId
    );
  } catch (error) {
    errorMessage.value = "Unable to delete session.";
  }
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
  } finally {
    isConfirming.value = false;
  }
};

const requestDeleteSession = (row: {
  id: string;
  date: string;
  course: string;
}) => {
  openConfirm({
    title: "Delete study session",
    message: `Delete the session from ${row.date} for ${row.course}? This cannot be undone.`,
    confirmLabel: "Delete session",
    onConfirm: () => removeSession(row.id),
  });
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>
