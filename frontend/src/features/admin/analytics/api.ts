import { apiClient } from "@/shared/api/axios";
import type { OrgAnalytics } from "@/shared/types";

export const fetchOrgAnalytics = async () => {
  const { data } = await apiClient.get<OrgAnalytics>("/analytics/org");
  return data;
};
