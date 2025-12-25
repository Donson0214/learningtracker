import { apiClient } from "@/shared/api/axios";
import type { Notification } from "@/shared/types";

export const fetchNotifications = async () => {
  const { data } = await apiClient.get<Notification[]>("/notifications/me");
  return data;
};

export const markNotificationRead = async (id: string) => {
  const { data } = await apiClient.post<{ success: boolean }>(
    `/notifications/${id}/read`
  );
  return data;
};

export const updateDailyReminder = async (enabled: boolean) => {
  const { data } = await apiClient.patch<{ success: boolean }>(
    "/notifications/preferences",
    { enabled }
  );
  return data;
};
