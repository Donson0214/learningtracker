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
  const { data } = await apiClient.get<
    OrganizationInvite[] | { items?: OrganizationInvite[] }
  >("/invites/me");
  if (Array.isArray(data)) {
    return data;
  }
  return Array.isArray(data?.items) ? data.items : [];
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
