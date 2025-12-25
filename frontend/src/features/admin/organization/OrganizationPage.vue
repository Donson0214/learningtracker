<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";
import { useAdminOrganizationStore } from "./store";
import { useAdminCoursesStore } from "@/features/admin/courses/store";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import StateMessage from "@/components/ui/StateMessage.vue";

const orgStore = useAdminOrganizationStore();
const coursesStore = useAdminCoursesStore();
const organization = computed(() => orgStore.organization);
const totalCourses = computed(() => coursesStore.total);
const isLoading = computed(() => orgStore.isLoading);
const nameInput = ref("");
const isActive = ref(true);
const isSaving = ref(false);
const isDeactivating = ref(false);
const errorMessage = computed(
  () => orgStore.errorMessage || coursesStore.errorMessage
);
const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Deactivate",
  onConfirm: null as null | (() => Promise<void>),
});

const loadData = async (force = false) => {
  try {
    await Promise.all([
      orgStore.loadOrganization(),
      coursesStore.loadCourses({
        silent: true,
        includeModules: false,
        force,
      }),
    ]);
    if (organization.value) {
      nameInput.value = organization.value.name;
      isActive.value = organization.value.isActive;
    }
  } catch (error) {
    // Store already sets errorMessage.
  }
};

onMounted(loadData);

const hasUnsavedChanges = computed(
  () => Boolean(organization.value) && nameInput.value.trim() !== (organization.value?.name ?? "")
);

useRealtimeRefresh(
  ["organizations.changed", "courses.changed", "enrollments.changed"],
  () => {
    if (isSaving.value || isDeactivating.value || hasUnsavedChanges.value) {
      return;
    }
    return loadData(true);
  }
);

const saveChanges = async () => {
  if (!nameInput.value.trim()) {
    orgStore.clearError();
    orgStore.errorMessage = "Organization name is required.";
    return;
  }
  isSaving.value = true;
  try {
    await orgStore.updateOrganizationName(nameInput.value.trim());
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isSaving.value = false;
  }
};

const deactivate = async () => {
  isDeactivating.value = true;
  try {
    await orgStore.deactivate();
    isActive.value = false;
  } catch (error) {
    // Store already sets errorMessage.
  } finally {
    isDeactivating.value = false;
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
    confirmLabel: payload.confirmLabel ?? "Deactivate",
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
  confirmDialog.value.open = false;
};

const requestDeactivate = () => {
  if (!isActive.value) {
    return;
  }
  openConfirm({
    title: "Deactivate organization",
    message:
      "Deactivate this organization and disable access for all members? This action cannot be undone.",
    confirmLabel: "Deactivate",
    onConfirm: deactivate,
  });
};

const createdAtLabel = computed(() => {
  if (!organization.value?.createdAt) return "--";
  return new Date(organization.value.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Organization Management
      </h2>
      <p class="text-gray-500">
        Manage your organization settings and details
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <StateMessage
      v-else-if="isLoading && !organization"
      class="mb-4"
      variant="loading"
      title="Loading organization"
      message="Fetching organization details."
    />

    <div v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 mb-1">Total Members</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ organization?.memberCount ?? organization?.users?.length ?? 0 }}
              </p>
            </div>
            <UsersIcon class="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 mb-1">Total Courses</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ totalCourses }}
              </p>
            </div>
            <BookOpenIcon class="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 mb-1">Created</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ createdAtLabel }}
              </p>
            </div>
            <CalendarIcon class="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- Organization Details -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="font-semibold text-gray-900">Organization Details</h3>
            <p class="text-sm text-gray-500">
              View and edit your organization information
            </p>
          </div>
          <div
            class="h-16 w-16 rounded-xl bg-blue-600 text-white
                   flex items-center justify-center"
          >
            <BuildingOffice2Icon class="h-8 w-8" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm text-gray-600 mb-1 block">
              Organization Name
            </label>
            <input
              v-model="nameInput"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label class="text-sm text-gray-600 mb-1 block">
              Organization ID
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              :value="organization?.id ?? ''"
              disabled
            />
          </div>

          <div>
            <label class="text-sm text-gray-600 mb-1 block">
              Created At
            </label>
            <input
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              :value="createdAtLabel"
              disabled
            />
          </div>

          <div>
            <label class="text-sm text-gray-600 mb-1 block">
              Status
            </label>
            <div class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Organization Status</p>
            <p class="text-sm text-gray-500">
              Organization is currently {{ isActive ? "active" : "inactive" }}.
            </p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="isActive"
              :disabled="!isActive"
              @click.prevent="requestDeactivate"
            />
            <div
              class="w-10 h-5 bg-gray-200 rounded-full peer
                     peer-checked:bg-gray-900
                     after:content-['']
                     after:absolute after:top-0.5 after:left-[2px]
                     after:bg-white after:h-4 after:w-4
                     after:rounded-full after:transition-all
                     peer-checked:after:translate-x-full"
            ></div>
          </label>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <button
            class="bg-gray-900 text-white
                   px-4 py-2 rounded-lg
                   text-sm font-medium hover:bg-gray-800 disabled:opacity-70"
            :disabled="isSaving"
            @click="saveChanges"
          >
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </button>
          <button
            class="border border-gray-300 text-gray-700
                   px-4 py-2 rounded-lg
                   text-sm font-medium hover:bg-gray-100"
            @click="loadData"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="border border-red-200 bg-red-50 rounded-xl p-6">
        <h3 class="font-semibold text-red-600 mb-1">
          Danger Zone
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          Irreversible actions for your organization
        </p>

        <div
          class="bg-white border border-red-200 rounded-lg p-4
                 flex items-center justify-between"
        >
          <div>
            <p class="font-medium text-gray-900">Deactivate Organization</p>
            <p class="text-sm text-gray-500">
              Disable access for all members and pause the organization.
            </p>
          </div>
          <button
            class="bg-red-600 text-white
                   px-4 py-2 rounded-lg
                   text-sm font-medium hover:bg-red-700 disabled:opacity-70"
            :disabled="isDeactivating || !isActive"
            @click="requestDeactivate"
          >
            {{ isDeactivating ? "Deactivating..." : "Deactivate" }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :confirming="isDeactivating"
      @close="closeConfirm"
      @confirm="handleConfirm"
    />
  </div>
</template>
