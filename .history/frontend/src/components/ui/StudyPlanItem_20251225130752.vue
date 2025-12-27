<script setup lang="ts">
import { ClockIcon, CalendarIcon } from "@heroicons/vue/24/outline";

defineProps<{
  title: string;
  course: string;
  duration: number;
  date: string;
}>();
</script>

<template>
  <div
    class="flex justify-between items-center
           px-4 py-4 border border-gray-200
           rounded-lg mb-3"
  >
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        class="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600"
      />

      <div>
        <p class="font-medium text-gray-900">{{ title }}</p>

        <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <span class="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
            {{ course }}
          </span>
          <ClockIcon class="h-4 w-4" />
          {{ duration }} min
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1 text-sm text-gray-500">
      <CalendarIcon class="h-4 w-4" />
      {{ date }}
    </div>
  </div>
</template>
