<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ClockIcon, CalendarIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  title: string;
  course: string;
  duration: number;
  date: string;
  scheduledDate?: string;
  completed?: boolean;
}>();

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "reschedule", value: string): void;
}>();

const showReschedule = ref(false);
const newDate = ref("");

watch(
  () => props.scheduledDate,
  (value) => {
    newDate.value = value ? value.slice(0, 10) : "";
  },
  { immediate: true }
);

const canReschedule = computed(
  () => !props.completed && Boolean(props.scheduledDate)
);

const submitReschedule = () => {
  if (!newDate.value) {
    return;
  }
  emit("reschedule", newDate.value);
  showReschedule.value = false;
};
</script>

<template>
  <div
    class="flex justify-between items-center
           px-4 py-4 border border-gray-200
           rounded-lg bg-white"
  >
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        class="h-4 w-4 mt-1 rounded-full border-gray-300 text-blue-600 disabled:cursor-not-allowed"
        :checked="completed"
        :disabled="completed"
        @change="emit('toggle')"
      />

      <div>
        <p
          class="font-medium text-gray-900"
          :class="{ 'line-through text-gray-400': completed }"
        >
          {{ title }}
        </p>

        <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span class="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
            {{ course }}
          </span>
          <ClockIcon class="h-4 w-4" />
          {{ duration }} min
        </div>
      </div>
    </div>

    <div class="text-right text-xs text-gray-500">
      <div class="flex items-center justify-end gap-1">
        <CalendarIcon class="h-4 w-4" />
        {{ date }}
      </div>
      <button
        v-if="canReschedule"
        type="button"
        class="mt-2 text-xs text-gray-600 hover:text-gray-900"
        @click="showReschedule = !showReschedule"
      >
        Reschedule
      </button>
      <div v-if="showReschedule" class="mt-2 flex items-center gap-2">
        <input
          v-model="newDate"
          type="date"
          class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
        />
        <button
          type="button"
          class="rounded-md bg-gray-900 px-2 py-1 text-xs text-white"
          @click="submitReschedule"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
