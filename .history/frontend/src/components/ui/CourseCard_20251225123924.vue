<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="font-semibold text-gray-900">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ description }}
        </p>
      </div>

      <span
        class="text-xs font-medium px-2 py-1 rounded-full
               bg-gray-100 text-gray-900"
      >
        {{ percent }}%
      </span>
    </div>

    <!-- Progress -->
    <div class="mb-3">
      <p class="text-sm font-medium text-gray-900 mb-1">
        Progress
      </p>

      <div class="flex items-center gap-3">
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gray-900 rounded-full"
            :style="{ width: percent + '%' }"
          ></div>
        </div>
        <span class="text-sm text-gray-500">
          {{ percent }}%
        </span>
      </div>
    </div>

    <!-- Meta -->
    <p class="text-sm text-gray-500 mb-5">
      {{ hours }} hours total
    </p>

    <!-- Action -->
    <button
      class="mt-auto bg-gray-900 text-white
             px-4 py-2 rounded-lg
             text-sm font-medium
             hover:bg-gray-800 transition"
    >
      {{ cta }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  percent: number;
  hours: number;
  cta: string;
}>();
</script>
