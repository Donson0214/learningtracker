<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          My Study Plan
        </h2>
        <p class="text-gray-500">
          AI-generated schedule to reach your goals
        </p>
      </div>

      <button
        class="border border-gray-300 rounded-lg
               px-4 py-2 text-sm font-medium
               hover:bg-gray-100 transition
               inline-flex items-center gap-2"
        @click="openGenerator"
      >
        <ArrowPathIcon class="h-4 w-4 text-gray-500" />
        Regenerate Plan
      </button>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <PlanStatCard label="Total Tasks" :value="totalTasks" />
      <PlanStatCard label="Completed" :value="completedTasks" highlight />
      <PlanStatCard label="Target Date" :value="targetDateLabel" />
    </div>

    <!-- Plan -->
    <div class="bg-white border border-gray-200 rounded-xl">
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">
          {{ planRangeLabel }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ planItems.length }} tasks scheduled
        </p>
      </div>

      <div class="p-4 space-y-3">
        <StateMessage
          v-if="isLoading"
          variant="loading"
          title="Loading plan"
          message="Fetching your study schedule."
        />

        <StateMessage
          v-else-if="planItems.length === 0"
          variant="empty"
          title="No study plan yet"
          message="Generate a plan to get started."
        />

        <template v-else>
          <StudyPlanItem
            v-for="item in planItems"
            :key="item.id"
            :title="item.title"
            :course="item.course"
            :duration="item.duration"
            :date="item.date"
            :scheduled-date="item.scheduledDate"
            :completed="item.completed"
            @toggle="handleComplete(item)"
            @reschedule="handleReschedule(item.id, $event)"
          />
        </template>
      </div>
    </div>

    <Modal :open="showGenerator" title="Regenerate Study Plan" @close="closeGenerator">
      <form class="space-y-4" @submit.prevent="submitGenerator">
        <div>
          <label class="text-sm text-slate-300">Hours per week</label>
          <Input v-model="hoursPerWeek" type="number" placeholder="10" />
        </div>

        <div>
          <label class="text-sm text-slate-300">Target date</label>
          <Input v-model="targetDate" type="date" />
        </div>

        <div>
          <p class="text-sm text-slate-300 mb-2">Courses</p>
          <div class="space-y-2">
            <label
              v-for="course in availableCourses"
              :key="course.id"
              class="flex items-center gap-2 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400"
                :value="course.id"
                v-model="selectedCourseIds"
              />
              {{ course.title }}
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="closeGenerator"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isGenerating">
            {{ isGenerating ? "Generating..." : "Generate" }}
          </Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import PlanStatCard from "@/components/ui/PlanStatCard.vue";
import StudyPlanItem from "@/components/ui/StudyPlanItem.vue";
import Modal from "@/components/ui/Modal.vue";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import {
  completePlanItem,
  fetchStudyPlans,
  generateStudyPlan,
  reschedulePlanItem,
} from "../api";
import { fetchMyEnrollments } from "@/features/courses/api";
import { fetchStudyGoal } from "@/features/profile/api";
import type { Enrollment, StudyPlan, StudyPlanItem as PlanItem } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const plans = ref<StudyPlan[]>([]);
const enrollments = ref<Enrollment[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const showGenerator = ref(false);
const hoursPerWeek = ref<number | null>(10);
const targetDate = ref<string>("");
const selectedCourseIds = ref<string[]>([]);
const isGenerating = ref(false);

const loadData = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    const [planData, enrollmentData] = await Promise.all([
      fetchStudyPlans(),
      fetchMyEnrollments(),
    ]);
    plans.value = planData;
    enrollments.value = enrollmentData;

    const goal = await fetchStudyGoal().catch(() => null);
    if (goal) {
      hoursPerWeek.value = goal.hoursPerWeek;
      if (goal.targetCompletionAt) {
        targetDate.value = goal.targetCompletionAt.slice(0, 10);
      }
    } else if (!targetDate.value) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      targetDate.value = fallback.toISOString().slice(0, 10);
    }

    selectedCourseIds.value = enrollmentData.map((e) => e.courseId);
  } catch (error) {
    errorMessage.value = "Unable to load study plan.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadData, { intervalMs: 45000 });
useRealtimeRefresh(
  ["studyPlans.changed", "studyPlanItems.changed"],
  loadData
);

const activePlan = computed(() => plans.value[0]);

const courseLookup = computed(() => {
  const map = new Map<string, string>();
  enrollments.value.forEach((enrollment) => {
    if (enrollment.course) {
      map.set(enrollment.courseId, enrollment.course.title);
    }
  });
  return map;
});

const moduleLookup = computed(() => {
  const map = new Map<string, string>();
  enrollments.value.forEach((enrollment) => {
    enrollment.course?.modules?.forEach((module) => {
      map.set(module.id, module.title);
    });
  });
  return map;
});

const planItems = computed(() => {
  const items = activePlan.value?.items ?? [];
  return items
    .slice()
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime()
    )
    .map((item) => ({
      id: item.id,
      title: moduleLookup.value.get(item.moduleId ?? "") || "Study session",
      course: courseLookup.value.get(item.courseId) || "Course",
      duration: item.durationMinutes,
      date: formatDate(item.scheduledDate),
      scheduledDate: item.scheduledDate,
      completed: item.isCompleted,
    }));
});

const totalTasks = computed(() => planItems.value.length.toString());
const completedTasks = computed(() =>
  planItems.value.filter((item) => item.completed).length.toString()
);
const targetDateLabel = computed(() => {
  if (activePlan.value?.endDate) {
    return formatDate(activePlan.value.endDate);
  }
  return targetDate.value || "--";
});

const planRangeLabel = computed(() => {
  if (!activePlan.value) {
    return "No plan yet";
  }
  const start = formatDate(activePlan.value.startDate);
  const end = formatDate(activePlan.value.endDate);
  return `${start} - ${end}`;
});

const availableCourses = computed(() =>
  enrollments.value.map((enrollment) => ({
    id: enrollment.courseId,
    title: enrollment.course?.title ?? "Untitled course",
  }))
);

const openGenerator = () => {
  showGenerator.value = true;
};

const closeGenerator = () => {
  showGenerator.value = false;
};

const submitGenerator = async () => {
  errorMessage.value = "";
  if (!hoursPerWeek.value || !targetDate.value) {
    errorMessage.value = "Hours per week and target date are required.";
    return;
  }
  if (selectedCourseIds.value.length === 0) {
    errorMessage.value = "Select at least one course.";
    return;
  }

  isGenerating.value = true;
  try {
    const plan = await generateStudyPlan({
      courseIds: selectedCourseIds.value,
      hoursPerWeek: Number(hoursPerWeek.value),
      targetDate: targetDate.value,
    });
    plans.value = [plan, ...plans.value];
    showGenerator.value = false;
  } catch (error) {
    errorMessage.value = "Unable to generate study plan.";
  } finally {
    isGenerating.value = false;
  }
};

const handleComplete = async (item: {
  id: string;
  completed: boolean;
}) => {
  if (item.completed) {
    return;
  }
  try {
    await completePlanItem(item.id);
    const plan = activePlan.value;
    if (!plan) return;
    const target = plan.items.find((entry) => entry.id === item.id);
    if (target) {
      target.isCompleted = true;
    }
  } catch (error) {
    errorMessage.value = "Unable to update plan item.";
  }
};

const handleReschedule = async (
  itemId: string,
  nextDate: string
) => {
  const plan = activePlan.value;
  if (!plan) return;
  const target = plan.items.find((entry) => entry.id === itemId);
  if (!target) return;

  const previousDate = target.scheduledDate;
  const previousTime = new Date(previousDate);
  const nextTime = new Date(nextDate);
  if (!Number.isNaN(previousTime.getTime())) {
    nextTime.setHours(
      previousTime.getHours(),
      previousTime.getMinutes(),
      previousTime.getSeconds(),
      previousTime.getMilliseconds()
    );
  }
  const normalizedDate = nextTime.toISOString();
  target.scheduledDate = normalizedDate;

  try {
    await reschedulePlanItem(itemId, normalizedDate);
  } catch (error) {
    target.scheduledDate = previousDate;
    errorMessage.value = "Unable to reschedule plan item.";
  }
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
