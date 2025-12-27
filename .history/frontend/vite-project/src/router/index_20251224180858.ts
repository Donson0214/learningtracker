import { createRouter, createWebHistory } from "vue-router"
import AppLayout from "@/components/layout/AppLayout.vue"

import Dashboard from "@/views/Dashboard.vue"
import Courses from "@/views/Courses.vue"

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "dashboard", component: Dashboard },
        { path: "courses", component: Courses },
      ],
    },
  ],
})
