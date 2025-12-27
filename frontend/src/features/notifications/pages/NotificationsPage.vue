<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Notifications
    </h2>
    <p class="text-gray-500 mb-4">
      Manage your notification preferences
    </p>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <NoOrganizationState v-if="!hasOrganization" class="mb-6" />

    <div class="flex items-center gap-2 mb-6">
      <button
        class="px-3 py-1 text-xs font-medium rounded-full shadow-sm"
        :class="filter === 'all'
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100 text-gray-600'"
        @click="filter = 'all'"
      >
        All ({{ visibleNotifications.length }})
      </button>
      <button
        class="px-3 py-1 text-xs font-medium rounded-full"
        :class="filter === 'unread'
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100 text-gray-600'"
        @click="filter = 'unread'"
      >
        Unread ({{ unreadCount }})
      </button>
      <button
        class="px-3 py-1 text-xs font-medium rounded-full disabled:opacity-60"
        :class="filter === 'settings'
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100 text-gray-600'"
        :disabled="!hasOrganization"
        @click="filter = 'settings'"
      >
        Settings
      </button>
    </div>

    <div v-if="filter === 'settings'">
      <StateMessage
        v-if="!hasOrganization"
        variant="empty"
        title="Join an organization"
        message="Reminder settings are available after you join an organization."
      />
      <div
        v-else
        class="bg-white border border-gray-200 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-900">Daily reminders</p>
            <p class="text-sm text-gray-500">
              Receive a notification for scheduled study tasks.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="dailyReminderEnabled"
              :disabled="!hasOrganization"
              @change="toggleReminder"
            />
            <div
              class="w-10 h-5 bg-gray-200 rounded-full peer
                     peer-checked:bg-gray-900
                     after:content-['']
                     after:absolute after:top-0.5 after:left-[2px]
                     after:bg-white after:h-4 after:w-4
                     after:rounded-full after:transition-all
                     peer-checked:after:translate-x-full"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">Organization Invites</h3>
            <p class="text-sm text-gray-500">
              Accept or decline invitations to join an organization.
            </p>
          </div>
        </div>

        <StateMessage
          v-if="invitesErrorMessage"
          variant="error"
          title="Invite error"
          :message="invitesErrorMessage"
        />

        <StateMessage
          v-else-if="isInvitesLoading"
          variant="loading"
          title="Loading invites"
          message="Checking for new invitations."
        />

        <StateMessage
          v-else-if="invites.length === 0"
          variant="empty"
          title="No invites yet"
          message="You'll see organization invitations here."
        />

        <div v-else class="space-y-3">
          <div
            v-for="invite in invites"
            :key="invite.id"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-lg p-3"
          >
            <div>
              <p class="text-sm font-semibold text-gray-900">
                {{ invite.organization?.name ?? "Organization" }}
              </p>
              <p class="text-xs text-gray-500">
                Invited by {{ invite.invitedBy?.name || invite.invitedBy?.email || "Admin" }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                Expires {{ formatDate(invite.expiresAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70"
                :disabled="inviteActionId === invite.id"
                @click="handleAcceptInvite(invite.id)"
              >
                {{ inviteActionId === invite.id ? "Accepting..." : "Accept" }}
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
                :disabled="inviteActionId === invite.id"
                @click="handleDeclineInvite(invite.id)"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>

      <StateMessage
        v-if="isLoading"
        variant="loading"
        title="Loading notifications"
        message="Checking for new updates."
      />

      <StateMessage
        v-else-if="filteredNotifications.length === 0"
        variant="empty"
        title="No notifications yet"
        message="You're all caught up."
      />

      <div v-else class="space-y-4">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="border rounded-xl p-4 flex items-start justify-between"
          :class="notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'"
          @click="markRead(notification)"
        >
          <div class="flex items-start gap-3">
            <div
              class="h-9 w-9 rounded-full flex items-center justify-center"
              :class="notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'"
            >
              <BellIcon class="h-4 w-4" />
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ notification.title }}</p>
              <p class="text-sm text-gray-600">
                {{ notification.body }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>
          </div>
          <span
            v-if="!notification.isRead"
            class="h-2 w-2 rounded-full bg-blue-600 mt-1"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { BellIcon } from "@heroicons/vue/24/outline";
import NoOrganizationState from "@/components/ui/NoOrganizationState.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import {
  fetchNotifications,
  markNotificationRead,
  saveDeviceToken,
  updateDailyReminder,
} from "../api";
import type { Notification } from "@/shared/types";
import { useAuthStore } from "@/features/auth/store";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { requestNotificationToken } from "@/shared/firebase/messaging";
import {
  acceptInviteById,
  declineInviteById,
  fetchMyInvites,
} from "@/features/invites/api";
import type { OrganizationInvite } from "@/shared/types";

const auth = useAuthStore();
const notifications = ref<Notification[]>([]);
const invites = ref<OrganizationInvite[]>([]);
const isLoading = ref(true);
const isInvitesLoading = ref(true);
const errorMessage = ref("");
const invitesErrorMessage = ref("");
const filter = ref<"all" | "unread" | "settings">("all");
const dailyReminderEnabled = ref(
  auth.user?.dailyReminderEnabled ?? true
);
const inviteActionId = ref<string | null>(null);
const hasOrganization = computed(
  () => Boolean(auth.user?.organization)
);

const loadNotifications = async () => {
  errorMessage.value = "";
  if (!hasOrganization.value) {
    notifications.value = [];
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    notifications.value = await fetchNotifications();
  } catch (error) {
    errorMessage.value = "Unable to load notifications.";
  } finally {
    isLoading.value = false;
  }
};

const loadInvites = async () => {
  invitesErrorMessage.value = "";
  isInvitesLoading.value = true;
  try {
    invites.value = await fetchMyInvites();
  } catch (error) {
    invitesErrorMessage.value = "Unable to load invites.";
  } finally {
    isInvitesLoading.value = false;
  }
};

useAutoRefresh(loadNotifications, { intervalMs: 30000 });
useAutoRefresh(loadInvites, { intervalMs: 30000 });
useRealtimeRefresh(
  ["notifications.changed", "invites.changed"],
  () => {
    loadNotifications();
    loadInvites();
  }
);

const visibleNotifications = computed(() =>
  notifications.value.filter(
    (item) => item.title !== "Organization Invitation"
  )
);

const unreadCount = computed(
  () => visibleNotifications.value.filter((item) => !item.isRead).length
);

const filteredNotifications = computed(() => {
  if (filter.value === "unread") {
    return visibleNotifications.value.filter((item) => !item.isRead);
  }
  return visibleNotifications.value;
});

const markRead = async (notification: Notification) => {
  if (notification.isRead) {
    return;
  }
  try {
    await markNotificationRead(notification.id);
    notification.isRead = true;
  } catch (error) {
    errorMessage.value = "Unable to update notification.";
  }
};

const toggleReminder = async () => {
  if (!hasOrganization.value) {
    errorMessage.value = "Join an organization to enable reminders.";
    return;
  }
  const nextValue = !dailyReminderEnabled.value;
  dailyReminderEnabled.value = nextValue;
  try {
    if (nextValue) {
      const token = await requestNotificationToken();
      await saveDeviceToken(token);
    }
    await updateDailyReminder(nextValue);
    if (auth.user) {
      auth.user.dailyReminderEnabled = nextValue;
    }
  } catch (error) {
    dailyReminderEnabled.value = !nextValue;
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to update reminder settings.";
  }
};

const handleAcceptInvite = async (inviteId: string) => {
  invitesErrorMessage.value = "";
  inviteActionId.value = inviteId;
  try {
    await acceptInviteById(inviteId);
    await auth.refreshProfile();
    await loadNotifications();
    await loadInvites();
  } catch (error) {
    invitesErrorMessage.value = "Unable to accept invite.";
  } finally {
    inviteActionId.value = null;
  }
};

const handleDeclineInvite = async (inviteId: string) => {
  invitesErrorMessage.value = "";
  inviteActionId.value = inviteId;
  try {
    await declineInviteById(inviteId);
    await loadInvites();
  } catch (error) {
    invitesErrorMessage.value = "Unable to decline invite.";
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
</script>
