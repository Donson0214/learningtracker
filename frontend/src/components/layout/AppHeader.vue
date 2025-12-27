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
      <div ref="notificationsRef" class="relative">
        <button
          type="button"
          class="relative text-gray-500 hover:text-gray-700
                 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Notifications"
          @click="toggleNotifications"
        >
          <BellIcon class="h-6 w-6" />
          <span
            v-if="totalBadgeCount"
            class="absolute -top-1 -right-1 h-5 min-w-[20px]
                   bg-red-500 text-white text-xs rounded-full
                   flex items-center justify-center px-1"
          >
            {{ totalBadgeCount }}
          </span>
        </button>

        <div
          v-if="notificationsOpen"
          class="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200
                 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
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

          <div class="max-h-96 overflow-y-auto">
            <div
              v-if="isInvitesLoading || invitesError || pendingInviteCount"
              class="border-b border-gray-100 dark:border-slate-800"
            >
              <div class="px-4 py-3">
                <p class="text-xs font-semibold text-gray-900 dark:text-slate-100">
                  Organization Invites
                </p>
                <p class="text-xs text-gray-500 dark:text-slate-400">
                  Accept or decline invitations.
                </p>
              </div>

              <div v-if="invitesError" class="px-4 pb-3 text-xs text-rose-600">
                {{ invitesError }}
              </div>
              <div
                v-else-if="isInvitesLoading"
                class="px-4 pb-3 text-xs text-gray-500"
              >
                Loading invites...
              </div>
              <div v-else class="px-4 pb-3 space-y-3">
                <div
                  v-for="invite in pendingInvites"
                  :key="invite.id"
                  class="border border-gray-100 rounded-lg p-2 dark:border-slate-800"
                >
                  <p class="text-xs font-semibold text-gray-900 dark:text-slate-100">
                    {{ invite.organization?.name ?? "Organization" }}
                  </p>
                  <p class="text-[11px] text-gray-500 dark:text-slate-400">
                    Invited by {{ invite.invitedBy?.name || invite.invitedBy?.email || "Admin" }}
                  </p>
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      class="px-2 py-1 rounded text-[11px] font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70"
                      :disabled="inviteActionId === invite.id"
                      @click="handleAcceptInvite(invite.id)"
                    >
                      {{ inviteActionId === invite.id ? "Accepting..." : "Accept" }}
                    </button>
                    <button
                      class="px-2 py-1 rounded text-[11px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
                      :disabled="inviteActionId === invite.id"
                      @click="handleDeclineInvite(invite.id)"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
import {
  fetchNotifications,
  markNotificationRead,
} from "@/features/notifications/api";
import {
  acceptInviteById,
  declineInviteById,
  fetchMyInvites,
} from "@/features/invites/api";
import { useTheme } from "@/shared/theme/useTheme";
import { useCoursesStore } from "@/features/courses/store";
import type { Notification, OrganizationInvite } from "@/shared/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const coursesStore = useCoursesStore();
const notifications = ref<Notification[]>([]);
const invites = ref<OrganizationInvite[]>([]);
const isNotificationsLoading = ref(false);
const isInvitesLoading = ref(false);
const notificationsError = ref("");
const invitesError = ref("");
const inviteActionId = ref<string | null>(null);
let pollTimer: number | null = null;
const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const notificationsOpen = ref(false);
const notificationsRef = ref<HTMLElement | null>(null);
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
  if (map[route.path]) {
    return map[route.path];
  }

  if (route.path.startsWith("/courses/")) {
    const courseId = route.params.courseId;
    if (typeof courseId === "string") {
      const cachedCourse = coursesStore.coursesById[courseId];
      const enrollment = coursesStore.enrollments.find(
        (entry) => entry.courseId === courseId
      );
      const titleText =
        cachedCourse?.title || enrollment?.course?.title;
      if (titleText) {
        return `Course: ${titleText}`;
      }
    }
    return "Course Details";
  }

  return "";
});

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

const loadInvites = async () => {
  isInvitesLoading.value = true;
  invitesError.value = "";
  try {
    invites.value = await fetchMyInvites();
  } catch {
    invitesError.value = "Unable to load invites.";
  } finally {
    isInvitesLoading.value = false;
  }
};

const loadBadgeCount = async () => {
  await Promise.all([loadNotifications(), loadInvites()]);
};

const visibleNotifications = computed(() =>
  notifications.value.filter(
    (item) => item.title !== "Organization Invitation"
  )
);

const unreadCount = computed(
  () => visibleNotifications.value.filter((item) => !item.isRead).length
);

const pendingInviteCount = computed(
  () => invites.value.filter((invite) => invite.status === "PENDING").length
);

const pendingInvites = computed(() =>
  invites.value.filter((invite) => invite.status === "PENDING")
);

const totalBadgeCount = computed(
  () => unreadCount.value + pendingInviteCount.value
);

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
    await Promise.all([loadNotifications(), loadInvites()]);
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

const handleAcceptInvite = async (inviteId: string) => {
  invitesError.value = "";
  inviteActionId.value = inviteId;
  try {
    await acceptInviteById(inviteId);
    await auth.refreshProfile();
    await Promise.all([loadNotifications(), loadInvites()]);
  } catch {
    invitesError.value = "Unable to accept invite.";
  } finally {
    inviteActionId.value = null;
  }
};

const handleDeclineInvite = async (inviteId: string) => {
  invitesError.value = "";
  inviteActionId.value = inviteId;
  try {
    await declineInviteById(inviteId);
    await loadInvites();
  } catch {
    invitesError.value = "Unable to decline invite.";
  } finally {
    inviteActionId.value = null;
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
  loadBadgeCount();
  pollTimer = window.setInterval(loadBadgeCount, 30000);
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
