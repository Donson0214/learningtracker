import { apiClient } from "@/shared/api/axios";
import type { Course, Enrollment } from "@/shared/types";

export const fetchMyEnrollments = async () => {
  const { data } = await apiClient.get<Enrollment[]>("/enrollments/me");
  return data;
};

export const fetchCourseById = async (courseId: string) => {
  const { data } = await apiClient.get<Course>(`/courses/${courseId}`);
  return data;
};
