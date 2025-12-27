<template>
  <span
    class="px-3 py-1 rounded-full text-xs font-medium"
    :class="classes"
  >
    {{ mood }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ mood: string }>();

const classes = {
  Excellent: "bg-green-100 text-green-700",
  Good: "bg-blue-100 text-blue-700",
  Neutral: "bg-gray-100 text-gray-700",
  Challenging: "bg-orange-100 text-orange-700",
}[props.mood];
</script>
