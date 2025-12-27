import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "@/views/Dashboard.vue";
import Courses from "@/views/Courses.vue";
import StudyPlan from "@/views/StudyPlan.vue";
import StudySessions from "@/views/StudySessions.vue";
import Notifications from "@/views/Notifications.vue";
import ProfileGoals from "@/views/ProfileGoals.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/courses", component: Courses },
  { path: "/study-plan", component: StudyPlan },
  { path: "/study-sessions", component: StudySessions },
  { path: "/notifications", component: Notifications },
  { path: "/profile-goals", component: ProfileGoals },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
