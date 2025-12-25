export type User = {
  id: string;
  name?: string | null;
  email: string;
  role: "LEARNER" | "ORG_ADMIN" | "SYSTEM_ADMIN";
  organization?: Organization | null;
  dailyReminderEnabled?: boolean;
};

export type Organization = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
};

export type OrganizationMember = {
  id: string;
  name?: string | null;
  email: string;
  role: "LEARNER" | "ORG_ADMIN" | "SYSTEM_ADMIN";
};

export type OrganizationWithMembers = Organization & {
  users?: OrganizationMember[];
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type OrganizationMembersSummary = {
  total: number;
  learners: number;
  admins: number;
};

export type OrganizationMembersResponse = PaginatedResponse<OrganizationMember> & {
  summary: OrganizationMembersSummary;
};

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export type OrganizationInvite = {
  id: string;
  organizationId: string;
  email: string;
  role: "LEARNER" | "ORG_ADMIN" | "SYSTEM_ADMIN";
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
  invitedBy?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  acceptedBy?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string | null;
  estimatedHours?: number | null;
  organizationId?: string;
  modules?: Module[];
  modulesCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  course?: Course;
  user?: User;
};

export type StudySession = {
  id: string;
  userId: string;
  courseId: string;
  moduleId?: string | null;
  durationMinutes: number;
  notes?: string | null;
  mood?: string | null;
  studiedAt: string;
  course?: Course;
  module?: Module | null;
};

export type StudyGoal = {
  id: string;
  userId: string;
  hoursPerWeek: number;
  targetCompletionAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyPlanItem = {
  id: string;
  studyPlanId: string;
  courseId: string;
  moduleId?: string | null;
  scheduledDate: string;
  durationMinutes: number;
  isCompleted: boolean;
  course?: Course;
  module?: Module | null;
};

export type StudyPlan = {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  items: StudyPlanItem[];
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type OrgAnalytics = {
  totals: {
    totalLearners: number;
    totalCourses: number;
    totalStudyMinutes: number;
    avgStudyMinutesPerLearner: number;
  };
  enrollmentTrend: Array<{ label: string; count: number }>;
  studyMinutesByCourse: Array<{
    courseId: string;
    title: string;
    minutes: number;
  }>;
  topLearners: Array<{ userId: string; name: string; minutes: number }>;
  monthlyStudyMinutes: Array<{ label: string; minutes: number }>;
  completionRates: Array<{
    courseId: string;
    title: string;
    completionRate: number;
  }>;
  engagementLevels: Array<{ label: string; count: number }>;
  pace: Array<{
    label: string;
    targetMinutes: number;
    actualMinutes: number;
  }>;
};
