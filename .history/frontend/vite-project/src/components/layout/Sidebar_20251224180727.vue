<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

import {
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
  ChevronLeftIcon,
} from "@heroicons/vue/24/outline"

defineProps<{
  collapsed: boolean
}>()

defineEmits(["toggle"])

const route = useRoute()

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
  { name: "Courses", path: "/courses", icon: BookOpenIcon },
  { name: "Study Plan", path: "/study-plan", icon: CalendarIcon },
  { name: "Study Sessions", path: "/study-sessions", icon: ClockIcon },
  { name: "Notifications", path: "/notifications", icon: BellIcon },
  { name: "Profile & Goals", path: "/profile", icon: UserIcon },
]

const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <aside
    class="h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <!-- LOGO -->
    <div class="h-16 flex items-center px-6 gap-3 border-b">
      <div
        class="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold"
      >
        LT
      </div>

      <span
        v-if="!collapsed"
        class="text-lg font-semibold text-gray-900"
      >
        Learning Tracker
      </span>
    </div>

    <!-- NAV -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
        :class="isActive(item.path)
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
      >
        <component
          :is="item.icon"
          class="h-5 w-5 flex-shrink-0"
          :class="isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700'"
        />

        <span v-if="!collapsed">
          {{ item.name }}
        </span>
      </RouterLink>
    </nav>

    <!-- COLLAPSE BUTTON -->
    <div class="border-t p-3">
      <button
        @click="$emit('toggle')"
        class="w-full flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
      >
        <ChevronLeftIcon
          class="h-5 w-5 text-gray-500 transition-transform"
          :class="collapsed ? 'rotate-180' : ''"
        />
      </button>
    </div>
  </aside>
</template>
