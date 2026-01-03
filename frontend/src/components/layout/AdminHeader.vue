<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/store";
import { useTheme } from "@/shared/theme/useTheme";
import {
  fetchNotifications,
  markNotificationRead,
} from "@/features/notifications/api";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import type { Notification } from "@/shared/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const notificationsOpen = ref(false);
const notificationsRef = ref<HTMLElement | null>(null);
const notifications = ref<Notification[]>([]);
const isNotificationsLoading = ref(false);
const notificationsError = ref("");
let pollTimer: number | null = null;
const { theme, toggleTheme } = useTheme();
const emit = defineEmits<{
  (event: "toggle-sidebar"): void;
}>();

const title = computed(() => {
  const map: Record<string, string> = {
    "/admin": "Admin Dashboard",
    "/admin/organization": "Organization Management",
    "/admin/courses": "Course Management",
    "/admin/members": "Member Management",
    "/admin/analytics": "Analytics",
    "/admin/organizations": "Organizations",
  };
  if (route.path === "/admin" && auth.user?.role === "SYSTEM_ADMIN") {
    return "System Admin Dashboard";
  }
  if (route.path.startsWith("/admin/organizations/")) {
    return "Organization Details";
  }
  if (route.path === "/admin/members" && auth.user?.role === "SYSTEM_ADMIN") {
    return "All Members";
  }
  if (route.path === "/admin/courses" && auth.user?.role === "SYSTEM_ADMIN") {
    return "All Courses";
  }
  return map[route.path] ?? "Admin";
});

const toggleMenu = () => {
  notificationsOpen.value = false;
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const toggleNotifications = async () => {
  menuOpen.value = false;
  notificationsOpen.value = !notificationsOpen.value;
  if (notificationsOpen.value) {
    await loadNotifications();
  }
};

const closeNotifications = () => {
  notificationsOpen.value = false;
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node;
  if (menuRef.value && !menuRef.value.contains(target)) {
    menuOpen.value = false;
  }
  if (notificationsRef.value && !notificationsRef.value.contains(target)) {
    notificationsOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    menuOpen.value = false;
    notificationsOpen.value = false;
  }
};

const loadNotifications = async () => {
  if (!auth.user?.organization) {
    notifications.value = [];
    return;
  }
  isNotificationsLoading.value = true;
  notificationsError.value = "";
  try {
    notifications.value = await fetchNotifications();
  } catch {
    notificationsError.value = "Unable to load notifications.";
  } finally {
    isNotificationsLoading.value = false;
  }
};

useRealtimeRefresh(
  ["notifications.changed"],
  () => loadNotifications()
);

const visibleNotifications = computed(() => notifications.value);

const unreadCount = computed(
  () => visibleNotifications.value.filter((item) => !item.isRead).length
);

const handleNotificationClick = async (notification: Notification) => {
  if (notification.isRead) {
    return;
  }
  try {
    await markNotificationRead(notification.id);
    notification.isRead = true;
  } catch {
    notificationsError.value = "Unable to update notification.";
  }
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  router.push("/");
};
</script>

<template>
  <header
    class="h-16 bg-white border-b border-gray-200
           flex items-center justify-between gap-3
           px-4 sm:px-6 dark:bg-slate-900 dark:border-slate-800"
  >
    <!-- Page Title -->
    <div class="flex items-center gap-3 min-w-0">
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900
               dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden"
        aria-label="Open navigation"
        @click="emit('toggle-sidebar')"
      >
        <Bars3Icon class="h-5 w-5" />
      </button>
      <RouterLink
        v-if="auth.user?.role !== 'SYSTEM_ADMIN'"
        to="/dashboard"
        class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900
               dark:text-slate-300 dark:hover:text-slate-100"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        <span class="hidden sm:inline">Back</span>
      </RouterLink>
      <h1 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
        {{ title }}
      </h1>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Notifications -->
      <div ref="notificationsRef" class="relative">
        <button
          type="button"
          class="relative text-gray-600 hover:text-gray-900
                 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Notifications"
          @click="toggleNotifications"
        >
          <BellIcon class="h-5 w-5" />
          <span
            v-if="unreadCount"
            class="absolute -top-1 -right-1 h-4 min-w-[16px]
                   bg-red-500 text-white text-[10px] rounded-full
                   flex items-center justify-center px-1"
          >
            {{ unreadCount }}
          </span>
        </button>

        <div
          v-if="notificationsOpen"
          class="absolute right-0 mt-2 w-72 max-w-[90vw] rounded-lg border border-gray-200
                 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:w-80"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200
                   dark:border-slate-700"
          >
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Notifications
              </p>
              <p class="text-xs text-gray-500 dark:text-slate-400">
                Latest updates
              </p>
            </div>
            <RouterLink
              to="/notifications"
              class="text-xs text-gray-600 hover:text-gray-900 dark:text-slate-300"
              @click="closeNotifications"
            >
              View all
            </RouterLink>
          </div>

          <div class="max-h-80 overflow-y-auto">
            <div v-if="notificationsError" class="px-4 py-3 text-sm text-rose-600">
              {{ notificationsError }}
            </div>
            <div v-else-if="isNotificationsLoading" class="px-4 py-3 text-sm text-gray-500">
              Loading notifications...
            </div>
            <div
              v-else-if="visibleNotifications.length === 0"
              class="px-4 py-6 text-center text-sm text-gray-500"
            >
              You're all caught up.
            </div>
            <button
              v-for="notification in visibleNotifications.slice(0, 5)"
              :key="notification.id"
              class="w-full text-left px-4 py-3 border-b border-gray-100
                     hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <span
                  class="mt-1 h-2 w-2 rounded-full"
                  :class="notification.isRead ? 'bg-transparent' : 'bg-blue-500'"
                ></span>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {{ notification.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-slate-400">
                    {{ notification.body }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {{ formatDate(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="text-gray-600 hover:text-gray-900
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
            {{ auth.user?.name || auth.user?.email || "Admin" }}
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
