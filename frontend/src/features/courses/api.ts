import { apiClient } from "@/shared/api/axios";
import type { Course, Enrollment, PaginatedResponse } from "@/shared/types";

export const fetchMyEnrollments = async () => {
  const { data } = await apiClient.get<Enrollment[]>("/enrollments/me");
  return data;
};

export const fetchCourseById = async (courseId: string) => {
  const { data } = await apiClient.get<Course>(`/courses/${courseId}`);
  return data;
};

export const fetchCourseCatalog = async (params?: {
  page?: number;
  pageSize?: number;
  includeModules?: boolean;
}) => {
  const { data } = await apiClient.get<PaginatedResponse<Course>>(
    "/courses/catalog",
    { params }
  );
  return data;
};

export const selfEnroll = async (courseId: string) => {
  const { data } = await apiClient.post<Enrollment>(
    "/enrollments/self",
    { courseId }
  );
  return data;
};

export const selfUnenroll = async (courseId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/enrollments/self/${courseId}`
  );
  return data;
};
