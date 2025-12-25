import { apiClient } from "@/shared/api/axios";
import type { StudyPlan } from "@/shared/types";

export const fetchStudyPlans = async () => {
  const { data } = await apiClient.get<StudyPlan[]>("/study-plans/me");
  return data;
};

export const generateStudyPlan = async (payload: {
  courseIds: string[];
  hoursPerWeek: number;
  targetDate: string;
}) => {
  const { data } = await apiClient.post<StudyPlan>(
    "/study-plans/generate",
    payload
  );
  return data;
};

export const completePlanItem = async (itemId: string) => {
  const { data } = await apiClient.patch<{ success: boolean }>(
    `/study-plans/items/${itemId}/complete`
  );
  return data;
};

export const reschedulePlanItem = async (
  itemId: string,
  scheduledDate: string
) => {
  const { data } = await apiClient.patch<{ success: boolean }>(
    `/study-plans/items/${itemId}/reschedule`,
    { scheduledDate }
  );
  return data;
};
