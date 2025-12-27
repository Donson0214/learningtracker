<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <p class="text-sm text-gray-500 mb-1">
      {{ label }}
    </p>
    <p
      class="text-2xl font-semibold"
      :class="highlight ? 'text-green-600' : 'text-gray-900'"
    >
      {{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  highlight?: boolean;
}>();
</script>
