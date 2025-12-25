import { apiClient } from "@/shared/api/axios";
import type {
  Enrollment,
  OrganizationInvite,
  OrganizationMembersResponse,
} from "@/shared/types";

export const fetchOrganizationMembers = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const { data } = await apiClient.get<OrganizationMembersResponse>(
    "/organizations/me/members",
    { params }
  );
  return data;
};

export const fetchUserEnrollments = async (userId: string) => {
  const { data } = await apiClient.get<Enrollment[]>(
    `/enrollments/user/${userId}`
  );
  return data;
};

export const enrollLearner = async (payload: {
  userId: string;
  courseId: string;
}) => {
  const { data } = await apiClient.post<Enrollment>(
    "/enrollments",
    payload
  );
  return data;
};

export const unenrollLearner = async (enrollmentId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/enrollments/${enrollmentId}`
  );
  return data;
};

export const fetchInvites = async () => {
  const { data } = await apiClient.get<OrganizationInvite[]>(
    "/invites"
  );
  return data;
};

export const createInvite = async (payload: {
  email: string;
  role: "LEARNER" | "ORG_ADMIN";
}) => {
  const { data } = await apiClient.post<OrganizationInvite>(
    "/invites",
    payload
  );
  return data;
};

export const revokeInvite = async (inviteId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/invites/${inviteId}`
  );
  return data;
};
