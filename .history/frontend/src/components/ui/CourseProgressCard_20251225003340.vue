<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h4 class="font-semibold text-gray-900">
          {{ title }}
        </h4>
        <p class="text-sm text-gray-500">
          {{ description }}
        </p>
      </div>

      <span class="text-sm font-medium text-gray-900">
        {{ percent }}%
      </span>
    </div>

    <!-- Progress bar -->
    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
      <div
        class="h-full bg-gray-900 rounded-full"
        :style="{ width: percent + '%' }"
      ></div>
    </div>

    <p class="text-sm text-gray-500">
      {{ hours }} hours total
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  percent: number;
  hours: number;
}>();
</script>
