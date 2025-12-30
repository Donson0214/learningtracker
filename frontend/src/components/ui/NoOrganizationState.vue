<script setup lang="ts">
import { computed } from "vue";
import { BuildingOffice2Icon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/store";

const auth = useAuthStore();
const isOrgInactive = computed(
  () =>
    Boolean(
      auth.user?.organization && !auth.user.organization.isActive
    )
);
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6">
    <div class="flex items-start gap-4">
      <div
        class="h-10 w-10 rounded-full bg-blue-100 text-blue-600
               flex items-center justify-center"
      >
        <BuildingOffice2Icon class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <h3 class="text-base font-semibold text-gray-900">
          {{ isOrgInactive ? "Organization paused" : "No organization yet" }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          <span v-if="isOrgInactive">
            Your organization has been paused by an administrator. You can create a new organization or ask an admin to reactivate it.
          </span>
          <span v-else>
            Join an organization to access courses, study plans, and notifications.
            Ask your admin for an invite or create your own organization.
          </span>
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink
            to="/notifications"
            class="inline-flex items-center justify-center rounded-lg border border-gray-300
                   px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            View invites
          </RouterLink>
          <RouterLink
            to="/profile"
            class="inline-flex items-center justify-center rounded-lg bg-gray-900
                   px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
          >
            {{ isOrgInactive ? "Create new organization" : "Create organization" }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
