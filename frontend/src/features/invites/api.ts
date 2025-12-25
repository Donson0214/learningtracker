import { apiClient } from "@/shared/api/axios";
import type { User } from "@/shared/types";

export const acceptInvite = async (token: string) => {
  const { data } = await apiClient.post<{ success: boolean; user?: User }>(
    "/invites/accept",
    { token }
  );
  return data;
};
