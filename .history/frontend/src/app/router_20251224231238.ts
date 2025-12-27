import { createRouter, createWebHistory } from "vue-router";

import DashboardPage from "@/features/dashboard/pages/DashboardPage.vue";
import CoursesPage from "@/features/courses/pages/CoursesPage.vue";
import CourseDetailsPage from "@/features/courses/pages/CourseDetailsPage.vue";
import StudyPlanPage from "@/features/study-plan/pages/StudyPlanPage.vue";
import StudySessionsPage from "@/features/study-sessions/pages/StudySessionsPage.vue";
import ProfileGoalsPage from "@/features/profile/pages/ProfileGoalsPage.vue";
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import RegisterPage from "@/features/auth/pages/RegisterPage.vue";
import { requireAuth } from "@/shared/guards/auth.guard";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/courses",
      name: "courses",
      component: CoursesPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/courses/:id",
      name: "course-details",
      component: CourseDetailsPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/study-plan",
      name: "study-plan",
      component: StudyPlanPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/study-sessions",
      name: "study-sessions",
      component: StudySessionsPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile-goals",
      component: ProfileGoalsPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    return requireAuth(to.fullPath);
  }
  return true;
});

export default router;
