<script setup lang="ts">
import { computed, ref } from "vue";
import {
  UserPlusIcon,
  EnvelopeIcon,
  BookOpenIcon,
} from "@heroicons/vue/24/outline";
import Modal from "@/components/ui/Modal.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import PaginationControls from "@/components/ui/PaginationControls.vue";
import type { OrganizationMember } from "@/shared/types";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useAdminMembersStore } from "./store";
import { useAuthStore } from "@/features/auth/store";

const membersStore = useAdminMembersStore();
const auth = useAuthStore();
const members = computed(() => membersStore.members);
const invites = computed(() => membersStore.invites);
const summary = computed(() => membersStore.summary);
const membersPage = computed(() => membersStore.membersPage);
const membersPageSize = computed(() => membersStore.membersPageSize);
const membersTotal = computed(() => membersStore.membersTotal);
const membersTotalPages = computed(() => membersStore.membersTotalPages);
const courseCatalog = computed(() => membersStore.courseCatalog);
const catalogPage = computed(() => membersStore.catalogPage);
const catalogPageSize = computed(() => membersStore.catalogPageSize);
const catalogTotal = computed(() => membersStore.catalogTotal);
const catalogTotalPages = computed(() => membersStore.catalogTotalPages);
const isCatalogLoading = computed(() => membersStore.isCatalogLoading);
const isEnrollmentsLoading = computed(
  () => membersStore.isEnrollmentsLoading
);
const enrollmentsByUser = computed(
  () => membersStore.enrollmentsByUser
);
const isLoading = computed(() => membersStore.isLoading);
const errorMessage = computed(() => membersStore.errorMessage);

const showAssignModal = ref(false);
const selectedMember = ref<OrganizationMember | null>(null);
const selectedCourseIds = ref<string[]>([]);
const isSaving = ref(false);
const showInviteModal = ref(false);
const isInviting = ref(false);
const inviteForm = ref({
  email: "",
  role: "LEARNER" as "LEARNER" | "ORG_ADMIN",
});
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Confirm",
  onConfirm: null as null | (() => Promise<void>),
});
const isConfirming = ref(false);

const loadData = async (force = false) => {
  try {
    await membersStore.loadAll({ force });
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    // Loading state handled in store.
  }
};

useAutoRefresh(() => loadData(true), { intervalMs: 60000 });
useRealtimeRefresh(
  [
    "organizations.changed",
    "enrollments.changed",
    "users.changed",
    "invites.changed",
  ],
  () => loadData(true)
);

const totalMembers = computed(() => summary.value.total);
const learnerCount = computed(() => summary.value.learners);
const adminCount = computed(() => summary.value.admins);
const pendingInvites = computed(() =>
  invites.value.filter((invite) => invite.status === "PENDING")
);

const openAssignCourses = async (member: OrganizationMember) => {
  selectedMember.value = member;
  showAssignModal.value = true;
  await Promise.all([
    membersStore.loadCourseCatalog({ page: 1 }),
    membersStore.loadEnrollmentsForUser(member.id),
  ]);
  const current = enrollmentsByUser.value[member.id] ?? {};
  selectedCourseIds.value = Object.keys(current);
};

const removeMember = async (memberId: string) => {
  try {
    await membersStore.removeMember(memberId);
  } catch (error) {
    // Store already sets errorMessage.
  }
};

const saveAssignments = async () => {
  if (!selectedMember.value) return;
  isSaving.value = true;
  try {
    await membersStore.updateEnrollmentsForUser(
      selectedMember.value.id,
      selectedCourseIds.value
    );
    showAssignModal.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isSaving.value = false;
  }
};

const roleLabel = (role: OrganizationMember["role"]) => {
  if (role === "ORG_ADMIN" || role === "SYSTEM_ADMIN") {
    return "Admin";
  }
  return "Learner";
};

const sendInvite = async () => {
  if (!inviteForm.value.email.trim()) {
    membersStore.clearError();
    membersStore.errorMessage = "Invite email is required.";
    return;
  }
  isInviting.value = true;
  try {
    await membersStore.sendInvite({
      email: inviteForm.value.email.trim(),
      role: inviteForm.value.role,
    });
    inviteForm.value = { email: "", role: "LEARNER" };
    showInviteModal.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isInviting.value = false;
  }
};

const removeInvite = async (inviteId: string) => {
  try {
    await membersStore.removeInvite(inviteId);
  } catch (error) {
    // Store already sets errorMessage.
  }
};

const openConfirm = (payload: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}) => {
  confirmDialog.value = {
    open: true,
    title: payload.title,
    message: payload.message,
    confirmLabel: payload.confirmLabel ?? "Confirm",
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
  isConfirming.value = true;
  try {
    await confirmDialog.value.onConfirm();
    confirmDialog.value.open = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isConfirming.value = false;
  }
};

const requestRevokeInvite = (email: string, inviteId: string) => {
  openConfirm({
    title: "Revoke invite",
    message: `Revoke the invite sent to ${email}?`,
    confirmLabel: "Revoke invite",
    onConfirm: () => removeInvite(inviteId),
  });
};

const requestRemoveMember = (member: OrganizationMember) => {
  openConfirm({
    title: "Remove member",
    message: `Remove ${member.name || member.email} from this organization?`,
    confirmLabel: "Remove member",
    onConfirm: () => removeMember(member.id),
  });
};

const goToMembersPage = async (targetPage: number) => {
  if (targetPage < 1 || targetPage > membersTotalPages.value) {
    return;
  }
  await membersStore.loadMembers({ page: targetPage });
};

const goToCatalogPage = async (targetPage: number) => {
  if (targetPage < 1 || targetPage > catalogTotalPages.value) {
    return;
  }
  await membersStore.loadCourseCatalog({ page: targetPage });
};

const catalogRangeLabel = computed(() => {
  if (!catalogTotal.value) {
    return "Showing 0 of 0";
  }
  const start =
    (catalogPage.value - 1) * catalogPageSize.value + 1;
  const end = Math.min(
    catalogTotal.value,
    catalogPage.value * catalogPageSize.value
  );
  return `Showing ${start}-${end} of ${catalogTotal.value}`;
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Member Management
        </h2>
        <p class="text-gray-500">
          Manage learners and assign courses
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2
                 bg-gray-900 text-white
                 px-4 py-2 rounded-lg
                 text-sm font-medium
                 hover:bg-gray-800"
          @click="showInviteModal = true"
        >
          <UserPlusIcon class="h-4 w-4" />
          Invite Member
        </button>
        <button
          class="flex items-center gap-2
                 border border-gray-300 text-gray-700
                 px-4 py-2 rounded-lg
                 text-sm font-medium
                 hover:bg-gray-100"
          @click="loadData(true)"
        >
          Refresh Members
        </button>
      </div>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Total Members</p>
        <p class="text-2xl font-semibold text-gray-900">{{ totalMembers }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Learners</p>
        <p class="text-2xl font-semibold text-gray-900">{{ learnerCount }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Admins</p>
        <p class="text-2xl font-semibold text-gray-900">{{ adminCount }}</p>
      </div>
    </div>

    <!-- Pending Invites -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">Pending Invites</h3>
        <p class="text-sm text-gray-500">
          Invites that have not been accepted yet
        </p>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Role</th>
            <th class="text-left px-4 py-3">Expires</th>
            <th class="text-left px-4 py-3">Invited By</th>
            <th class="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="5"
            variant="loading"
            title="Loading invites"
            message="Fetching pending invites."
          />
          <TableStateRow
            v-else-if="pendingInvites.length === 0"
            :colspan="5"
            variant="empty"
            title="No pending invites"
            message="Send an invite to add a new member."
          />
          <tr v-for="invite in pendingInvites" :key="invite.id">
            <td class="px-4 py-3 font-medium text-gray-900">
              {{ invite.email }}
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="invite.role === 'ORG_ADMIN'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700'"
              >
                {{ invite.role === "ORG_ADMIN" ? "Admin" : "Learner" }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ new Date(invite.expiresAt).toLocaleDateString() }}
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ invite.invitedBy?.name || invite.invitedBy?.email || "Admin" }}
            </td>
            <td class="px-4 py-3">
              <button
                class="text-rose-600 hover:text-rose-700 text-sm"
                @click="requestRevokeInvite(invite.email, invite.id)"
              >
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <PaginationControls
        :page="membersPage"
        :page-size="membersPageSize"
        :total="membersTotal"
        :total-pages="membersTotalPages"
        :is-loading="isLoading"
        @prev="goToMembersPage(membersPage - 1)"
        @next="goToMembersPage(membersPage + 1)"
      />
    </div>

    <!-- Members Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">All Members</h3>
        <p class="text-sm text-gray-500">
          View and manage organization members
        </p>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Name</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Role</th>
            <th class="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="4"
            variant="loading"
            title="Loading members"
            message="Fetching organization members."
          />
          <TableStateRow
            v-else-if="members.length === 0 && membersTotal > 0"
            :colspan="4"
            variant="empty"
            title="No members on this page"
            message="Try navigating to a previous page."
          />
          <TableStateRow
            v-else-if="members.length === 0"
            :colspan="4"
            variant="empty"
            title="No members yet"
            message="Invite learners to grow your organization."
          />
          <tr v-for="member in members" :key="member.id">
            <td class="px-4 py-3 font-medium text-gray-900">
              {{ member.name || "Unnamed" }}
            </td>
            <td class="px-4 py-3 text-gray-500">
              <div class="flex items-center gap-2">
                <EnvelopeIcon class="h-4 w-4 text-gray-400" />
                {{ member.email }}
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       text-xs font-medium"
                :class="member.role === 'LEARNER'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-900 text-white'"
              >
                {{ roleLabel(member.role) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 text-sm text-gray-700">
                <button
                  class="inline-flex items-center gap-2 text-gray-700"
                  @click="openAssignCourses(member)"
                >
                  <BookOpenIcon class="h-4 w-4" />
                  Assign Courses
                </button>
                <button
                  v-if="member.id !== auth.user?.id && member.role !== 'SYSTEM_ADMIN'"
                  class="text-rose-600 hover:text-rose-700 text-sm"
                  @click="requestRemoveMember(member)"
                >
                  Remove
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :open="showAssignModal" title="Assign Courses" @close="showAssignModal = false">
      <div v-if="selectedMember" class="space-y-4">
        <div>
          <p class="text-sm text-slate-300">Assign courses to</p>
          <p class="text-base font-semibold text-white">
            {{ selectedMember.name || selectedMember.email }}
          </p>
        </div>

        <StateMessage
          v-if="isCatalogLoading || isEnrollmentsLoading"
          variant="loading"
          title="Loading courses"
          message="Fetching available courses."
        />

        <StateMessage
          v-else-if="courseCatalog.length === 0"
          variant="empty"
          title="No courses available"
          message="Create a course to assign it to learners."
        />

        <div v-else class="space-y-2">
          <label
            v-for="course in courseCatalog"
            :key="course.id"
            class="flex items-center gap-2 text-sm text-slate-200"
          >
            <input
              v-model="selectedCourseIds"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400"
              :value="course.id"
            />
            {{ course.title }}
          </label>

          <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{{ catalogRangeLabel }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                :disabled="catalogPage === 1 || isCatalogLoading"
                @click="goToCatalogPage(catalogPage - 1)"
              >
                Prev
              </button>
              <span>Page {{ catalogPage }} of {{ catalogTotalPages }}</span>
              <button
                type="button"
                class="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                :disabled="catalogPage === catalogTotalPages || isCatalogLoading"
                @click="goToCatalogPage(catalogPage + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="showAssignModal = false"
          >
            Cancel
          </button>
          <Button
            type="button"
            :disabled="isSaving || isCatalogLoading || isEnrollmentsLoading"
            @click="saveAssignments"
          >
            {{ isSaving ? "Saving..." : "Save" }}
          </Button>
        </div>
      </div>
      <div v-else class="text-sm text-slate-300">
        Select a member to assign courses.
      </div>
    </Modal>

    <Modal :open="showInviteModal" title="Invite Member" @close="showInviteModal = false">
      <form class="space-y-4" @submit.prevent="sendInvite">
        <div>
          <label class="text-sm text-slate-300">Email</label>
          <Input v-model="inviteForm.email" placeholder="learner@example.com" />
        </div>
        <div>
          <label class="text-sm text-slate-300">Role</label>
          <select
            v-model="inviteForm.role"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/70
                   px-3 py-2 text-sm text-slate-100"
          >
            <option value="LEARNER">Learner</option>
            <option value="ORG_ADMIN">Admin</option>
          </select>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm text-slate-300"
            @click="showInviteModal = false"
          >
            Cancel
          </button>
          <Button type="submit" :disabled="isInviting">
            {{ isInviting ? "Sending..." : "Send Invite" }}
          </Button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirming="isConfirming"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
