<script setup lang="ts">
import { ClockIcon, BookOpenIcon } from "@heroicons/vue/24/outline";

defineProps<{
  title: string;
  description: string;
  percent: number;
  hours: number;
  modules: number;
  cta: string;
}>();
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
    <!-- Title -->
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-semibold text-gray-900">{{ title }}</h3>
      <span class="text-xs px-2 py-1 rounded-full bg-gray-100">
        {{ percent }}%
      </span>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      {{ description }}
    </p>

    <!-- Progress -->
    <div class="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
      <div
        class="h-full bg-gray-900 rounded-full"
        :style="{ width: percent + '%' }"
      />
    </div>

    <!-- Meta -->
    <div class="flex justify-between text-sm text-gray-500 mb-5">
      <div class="flex items-center gap-1">
        <ClockIcon class="h-4 w-4" />
        {{ hours }} hours
      </div>
      <div class="flex items-center gap-1">
        <BookOpenIcon class="h-4 w-4" />
        {{ modules }} modules
      </div>
    </div>

    <!-- Button -->
    <button
      class="mt-auto w-full bg-gradient-to-r
             from-gray-900 to-black
             text-white py-2 rounded-lg
             text-sm font-medium"
    >
      {{ cta }}
    </button>
  </div>
</template>
