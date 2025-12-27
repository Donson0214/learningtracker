<template>
  <header class="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
    <!-- Page title -->
    <h1 class="text-lg font-semibold text-gray-900">
      {{ title }}
    </h1>

    <!-- Right actions -->
    <div class="flex items-center gap-6">
      <!-- Notifications -->
      <button class="relative text-gray-500 hover:text-gray-700">
        <BellIcon class="h-6 w-6" />
        <span
          class="absolute -top-1 -right-1 h-5 min-w-[20px]
                 bg-red-500 text-white text-xs rounded-full
                 flex items-center justify-center px-1"
        >
          2
        </span>
      </button>

      <!-- User -->
      <div class="flex items-center gap-3">
        <div
          class="h-8 w-8 rounded-full bg-blue-600
                 text-white text-sm font-medium
                 flex items-center justify-center"
        >
          S
        </div>
        <span class="text-sm text-gray-700">
          Sarah Johnson
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BellIcon } from "@heroicons/vue/24/outline";
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
