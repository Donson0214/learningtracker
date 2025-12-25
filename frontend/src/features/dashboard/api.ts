import { apiClient } from "@/shared/api/axios";
import type { StudyPlanItem, StudySession } from "@/shared/types";

export type LearnerDashboard = {
  totalStudyMinutes: number;
  totalSessions: number;
  enrolledCourses: number;
  recentSessions: StudySession[];
  upcomingItems: StudyPlanItem[];
};

export const fetchLearnerDashboard = async () => {
  const { data } = await apiClient.get<LearnerDashboard>("/analytics/me");
  return data;
};
