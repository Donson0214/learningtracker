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

import AdminHomePage from "@/features/admin/dashboard/AdminHomePage.vue";
import OrganizationPage from "@/features/admin/organization/OrganizationPage.vue";
import AdminCoursesHome from "@/features/admin/courses/AdminCoursesHome.vue";
import AdminMembersHome from "@/features/admin/members/AdminMembersHome.vue";
import AnalyticsPage from "@/features/admin/analytics/AnalyticsPage.vue";
import SystemOrganizationsPage from "@/features/system-admin/organizations/SystemOrganizationsPage.vue";
import SystemOrganizationDetailPage from "@/features/system-admin/organizations/SystemOrganizationDetailPage.vue";
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
      { path: "", component: AdminHomePage },
      {
        path: "organization",
        component: OrganizationPage,
        meta: { requiresRole: ["ORG_ADMIN"] },
      },
      {
        path: "courses",
        component: AdminCoursesHome,
        meta: { requiresRole: ["ORG_ADMIN", "SYSTEM_ADMIN"] },
      },
      {
        path: "members",
        component: AdminMembersHome,
        meta: { requiresRole: ["ORG_ADMIN", "SYSTEM_ADMIN"] },
      },
      {
        path: "analytics",
        component: AnalyticsPage,
        meta: { requiresRole: ["ORG_ADMIN"] },
      },
      {
        path: "organizations",
        component: SystemOrganizationsPage,
        meta: { requiresRole: ["SYSTEM_ADMIN"] },
      },
      {
        path: "organizations/:organizationId",
        component: SystemOrganizationDetailPage,
        meta: { requiresRole: ["SYSTEM_ADMIN"] },
      },
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
