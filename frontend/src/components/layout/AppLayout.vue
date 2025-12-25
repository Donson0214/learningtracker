<template>
  <div class="flex h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
    <AppSidebar
      :collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="flex flex-col flex-1 min-w-0">
      <AppHeader />
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>
