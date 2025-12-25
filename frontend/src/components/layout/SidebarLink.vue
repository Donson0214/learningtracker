<template>
  <RouterLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      collapsed ? 'justify-center' : '',
    ]"
    active-class="bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-sky-300"
  >
    <component :is="icon" class="h-5 w-5" />
    <span v-if="!collapsed">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  icon: any;
  collapsed?: boolean;
}>();
</script>
