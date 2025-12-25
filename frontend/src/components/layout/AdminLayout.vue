<script setup lang="ts">
import { ref } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import AdminHeader from "./AdminHeader.vue";

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden min-w-0">
      <!-- Header -->
      <AdminHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
