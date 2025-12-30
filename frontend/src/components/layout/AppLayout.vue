<template>
  <div
    class="flex min-h-screen md:h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <div
      class="fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:translate-x-0"
      :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <AppSidebar
        :collapsed="isSidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
    </div>
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="closeMobileSidebar"
    ></div>

    <div class="flex flex-col flex-1 min-w-0">
      <AppHeader @toggle-sidebar="toggleMobileSidebar" />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div
          v-if="showOrgInactive"
          class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <span class="font-semibold">Organization paused.</span>
          Your organization has been paused by an administrator. You can create a new organization from your profile.
          <RouterLink
            to="/profile"
            class="ml-2 font-medium underline underline-offset-2"
          >
            Go to profile
          </RouterLink>
        </div>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import { useAuthStore } from "@/features/auth/store";

const auth = useAuthStore();
const route = useRoute();
const isSidebarCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);
const showOrgInactive = computed(() => auth.organizationInactive);

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
