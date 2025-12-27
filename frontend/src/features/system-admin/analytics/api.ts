import { apiClient } from "@/shared/api/axios";
import type { SystemAnalytics } from "@/shared/types";

export const fetchSystemAnalytics = async () => {
  const { data } = await apiClient.get<SystemAnalytics>(
    "/system/analytics"
  );
  return data;
};
