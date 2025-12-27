<template>
  <header class="h-16 bg-white border-b flex items-center justify-between px-6">
    <h1 class="text-lg font-semibold">
      {{ title }}
    </h1>

    <div class="flex items-center gap-4">
      <button class="relative">
        🔔
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          2
        </span>
      </button>

      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
          S
        </div>
        <span class="text-sm">Sarah Johnson</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

const title = computed(() => {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/courses": "Courses",
    "/study-plan": "Study Plan",
    "/study-sessions": "Study Sessions",
    "/notifications": "Notifications",
    "/profile": "Profile & Goals",
  };
  return map[route.path] ?? "";
});
</script>
