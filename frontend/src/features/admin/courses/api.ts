import { apiClient } from "@/shared/api/axios";
import type { Course, Lesson, Module, PaginatedResponse } from "@/shared/types";

export const fetchCourses = async (params?: {
  page?: number;
  pageSize?: number;
  includeModules?: boolean;
}) => {
  const { data } = await apiClient.get<PaginatedResponse<Course>>(
    "/courses",
    { params }
  );
  return data;
};

export const createCourse = async (payload: {
  title: string;
  description?: string;
  estimatedHours?: number | null;
}) => {
  const { data } = await apiClient.post<Course>("/courses", payload);
  return data;
};

export const updateCourse = async (
  courseId: string,
  payload: {
    title?: string;
    description?: string;
    estimatedHours?: number | null;
  }
) => {
  const { data } = await apiClient.put<{ success: boolean }>(
    `/courses/${courseId}`,
    payload
  );
  return data;
};

export const deleteCourse = async (courseId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/courses/${courseId}`
  );
  return data;
};

export const fetchModules = async (courseId: string) => {
  const { data } = await apiClient.get<Module[]>(
    `/courses/${courseId}/modules`
  );
  return data;
};

export const createModule = async (
  courseId: string,
  payload: { title: string; order: number }
) => {
  const { data } = await apiClient.post<Module>(
    `/courses/${courseId}/modules`,
    payload
  );
  return data;
};

export const updateModule = async (
  moduleId: string,
  payload: { title?: string; order?: number }
) => {
  const { data } = await apiClient.put<Module>(
    `/courses/modules/${moduleId}`,
    payload
  );
  return data;
};

export const deleteModule = async (moduleId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/courses/modules/${moduleId}`
  );
  return data;
};

export const createLesson = async (
  moduleId: string,
  payload: { title: string; estimatedMinutes: number }
) => {
  const { data } = await apiClient.post<Lesson>(
    `/courses/modules/${moduleId}/lessons`,
    payload
  );
  return data;
};

export const updateLesson = async (
  lessonId: string,
  payload: { title?: string; estimatedMinutes?: number }
) => {
  const { data } = await apiClient.put<{ success: boolean }>(
    `/courses/lessons/${lessonId}`,
    payload
  );
  return data;
};

export const deleteLesson = async (lessonId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/courses/lessons/${lessonId}`
  );
  return data;
};
