<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { BuildingOffice2Icon, UserIcon } from "@heroicons/vue/24/outline";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import PaginationControls from "@/components/ui/PaginationControls.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useSystemMembersStore } from "./store";

const membersStore = useSystemMembersStore();
const members = computed(() => membersStore.members);
const page = computed(() => membersStore.page);
const pageSize = computed(() => membersStore.pageSize);
const total = computed(() => membersStore.total);
const totalPages = computed(() => membersStore.totalPages);
const isLoading = computed(() => membersStore.isLoading);
const errorMessage = computed(() => membersStore.errorMessage);
const searchQuery = ref("");

const loadMembers = async (force = false) => {
  await membersStore.loadMembers({ force });
};

onMounted(() => {
  void loadMembers();
});

useAutoRefresh(() => loadMembers(true), { intervalMs: 60000 });

const filteredMembers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return members.value;
  }
  return members.value.filter((member) => {
    return (
      member.email.toLowerCase().includes(query) ||
      (member.name ?? "").toLowerCase().includes(query) ||
      (member.organization?.name ?? "").toLowerCase().includes(query)
    );
  });
});

const roleLabel = (role: string) => {
  if (role === "ORG_ADMIN" || role === "SYSTEM_ADMIN") {
    return "Admin";
  }
  return "Learner";
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        All Members
      </h2>
      <p class="text-gray-500">
        View every user across all organizations
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, or organization"
        class="w-full sm:max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm"
      />
      <button
        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
        :disabled="isLoading"
        @click="loadMembers(true)"
      >
        Refresh
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Member</th>
            <th class="text-left px-4 py-3">Role</th>
            <th class="text-left px-4 py-3">Organization</th>
            <th class="text-left px-4 py-3">Status</th>
            <th class="text-left px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="5"
            variant="loading"
            title="Loading members"
            message="Fetching system-wide members."
          />
          <TableStateRow
            v-else-if="filteredMembers.length === 0"
            :colspan="5"
            variant="empty"
            title="No members found"
            message="Try adjusting your search."
          />
          <tr v-for="member in filteredMembers" :key="member.id">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center"
                >
                  <UserIcon class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ member.name || "Unnamed" }}
                  </p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="member.role === 'LEARNER'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-900 text-white'"
              >
                {{ roleLabel(member.role) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 text-gray-700">
                <BuildingOffice2Icon class="h-4 w-4 text-gray-400" />
                <span>
                  {{ member.organization?.name || "No organization" }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="member.organization?.isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-600'"
              >
                {{ member.organization?.isActive ? "Active" : "Inactive" }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ new Date(member.createdAt).toLocaleDateString("en-GB") }}
            </td>
          </tr>
        </tbody>
      </table>

      <PaginationControls
        :page="page"
        :page-size="pageSize"
        :total="total"
        :total-pages="totalPages"
        :is-loading="isLoading"
        @prev="membersStore.loadMembers({ page: page - 1 })"
        @next="membersStore.loadMembers({ page: page + 1 })"
      />
    </div>
  </div>
</template>
