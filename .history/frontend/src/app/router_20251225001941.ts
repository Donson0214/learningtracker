import { createRouter, createWebHistory } from "vue-router";

import DashboardPage from "@/features/dashboard/pages/DashboardPage.vue";
import CoursesPage from "@/features/courses/pages/CoursesPage.vue";
import StudyPlanPage from "@/features/study-plan/pages/StudyPlanPage.vue";
import StudySessionsPage from "@/features/study-sessions/pages/StudySessionsPage.vue";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage.vue";
import ProfileGoalsPage from "@/features/profile/pages/ProfileGoalsPage.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: DashboardPage },
  { path: "/courses", component: CoursesPage },
  { path: "/study-plan", component: StudyPlanPage },
  { path: "/study-sessions", component: StudySessionsPage },
  { path: "/notifications", component: NotificationsPage },
  { path: "/profile", component: ProfileGoalsPage },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
