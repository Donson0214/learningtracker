<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-start">
    <div>
      <p class="text-sm text-gray-500 mb-1">
        {{ label }}
      </p>
      <p class="text-2xl font-semibold text-gray-900">
        {{ value }}
      </p>
      <p v-if="sub" class="text-sm text-gray-500 mt-1">
        {{ sub }}
      </p>
    </div>

    <component
      :is="icon"
      class="h-6 w-6 text-gray-400"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
}>();
</script>
