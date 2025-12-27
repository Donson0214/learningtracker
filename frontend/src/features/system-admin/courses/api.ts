import { apiClient } from "@/shared/api/axios";
import type { PaginatedResponse, SystemCourse } from "@/shared/types";

export const fetchSystemCourses = async (params?: {
  page?: number;
  pageSize?: number;
  includeModules?: boolean;
}) => {
  const { data } = await apiClient.get<
    PaginatedResponse<SystemCourse>
  >("/system/courses", { params });
  return data;
};
