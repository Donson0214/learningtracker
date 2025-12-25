<template>
  <header
    class="h-16 bg-white border-b border-gray-200 px-6
           flex items-center justify-between
           dark:bg-slate-900 dark:border-slate-800"
  >
    <!-- Page title -->
    <h1 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
      {{ title }}
    </h1>

    <!-- Right actions -->
    <div class="flex items-center gap-4">
      <!-- Notifications -->
      <button
        type="button"
        class="relative text-gray-500 hover:text-gray-700
               dark:text-slate-400 dark:hover:text-slate-200"
      >
        <BellIcon class="h-6 w-6" />
        <span
          v-if="unreadCount"
          class="absolute -top-1 -right-1 h-5 min-w-[20px]
                 bg-red-500 text-white text-xs rounded-full
                 flex items-center justify-center px-1"
        >
          {{ unreadCount }}
        </span>
      </button>

      <button
        type="button"
        class="text-gray-500 hover:text-gray-700
               dark:text-slate-400 dark:hover:text-slate-200"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <SunIcon v-if="theme === 'dark'" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <!-- User -->
      <div ref="menuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-transparent
                 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100
                 dark:text-slate-200 dark:hover:bg-slate-800"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <div
            class="h-8 w-8 rounded-full bg-blue-600 text-white
                   flex items-center justify-center dark:bg-sky-500"
          >
            <UserIcon class="h-4 w-4" />
          </div>
          <span class="hidden sm:inline">
            {{ auth.user?.name || auth.user?.email || "Learner" }}
          </span>
          <ChevronDownIcon class="h-4 w-4 text-gray-400 dark:text-slate-400" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200
                 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <RouterLink
            to="/profile"
            class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                   dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeMenu"
          >
            Profile
          </RouterLink>
          <button
            type="button"
            class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                   dark:text-slate-200 dark:hover:bg-slate-800"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { useRoute, useRouter } from "vue-router";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useAuthStore } from "@/features/auth/store";
import { fetchNotifications } from "@/features/notifications/api";
import { useTheme } from "@/shared/theme/useTheme";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const unreadCount = ref(0);
let pollTimer: number | null = null;
const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const { theme, toggleTheme } = useTheme();

const title = computed(() => {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/courses": "Courses",
    "/study-plan": "Study Plan",
    "/study-sessions": "Study Sessions",
    "/notifications": "Notifications",
    "/profile": "Profile & Goals",
  };
  return map[route.path] ?? "";
});

const loadNotifications = async () => {
  try {
    const data = await fetchNotifications();
    unreadCount.value = data.filter((item) => !item.isRead).length;
  } catch {
    unreadCount.value = 0;
  }
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!menuRef.value) {
    return;
  }
  if (!menuRef.value.contains(event.target as Node)) {
    menuOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    menuOpen.value = false;
  }
};

onMounted(() => {
  loadNotifications();
  pollTimer = window.setInterval(loadNotifications, 30000);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer);
  }
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleEscape);
});

const handleLogout = async () => {
  await auth.signOut();
  closeMenu();
  router.push("/login");
};
</script>
