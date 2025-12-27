<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/store";
import AdminCoursesPage from "./AdminCoursesPage.vue";
import SystemCoursesPage from "@/features/system-admin/courses/SystemCoursesPage.vue";

const auth = useAuthStore();
const isSystemAdmin = computed(
  () => auth.user?.role === "SYSTEM_ADMIN"
);
</script>

<template>
  <SystemCoursesPage v-if="isSystemAdmin" />
  <AdminCoursesPage v-else />
</template>
