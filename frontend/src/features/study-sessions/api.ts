import { apiClient } from "@/shared/api/axios";
import type { StudySession } from "@/shared/types";

export const fetchStudySessions = async () => {
  const { data } = await apiClient.get<StudySession[]>("/study-sessions/me");
  return data;
};

export const createStudySession = async (payload: {
  courseId: string;
  moduleId?: string | null;
  durationMinutes: number;
  notes?: string;
  mood?: string;
  studiedAt: string;
}) => {
  const { data } = await apiClient.post<StudySession>(
    "/study-sessions",
    payload
  );
  return data;
};

export const updateStudySession = async (
  sessionId: string,
  payload: {
    durationMinutes?: number;
    notes?: string;
    mood?: string;
    studiedAt?: string;
  }
) => {
  const { data } = await apiClient.put<{ success: boolean }>(
    `/study-sessions/${sessionId}`,
    payload
  );
  return data;
};

export const deleteStudySession = async (sessionId: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(
    `/study-sessions/${sessionId}`
  );
  return data;
};
