import { apiClient } from "@/shared/api/axios";
import type { Organization } from "@/shared/types";

export const fetchOrganization = async () => {
  const { data } = await apiClient.get<Organization>(
    "/organizations/me"
  );
  return data;
};

export const createOrganization = async (name: string) => {
  const { data } = await apiClient.post<Organization>(
    "/organizations",
    { name }
  );
  return data;
};

export const updateOrganization = async (name: string) => {
  const { data } = await apiClient.put<Organization>(
    "/organizations",
    {
      name,
    }
  );
  return data;
};

export const deactivateOrganization = async () => {
  const { data } = await apiClient.delete<Organization>(
    "/organizations"
  );
  return data;
};

export const activateOrganization = async () => {
  const { data } = await apiClient.patch<Organization>(
    "/organizations/activate"
  );
  return data;
};

export const deleteOrganization = async () => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    "/organizations/permanent"
  );
  return data;
};
