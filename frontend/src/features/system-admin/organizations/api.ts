import { apiClient } from "@/shared/api/axios";
import type {
  PaginatedResponse,
  SystemOrganization,
  SystemMember,
  SystemCourse,
} from "@/shared/types";

export const fetchSystemOrganizations = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const { data } = await apiClient.get<
    PaginatedResponse<SystemOrganization>
  >("/system/organizations", { params });
  return data;
};

export const fetchSystemOrganization = async (id: string) => {
  const { data } = await apiClient.get<SystemOrganization>(
    `/system/organizations/${id}`
  );
  return data;
};

export const fetchSystemOrganizationMembers = async (
  id: string,
  params?: { page?: number; pageSize?: number }
) => {
  const { data } = await apiClient.get<
    PaginatedResponse<SystemMember>
  >(`/system/organizations/${id}/members`, { params });
  return data;
};

export const fetchSystemOrganizationCourses = async (
  id: string,
  params?: { page?: number; pageSize?: number; includeModules?: boolean }
) => {
  const { data } = await apiClient.get<
    PaginatedResponse<SystemCourse>
  >(`/system/organizations/${id}/courses`, { params });
  return data;
};

export const activateSystemOrganization = async (id: string) => {
  const { data } = await apiClient.patch<SystemOrganization>(
    `/system/organizations/${id}/activate`
  );
  return data;
};

export const deactivateSystemOrganization = async (id: string) => {
  const { data } = await apiClient.patch<SystemOrganization>(
    `/system/organizations/${id}/deactivate`
  );
  return data;
};

export const deleteSystemOrganization = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/system/organizations/${id}`
  );
  return data;
};
