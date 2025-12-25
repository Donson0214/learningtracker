<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
}>();

const route = useRoute();

const links = [
  { to: "/admin", label: "Dashboard", icon: Squares2X2Icon },
  {
    to: "/admin/organization",
    label: "Organization",
    icon: BuildingOffice2Icon,
  },
  { to: "/admin/courses", label: "Courses", icon: BookOpenIcon },
  { to: "/admin/members", label: "Members", icon: UsersIcon },
  { to: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
];

const isActiveLink = (to: string) => {
  if (to === "/admin") {
    return route.path === "/admin";
  }
  return route.path.startsWith(to);
};
</script>

<template>
  <aside
    :class="[
      'bg-white border-r border-gray-200 h-full shrink-0 overflow-hidden transition-all duration-200',
      'dark:bg-slate-900 dark:border-slate-800',
      collapsed ? 'w-20' : 'w-64',
    ]"
  >
    <div class="p-4">
      <div v-if="collapsed" class="flex items-center">
        <button
          type="button"
          class="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100"
          aria-label="Expand sidebar"
          @click="emit('toggle-sidebar')"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>
      </div>
      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2 font-semibold text-blue-600 dark:text-sky-400">
          <div
            class="h-8 w-8 rounded bg-blue-600 text-white
                   flex items-center justify-center text-sm dark:bg-sky-500"
          >
            LT
          </div>
          <span>Learning Tracker</span>
        </div>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Collapse sidebar"
          @click="emit('toggle-sidebar')"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <nav class="mt-4 px-3 space-y-1">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
        :class="[
          collapsed ? 'justify-center' : '',
          isActiveLink(link.to)
            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-sky-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        ]"
      >
        <component :is="link.icon" class="h-5 w-5" />
        <span v-if="!collapsed">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
