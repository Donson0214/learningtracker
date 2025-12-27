import { apiClient } from "@/shared/api/axios";
import type { OrganizationInvite, User } from "@/shared/types";

export const acceptInvite = async (token: string) => {
  const { data } = await apiClient.post<{ success: boolean; user?: User }>(
    "/invites/accept",
    { token }
  );
  return data;
};

export const fetchMyInvites = async () => {
  const { data } = await apiClient.get<OrganizationInvite[]>(
    "/invites/me"
  );
  return data;
};

export const acceptInviteById = async (inviteId: string) => {
  const { data } = await apiClient.post<{ success: boolean; user?: User }>(
    `/invites/${inviteId}/accept`
  );
  return data;
};

export const declineInviteById = async (inviteId: string) => {
  const { data } = await apiClient.post<{ success: boolean }>(
    `/invites/${inviteId}/decline`
  );
  return data;
};
