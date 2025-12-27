<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "@/stores/ui.store";

import {
  HomeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";

const ui = useUIStore();
const route = useRoute();
const router = useRouter();

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
  { name: "Courses", path: "/courses", icon: BookOpenIcon },
  { name: "Study Plan", path: "/study-plan", icon: CalendarDaysIcon },
  { name: "Study Sessions", path: "/study-sessions", icon: ClockIcon },
  { name: "Notifications", path: "/notifications", icon: BellIcon },
  { name: "Profile & Goals", path: "/profile-goals", icon: UserCircleIcon },
];

const isActive = (path: string) => route.path === path;
</script>

<template>
  <aside
    class="h-screen bg-white border-r transition-all duration-300 flex flex-col"
    :class="ui.sidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <!-- Logo + Toggle -->
    <div class="h-16 flex items-center justify-between px-4 border-b">
      <div
        class="flex items-center gap-2 font-bold text-lg"
        v-if="!ui.sidebarCollapsed"
      >
        <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">
          LT
        </div>
        Learning Tracker
      </div>

      <button
        @click="ui.toggleSidebar"
        class="p-2 rounded hover:bg-gray-100"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <button
        v-for="item in menu"
        :key="item.path"
        @click="router.push(item.path)"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition"
        :class="isActive(item.path)
          ? 'bg-blue-50 text-blue-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-100'"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span v-if="!ui.sidebarCollapsed">{{ item.name }}</span>
      </button>
    </nav>
  </aside>
</template>
