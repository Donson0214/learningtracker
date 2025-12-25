<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Profile & Goals
    </h2>
    <p class="text-gray-500 mb-6">
      Manage your profile and set learning goals
    </p>

    <div v-if="errorMessage" class="mb-4 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Profile -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="mb-4">
          <h3 class="font-semibold text-gray-900">Profile Information</h3>
          <p class="text-sm text-gray-500">Your account details</p>
        </div>

        <div class="flex justify-center mb-6">
          <div
            class="h-20 w-20 rounded-full bg-blue-600 text-white
                   flex items-center justify-center"
          >
            <UserIcon class="h-9 w-9" />
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-sm text-gray-600">Full Name</label>
            <div class="relative mt-1">
              <UserIcon
                class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                class="w-full border border-gray-200 bg-gray-50 rounded-lg
                       pl-9 pr-3 py-2 text-sm text-gray-900"
                :value="auth.user?.name ?? ''"
                disabled
              />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Email</label>
            <div class="relative mt-1">
              <EnvelopeIcon
                class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                class="w-full border border-gray-200 bg-gray-50 rounded-lg
                       pl-9 pr-3 py-2 text-sm text-gray-900"
                :value="auth.user?.email ?? ''"
                disabled
              />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Organization</label>
            <div class="relative mt-1">
              <BuildingOffice2Icon
                class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                class="w-full border border-gray-200 bg-gray-50 rounded-lg
                       pl-9 pr-3 py-2 text-sm text-gray-900"
                :value="auth.user?.organization?.name ?? 'Unassigned'"
                disabled
              />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Role</label>
            <div class="relative mt-1">
              <BriefcaseIcon
                class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                class="w-full border border-gray-200 bg-gray-50 rounded-lg
                       pl-9 pr-3 py-2 text-sm text-gray-900"
                :value="roleLabel"
                disabled
              />
            </div>
          </div>
        </div>

        <RouterLink
          to="/register?mode=edit"
          class="mt-4 w-full border border-gray-200 rounded-lg
                 px-4 py-2 text-sm font-medium text-gray-700
                 hover:bg-gray-50 inline-flex items-center justify-center"
        >
          Edit Profile
        </RouterLink>
      </div>

      <!-- Goals -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="mb-4">
          <h3 class="font-semibold text-gray-900">Study Goals</h3>
          <p class="text-sm text-gray-500">Set and track your learning objectives</p>
        </div>

        <div class="mb-4">
          <label class="text-sm text-gray-600">Weekly Study Goal (hours)</label>
          <input
            v-model.number="hoursPerWeek"
            type="number"
            min="1"
            class="w-full border border-gray-200 bg-gray-50 rounded-lg
                   px-3 py-2 text-sm text-gray-900 mt-1"
            placeholder="10"
          />
          <p class="text-xs text-gray-500 mt-1">
            Aim to study at least 10 hours per week
          </p>
        </div>

        <div class="mb-4">
          <label class="text-sm text-gray-600">Target Completion Date</label>
          <input
            v-model="targetDate"
            type="date"
            class="w-full border border-gray-200 bg-gray-50 rounded-lg
                   px-3 py-2 text-sm text-gray-900 mt-1"
          />
          <p class="text-xs text-gray-500 mt-1">
            Optional date to hit your learning milestone
          </p>
        </div>

        <button
          class="mt-4 w-full bg-gradient-to-r from-gray-900 to-black
                 text-white py-2 rounded-lg text-sm font-medium"
          :disabled="isSaving"
          @click="saveGoal"
        >
          {{ isSaving ? "Saving..." : "Save Goals" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/store";
import { createStudyGoal, fetchStudyGoal, updateStudyGoal } from "../api";
import type { StudyGoal } from "@/shared/types";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const auth = useAuthStore();
const goal = ref<StudyGoal | null>(null);
const hoursPerWeek = ref<number | null>(null);
const targetDate = ref("");
const isSaving = ref(false);
const errorMessage = ref("");

const loadGoal = async () => {
  errorMessage.value = "";
  try {
    const data = await fetchStudyGoal();
    goal.value = data;
    hoursPerWeek.value = data.hoursPerWeek;
    targetDate.value = data.targetCompletionAt
      ? data.targetCompletionAt.slice(0, 10)
      : "";
  } catch (error) {
    goal.value = null;
  }
};

onMounted(loadGoal);
useRealtimeRefresh(["studyGoals.changed", "users.changed"], loadGoal);

const roleLabel = computed(() => {
  if (!auth.user?.role) return "Learner";
  return auth.user.role === "ORG_ADMIN" ? "Admin" : "Learner";
});

const saveGoal = async () => {
  errorMessage.value = "";
  if (!hoursPerWeek.value) {
    errorMessage.value = "Weekly study hours are required.";
    return;
  }

  isSaving.value = true;
  try {
    if (goal.value) {
      await updateStudyGoal(goal.value.id, {
        hoursPerWeek: hoursPerWeek.value,
        targetDate: targetDate.value || null,
      });
    } else {
      goal.value = await createStudyGoal({
        hoursPerWeek: hoursPerWeek.value,
        targetDate: targetDate.value || null,
      });
    }
    await loadGoal();
  } catch (error) {
    errorMessage.value = "Unable to save goals.";
  } finally {
    isSaving.value = false;
  }
};
</script>
