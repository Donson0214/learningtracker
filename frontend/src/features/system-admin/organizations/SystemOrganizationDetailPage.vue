<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BuildingOffice2Icon,
  UsersIcon,
  BookOpenIcon,
  Squares2X2Icon,
} from "@heroicons/vue/24/outline";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import PaginationControls from "@/components/ui/PaginationControls.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import type { SystemCourse, SystemMember, SystemOrganization } from "@/shared/types";
import {
  fetchSystemOrganization,
  fetchSystemOrganizationMembers,
  fetchSystemOrganizationCourses,
} from "./api";

const route = useRoute();
const router = useRouter();
const organizationId = computed(
  () => route.params.organizationId as string
);

const organization = ref<SystemOrganization | null>(null);
const members = ref<SystemMember[]>([]);
const courses = ref<SystemCourse[]>([]);
const membersPage = ref(1);
const membersPageSize = ref(20);
const membersTotal = ref(0);
const membersTotalPages = ref(1);
const coursesPage = ref(1);
const coursesPageSize = ref(20);
const coursesTotal = ref(0);
const coursesTotalPages = ref(1);
const includeModules = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const loadOrganization = async () => {
  organization.value = await fetchSystemOrganization(
    organizationId.value
  );
};

const loadMembers = async (page = membersPage.value) => {
  const data = await fetchSystemOrganizationMembers(
    organizationId.value,
    { page, pageSize: membersPageSize.value }
  );
  members.value = data.items;
  membersPage.value = data.page;
  membersPageSize.value = data.pageSize;
  membersTotal.value = data.total;
  membersTotalPages.value = data.totalPages;
};

const loadCourses = async (page = coursesPage.value) => {
  const data = await fetchSystemOrganizationCourses(
    organizationId.value,
    {
      page,
      pageSize: coursesPageSize.value,
      includeModules: includeModules.value,
    }
  );
  courses.value = data.items;
  coursesPage.value = data.page;
  coursesPageSize.value = data.pageSize;
  coursesTotal.value = data.total;
  coursesTotalPages.value = data.totalPages;
};

const loadAll = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    await Promise.all([loadOrganization(), loadMembers(1), loadCourses(1)]);
  } catch (error) {
    errorMessage.value = "Unable to load organization details.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadAll();
});

useAutoRefresh(() => loadAll(), { intervalMs: 60000 });

watch(includeModules, () => {
  void loadCourses(1);
});

watch(organizationId, () => {
  void loadAll();
});

const lessonCountFor = (courseModules?: { lessonsCount: number }[]) => {
  if (!courseModules?.length) {
    return 0;
  }
  return courseModules.reduce((sum, module) => sum + module.lessonsCount, 0);
};

const goBack = () => {
  router.push("/admin/organizations");
};
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-6">
      <div>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700 mb-2"
          @click="goBack"
        >
          Back to organizations
        </button>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          {{ organization?.name || "Organization" }}
        </h2>
        <p class="text-gray-500">
          System view of organization details
        </p>
      </div>
      <div
        class="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center"
      >
        <BuildingOffice2Icon class="h-6 w-6" />
      </div>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <p class="text-sm text-gray-500 mb-1">Members</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ organization?.memberCount ?? 0 }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <p class="text-sm text-gray-500 mb-1">Courses</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ organization?.courseCount ?? 0 }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <p class="text-sm text-gray-500 mb-1">Modules</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ organization?.moduleCount ?? 0 }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <p class="text-sm text-gray-500 mb-1">Lessons</p>
        <p class="text-2xl font-semibold text-gray-900">
          {{ organization?.lessonCount ?? 0 }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-4 py-4 border-b border-gray-200 flex items-center gap-2">
          <UsersIcon class="h-5 w-5 text-gray-400" />
          <div>
            <h3 class="font-semibold text-gray-900">Members</h3>
            <p class="text-sm text-gray-500">All users in this organization</p>
          </div>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="text-left px-4 py-3">Name</th>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">Role</th>
              <th class="text-left px-4 py-3">Joined</th>
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
              v-else-if="members.length === 0"
              :colspan="4"
              variant="empty"
              title="No members yet"
              message="This organization has no users."
            />
            <tr v-for="member in members" :key="member.id">
              <td class="px-4 py-3 font-medium text-gray-900">
                {{ member.name || "Unnamed" }}
              </td>
              <td class="px-4 py-3 text-gray-500">
                {{ member.email }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="member.role === 'LEARNER'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-gray-900 text-white'"
                >
                  {{ member.role === "LEARNER" ? "Learner" : "Admin" }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">
                {{ new Date(member.createdAt).toLocaleDateString("en-GB") }}
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
          @prev="loadMembers(membersPage - 1)"
          @next="loadMembers(membersPage + 1)"
        />
      </div>

      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BookOpenIcon class="h-5 w-5 text-gray-400" />
            <div>
              <h3 class="font-semibold text-gray-900">Courses</h3>
              <p class="text-sm text-gray-500">
                Courses and modules in this organization
              </p>
            </div>
          </div>
          <label class="flex items-center gap-2 text-xs text-gray-500">
            <input
              v-model="includeModules"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Show modules
          </label>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="text-left px-4 py-3">Course</th>
              <th class="text-left px-4 py-3">Modules</th>
              <th class="text-left px-4 py-3">Lessons</th>
              <th class="text-left px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <TableStateRow
              v-if="isLoading"
              :colspan="4"
              variant="loading"
              title="Loading courses"
              message="Fetching organization courses."
            />
            <TableStateRow
              v-else-if="courses.length === 0"
              :colspan="4"
              variant="empty"
              title="No courses yet"
              message="This organization has no courses."
            />
            <tr v-for="course in courses" :key="course.id">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <Squares2X2Icon class="h-4 w-4 text-gray-400" />
                  <span class="font-medium text-gray-900">
                    {{ course.title }}
                  </span>
                </div>
                <div
                  v-if="includeModules && course.modules?.length"
                  class="mt-2 text-xs text-gray-500 space-y-1"
                >
                  <p v-for="module in course.modules" :key="module.id">
                    {{ module.title }} · {{ module.lessonsCount }} lessons
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                {{ course.modulesCount ?? 0 }}
              </td>
              <td class="px-4 py-3">
                {{ includeModules ? lessonCountFor(course.modules) : "--" }}
              </td>
              <td class="px-4 py-3 text-gray-500">
                {{ new Date(course.createdAt).toLocaleDateString("en-GB") }}
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationControls
          :page="coursesPage"
          :page-size="coursesPageSize"
          :total="coursesTotal"
          :total-pages="coursesTotalPages"
          :is-loading="isLoading"
          @prev="loadCourses(coursesPage - 1)"
          @next="loadCourses(coursesPage + 1)"
        />
      </div>
    </div>
  </div>
</template>
