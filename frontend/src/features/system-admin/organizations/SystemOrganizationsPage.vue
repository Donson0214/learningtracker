<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import { useSystemOrganizationsStore } from "./store";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import StateMessage from "@/components/ui/StateMessage.vue";

const orgStore = useSystemOrganizationsStore();
const organizations = computed(() => orgStore.organizations);
const isLoading = computed(() => orgStore.isLoading);
const errorMessage = computed(() => orgStore.errorMessage);
const searchQuery = ref("");
const actionLoading = ref<{ id: string; action: "activate" | "deactivate" } | null>(null);
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "",
  onConfirm: null as null | (() => Promise<void>),
});

const loadOrganizations = async (force = false) => {
  await orgStore.loadOrganizations({ force });
};

onMounted(() => {
  void loadOrganizations();
});

useRealtimeRefresh(["system.organizations.changed"], () =>
  loadOrganizations(true)
);
useAutoRefresh(() => loadOrganizations(true), { intervalMs: 60000 });

const filteredOrganizations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return organizations.value;
  }
  return organizations.value.filter((org) => {
    return (
      org.name.toLowerCase().includes(query) ||
      org.id.toLowerCase().includes(query)
    );
  });
});

const activeCount = computed(
  () => organizations.value.filter((org) => org.isActive).length
);
const inactiveCount = computed(
  () => organizations.value.filter((org) => !org.isActive).length
);

const isBusy = (id: string) => actionLoading.value?.id === id;

const performAction = async (
  id: string,
  action: "activate" | "deactivate"
) => {
  actionLoading.value = { id, action };
  try {
    if (action === "activate") {
      await orgStore.activate(id);
    } else {
      await orgStore.deactivate(id);
    }
  } finally {
    actionLoading.value = null;
  }
};

const openConfirm = (payload: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) => {
  confirmDialog.value = {
    open: true,
    title: payload.title,
    message: payload.message,
    confirmLabel: payload.confirmLabel,
    onConfirm: payload.onConfirm,
  };
};

const closeConfirm = () => {
  confirmDialog.value.open = false;
  confirmDialog.value.onConfirm = null;
};

const handleConfirm = async () => {
  if (!confirmDialog.value.onConfirm) {
    return;
  }
  await confirmDialog.value.onConfirm();
  closeConfirm();
};

const requestDeactivate = (id: string, name: string) => {
  openConfirm({
    title: "Deactivate organization",
    message: `Deactivate ${name} and suspend access for all members?`,
    confirmLabel: "Deactivate",
    onConfirm: () => performAction(id, "deactivate"),
  });
};

const requestActivate = (id: string, name: string) => {
  openConfirm({
    title: "Reactivate organization",
    message: `Reactivate ${name} and restore access for members?`,
    confirmLabel: "Reactivate",
    onConfirm: () => performAction(id, "activate"),
  });
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Organizations
      </h2>
      <p class="text-gray-500">
        Manage tenant access and status across the platform
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <p class="text-sm text-gray-500 mb-1">Total</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ orgStore.total || organizations.length }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <p class="text-sm text-gray-500 mb-1">Active</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ activeCount }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4">
        <p class="text-sm text-gray-500 mb-1">Inactive</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ inactiveCount }}
        </p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
      <div class="relative w-full sm:max-w-xs">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search organizations"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <button
        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
        :disabled="isLoading"
        @click="loadOrganizations(true)"
      >
        Refresh
      </button>
    </div>

    <StateMessage
      v-if="isLoading && organizations.length === 0"
      variant="loading"
      title="Loading organizations"
      message="Fetching organization records."
    />

    <StateMessage
      v-else-if="filteredOrganizations.length === 0"
      variant="empty"
      title="No organizations found"
      message="Try adjusting your search."
    />

    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-3 font-medium">Organization</th>
            <th class="text-left px-4 py-3 font-medium">Status</th>
            <th class="text-left px-4 py-3 font-medium">Members</th>
            <th class="text-left px-4 py-3 font-medium">Courses</th>
            <th class="text-left px-4 py-3 font-medium">Created</th>
            <th class="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="org in filteredOrganizations" :key="org.id">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center"
                >
                  <BuildingOffice2Icon class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ org.name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ org.id }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                :class="org.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'"
              >
                <CheckCircleIcon v-if="org.isActive" class="h-3 w-3" />
                <XCircleIcon v-else class="h-3 w-3" />
                {{ org.isActive ? "Active" : "Inactive" }}
              </span>
            </td>
            <td class="px-4 py-3">
              {{ org.memberCount ?? 0 }}
            </td>
            <td class="px-4 py-3">
              {{ org.courseCount ?? 0 }}
            </td>
            <td class="px-4 py-3">
              {{ new Date(org.createdAt).toLocaleDateString("en-GB") }}
            </td>
            <td class="px-4 py-3 text-right">
              <RouterLink
                :to="`/admin/organizations/${org.id}`"
                class="text-gray-700 text-xs font-medium mr-3 hover:text-gray-900"
              >
                View
              </RouterLink>
              <button
                v-if="org.isActive"
                class="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-60"
                :disabled="isBusy(org.id)"
                @click="requestDeactivate(org.id, org.name)"
              >
                {{ isBusy(org.id) ? "Working..." : "Deactivate" }}
              </button>
              <button
                v-else
                class="border border-emerald-300 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-50 disabled:opacity-60"
                :disabled="isBusy(org.id)"
                @click="requestActivate(org.id, org.name)"
              >
                {{ isBusy(org.id) ? "Working..." : "Activate" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirming="Boolean(actionLoading)"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
