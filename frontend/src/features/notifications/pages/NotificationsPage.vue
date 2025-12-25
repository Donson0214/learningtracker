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

    <div class="flex items-center gap-2 mb-6">
      <button
        class="px-3 py-1 text-xs font-medium rounded-full shadow-sm"
        :class="filter === 'all'
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100 text-gray-600'"
        @click="filter = 'all'"
      >
        All ({{ notifications.length }})
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
        class="px-3 py-1 text-xs font-medium rounded-full"
        :class="filter === 'settings'
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100 text-gray-600'"
        @click="filter = 'settings'"
      >
        Settings
      </button>
    </div>

    <div v-if="filter === 'settings'">
      <div class="bg-white border border-gray-200 rounded-xl p-4">
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
import StateMessage from "@/components/ui/StateMessage.vue";
import { fetchNotifications, markNotificationRead, updateDailyReminder } from "../api";
import type { Notification } from "@/shared/types";
import { useAuthStore } from "@/features/auth/store";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";

const auth = useAuthStore();
const notifications = ref<Notification[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const filter = ref<"all" | "unread" | "settings">("all");
const dailyReminderEnabled = ref(
  auth.user?.dailyReminderEnabled ?? true
);

const loadNotifications = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    notifications.value = await fetchNotifications();
  } catch (error) {
    errorMessage.value = "Unable to load notifications.";
  } finally {
    isLoading.value = false;
  }
};

useAutoRefresh(loadNotifications, { intervalMs: 30000 });
useRealtimeRefresh(["notifications.changed"], loadNotifications);

const unreadCount = computed(
  () => notifications.value.filter((item) => !item.isRead).length
);

const filteredNotifications = computed(() => {
  if (filter.value === "unread") {
    return notifications.value.filter((item) => !item.isRead);
  }
  return notifications.value;
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
  const nextValue = !dailyReminderEnabled.value;
  dailyReminderEnabled.value = nextValue;
  try {
    await updateDailyReminder(nextValue);
    if (auth.user) {
      auth.user.dailyReminderEnabled = nextValue;
    }
  } catch (error) {
    dailyReminderEnabled.value = !nextValue;
    errorMessage.value = "Unable to update reminder settings.";
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
