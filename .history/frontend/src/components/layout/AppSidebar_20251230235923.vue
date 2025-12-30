<template>
  <aside
    :class="[
      'bg-white border-r border-gray-200 h-full overflow-hidden transition-all duration-200 shrink-0',
      'dark:bg-slate-900 dark:border-slate-800',
      collapsed ? 'w-20' : 'w-64',
    ]"
  >
    <!-- Logo / Toggle -->
    <div :class="collapsed ? 'px-3 py-4' : 'p-4'">
      <div v-if="collapsed" class="flex items-center justify-center">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:text-gray-900
                 dark:text-slate-300 dark:hover:text-slate-100"
          aria-label="Expand sidebar"
          @click="emit('toggle-sidebar')"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>
      </div>
      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2 font-semibold text-blue-600 dark:text-sky-400">
          <div
            class="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center text-sm dark:bg-sky-500"
          >
            LT
          </div>
          <span>Trackademy</span>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-700
                 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Collapse sidebar"
          @click="emit('toggle-sidebar')"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3 space-y-1">
      <SidebarLink
        to="/dashboard"
        label="Dashboard"
        :icon="Squares2X2Icon"
        :collapsed="collapsed"
      />
      <SidebarLink
        to="/courses"
        label="Courses"
        :icon="BookOpenIcon"
        :collapsed="collapsed"
      />
      <SidebarLink
        to="/study-plan"
        label="Study Plan"
        :icon="CalendarIcon"
        :collapsed="collapsed"
      />
      <SidebarLink
        to="/study-sessions"
        label="Study Sessions"
        :icon="ClockIcon"
        :collapsed="collapsed"
      />
      <SidebarLink
        to="/notifications"
        label="Notifications"
        :icon="BellIcon"
        :collapsed="collapsed"
      />
      <SidebarLink
        to="/profile"
        label="Profile & Goals"
        :icon="UserIcon"
        :collapsed="collapsed"
      />
      <SidebarLink
        v-if="isAdmin"
        to="/admin"
        label="Admin"
        :icon="Cog6ToothIcon"
        :collapsed="collapsed"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Squares2X2Icon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
  ChevronLeftIcon,
  Bars3Icon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

import { useAuthStore } from "@/features/auth/store";
import SidebarLink from "./SidebarLink.vue";

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
}>();

const auth = useAuthStore();
const isAdmin = computed(
  () =>
    auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN"
);
</script>
  
