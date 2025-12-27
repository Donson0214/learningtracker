import { createRouter, createWebHistory } from "vue-router";

/* ======================
   LEARNER PAGES
====================== */
import AppLayout from "@/components/layout/AppLayout.vue";

import DashboardPage from "@/features/dashboard/pages/DashboardPage.vue";
import CoursesPage from "@/features/courses/pages/CoursesPage.vue";
import StudyPlanPage from "@/features/study-plan/pages/StudyPlanPage.vue";
import StudySessionsPage from "@/features/study-sessions/pages/StudySessionsPage.vue";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage.vue";
import ProfileGoalsPage from "@/features/profile/pages/ProfileGoalsPage.vue";

/* ======================
   ADMIN LAYOUT + PAGES
====================== */
import AdminLayout from "@/components/layout/AdminLayout.vue";

import AdminDashboardPage from "@/features/admin/dashboard/AdminDashboardPage.vue";
import OrganizationPage from "@/features/admin/organization/OrganizationPage.vue";
import AdminCoursesPage from "@/features/admin/courses/AdminCoursesPage.vue";
import MembersPage from "@/features/admin/members/MembersPage.vue";
import AnalyticsPage from "@/features/admin/analytics/AnalyticsPage.vue";

const routes = [
  /* ---------- Learner ---------- */
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", component: DashboardPage },
      { path: "courses", component: CoursesPage },
      { path: "study-plan", component: StudyPlanPage },
      { path: "study-sessions", component: StudySessionsPage },
      { path: "notifications", component: NotificationsPage },
      { path: "profile", component: ProfileGoalsPage },
    ],
  },

  /* ---------- Admin ---------- */
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", component: AdminDashboardPage },
      { path: "organization", component: OrganizationPage },
      { path: "courses", component: AdminCoursesPage },
      { path: "members", component: MembersPage },
      { path: "analytics", component: AnalyticsPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
