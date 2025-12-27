<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/store";
import MembersPage from "./MembersPage.vue";
import SystemMembersPage from "@/features/system-admin/members/SystemMembersPage.vue";

const auth = useAuthStore();
const isSystemAdmin = computed(
  () => auth.user?.role === "SYSTEM_ADMIN"
);
</script>

<template>
  <SystemMembersPage v-if="isSystemAdmin" />
  <MembersPage v-else />
</template>
