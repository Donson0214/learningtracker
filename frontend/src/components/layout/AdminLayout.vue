<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "./AdminSidebar.vue";
import AdminHeader from "./AdminHeader.vue";

const route = useRoute();
const isSidebarCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

watch(
  () => route.fullPath,
  () => {
    if (isMobileSidebarOpen.value) {
      closeMobileSidebar();
    }
  }
);
</script>

<template>
  <div class="flex min-h-screen md:h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:translate-x-0"
      :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <AdminSidebar
        :collapsed="isSidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
    </div>
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="closeMobileSidebar"
    ></div>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden min-w-0">
      <!-- Header -->
      <AdminHeader @toggle-sidebar="toggleMobileSidebar" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
