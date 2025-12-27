<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded text-gray-600 hover:bg-gray-100"
    active-class="bg-blue-50 text-blue-600 font-medium"
  >
    {{ label }}
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
}>();
</script>
