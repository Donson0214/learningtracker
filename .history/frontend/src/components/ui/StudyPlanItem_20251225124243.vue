<template>
  <div
    class="flex items-center justify-between
           px-4 py-3 border-b border-gray-200 last:border-b-0"
  >
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
      />

      <div>
        <p class="text-sm font-medium text-gray-900">
          {{ title }}
        </p>

        <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span
            class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
          >
            {{ course }}
          </span>
          <span>•</span>
          <span>{{ duration }} min</span>
        </div>
      </div>
    </div>

    <span class="text-sm text-gray-500">
      {{ date }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  course: string;
  duration: number;
  date: string;
}>();
</script>
