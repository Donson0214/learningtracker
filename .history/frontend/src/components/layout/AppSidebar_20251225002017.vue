<template>
  <aside class="w-64 bg-white border-r h-full">
    <div class="p-4 font-bold text-blue-600 flex items-center gap-2">
      <div class="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center">
        LT
      </div>
      Learning Tracker
    </div>

    <nav class="mt-6 space-y-1 px-3">
      <SidebarLink to="/dashboard" label="Dashboard" />
      <SidebarLink to="/courses" label="Courses" />
      <SidebarLink to="/study-plan" label="Study Plan" />
      <SidebarLink to="/study-sessions" label="Study Sessions" />
      <SidebarLink to="/notifications" label="Notifications" />
      <SidebarLink to="/profile" label="Profile & Goals" />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import SidebarLink from "./SidebarLink.vue";
</script>
