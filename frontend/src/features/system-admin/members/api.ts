import { apiClient } from "@/shared/api/axios";
import type { PaginatedResponse, SystemMember } from "@/shared/types";

export const fetchSystemMembers = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const { data } = await apiClient.get<
    PaginatedResponse<SystemMember>
  >("/system/members", { params });
  return data;
};
