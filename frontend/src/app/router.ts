import { createRouter, createWebHistory } from "vue-router";

/* ======================
   LEARNER PAGES (UNCHANGED)
====================== */
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import RegisterPage from "@/features/auth/pages/RegisterPage.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import DashboardPage from "@/features/dashboard/pages/DashboardPage.vue";
import CoursesPage from "@/features/courses/pages/CoursesPage.vue";
import CourseDetailsPage from "@/features/courses/pages/CourseDetailsPage.vue";
import StudyPlanPage from "@/features/study-plan/pages/StudyPlanPage.vue";
import StudySessionsPage from "@/features/study-sessions/pages/StudySessionsPage.vue";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage.vue";
import ProfileGoalsPage from "@/features/profile/pages/ProfileGoalsPage.vue";
import InviteAcceptPage from "@/features/invites/pages/InviteAcceptPage.vue";

/* ======================
   ADMIN LAYOUT + PAGES
====================== */
import AdminLayout from "@/components/layout/AdminLayout.vue";

import AdminDashboardPage from "@/features/admin/dashboard/AdminDashboardPage.vue";
import OrganizationPage from "@/features/admin/organization/OrganizationPage.vue";
import AdminCoursesPage from "@/features/admin/courses/AdminCoursesPage.vue";
import MembersPage from "@/features/admin/members/MembersPage.vue";
import AnalyticsPage from "@/features/admin/analytics/AnalyticsPage.vue";
import { useAuthStore } from "@/features/auth/store";

const routes = [
  { path: "/login", component: LoginPage, meta: { public: true } },
  { path: "/register", component: RegisterPage, meta: { public: true } },
  { path: "/invite", component: InviteAcceptPage, meta: { public: true } },

  /* ---------- Learner (UNCHANGED) ---------- */
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", component: DashboardPage },
      { path: "courses", component: CoursesPage },
      { path: "courses/:courseId", component: CourseDetailsPage },
      { path: "study-plan", component: StudyPlanPage },
      { path: "study-sessions", component: StudySessionsPage },
      { path: "notifications", component: NotificationsPage },
      { path: "profile", component: ProfileGoalsPage },
    ],
  },

  /* ---------- Admin (NEW, ISOLATED) ---------- */
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: ["ORG_ADMIN", "SYSTEM_ADMIN"] },
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

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.initialize();

  if (to.meta.public) {
    if (auth.isAuthenticated && (to.path === "/login" || to.path === "/register")) {
      const isAdmin =
        auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
      return { path: isAdmin ? "/admin" : "/dashboard" };
    }
    return true;
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  const requiredRoles = to.meta.requiresRole as string[] | undefined;
  if (requiredRoles && (!auth.user || !requiredRoles.includes(auth.user.role))) {
    return { path: "/dashboard" };
  }

  return true;
});

export default router;
