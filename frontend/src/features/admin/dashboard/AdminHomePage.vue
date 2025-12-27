<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/store";
import AdminDashboardPage from "./AdminDashboardPage.vue";
import SystemAdminDashboardPage from "@/features/system-admin/dashboard/SystemAdminDashboardPage.vue";

const auth = useAuthStore();
const isSystemAdmin = computed(
  () => auth.user?.role === "SYSTEM_ADMIN"
);
</script>

<template>
  <SystemAdminDashboardPage v-if="isSystemAdmin" />
  <AdminDashboardPage v-else />
</template>
