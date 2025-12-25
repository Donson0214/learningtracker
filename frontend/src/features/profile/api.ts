import { apiClient } from "@/shared/api/axios";
import type { StudyGoal } from "@/shared/types";

export const fetchStudyGoal = async () => {
  const { data } = await apiClient.get<StudyGoal>("/study-goals/me");
  return data;
};

export const createStudyGoal = async (payload: {
  hoursPerWeek: number;
  targetDate?: string | null;
}) => {
  const { data } = await apiClient.post<StudyGoal>("/study-goals", payload);
  return data;
};

export const updateStudyGoal = async (
  goalId: string,
  payload: {
    hoursPerWeek?: number;
    targetDate?: string | null;
  }
) => {
  const { data } = await apiClient.put<{ success: boolean }>(
    `/study-goals/${goalId}`,
    payload
  );
  return data;
};
