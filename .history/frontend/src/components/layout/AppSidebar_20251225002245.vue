<template>
  <aside class="w-64 bg-white border-r border-gray-200 h-full">
    <!-- Logo -->
    <div class="p-4 flex items-center gap-2 font-semibold text-blue-600">
      <div class="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center text-sm">
        LT
      </div>
      Learning Tracker
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3 space-y-1">
      <SidebarLink to="/dashboard" label="Dashboard" :icon="Squares2X2Icon" />
      <SidebarLink to="/courses" label="Courses" :icon="BookOpenIcon" />
      <SidebarLink to="/study-plan" label="Study Plan" :icon="CalendarIcon" />
      <SidebarLink to="/study-sessions" label="Study Sessions" :icon="ClockIcon" />
      <SidebarLink to="/notifications" label="Notifications" :icon="BellIcon" />
      <SidebarLink to="/profile" label="Profile & Goals" :icon="UserIcon" />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  Squares2X2Icon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

import SidebarLink from "./SidebarLink.vue";
</script>
  