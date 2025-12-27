<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  BuildingOffice2Icon,
  BookOpenIcon,
} from "@heroicons/vue/24/outline";
import TableStateRow from "@/components/ui/TableStateRow.vue";
import PaginationControls from "@/components/ui/PaginationControls.vue";
import StateMessage from "@/components/ui/StateMessage.vue";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useSystemCoursesStore } from "./store";

const coursesStore = useSystemCoursesStore();
const courses = computed(() => coursesStore.courses);
const page = computed(() => coursesStore.page);
const pageSize = computed(() => coursesStore.pageSize);
const total = computed(() => coursesStore.total);
const totalPages = computed(() => coursesStore.totalPages);
const isLoading = computed(() => coursesStore.isLoading);
const errorMessage = computed(() => coursesStore.errorMessage);
const searchQuery = ref("");
const includeModules = ref(false);

const loadCourses = async (force = false) => {
  await coursesStore.loadCourses({
    includeModules: includeModules.value,
    force,
  });
};

onMounted(() => {
  void loadCourses();
});

useAutoRefresh(() => loadCourses(true), { intervalMs: 60000 });

watch(includeModules, () => {
  void coursesStore.loadCourses({ page: 1, includeModules: includeModules.value });
});

const filteredCourses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return courses.value;
  }
  return courses.value.filter((course) => {
    return (
      course.title.toLowerCase().includes(query) ||
      (course.organization?.name ?? "").toLowerCase().includes(query)
    );
  });
});

const lessonCountFor = (courseModules?: { lessonsCount: number }[]) => {
  if (!courseModules?.length) {
    return 0;
  }
  return courseModules.reduce((sum, module) => sum + module.lessonsCount, 0);
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        All Courses
      </h2>
      <p class="text-gray-500">
        View courses across every organization
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <div class="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by course or organization"
        class="w-full lg:max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm"
      />
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input
            v-model="includeModules"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          Show modules & lessons
        </label>
        <button
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
          :disabled="isLoading"
          @click="loadCourses(true)"
        >
          Refresh
        </button>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Course</th>
            <th class="text-left px-4 py-3">Organization</th>
            <th class="text-left px-4 py-3">Modules</th>
            <th class="text-left px-4 py-3">Lessons</th>
            <th class="text-left px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <TableStateRow
            v-if="isLoading"
            :colspan="5"
            variant="loading"
            title="Loading courses"
            message="Fetching system-wide courses."
          />
          <TableStateRow
            v-else-if="filteredCourses.length === 0"
            :colspan="5"
            variant="empty"
            title="No courses found"
            message="Try adjusting your search."
          />
          <tr v-for="course in filteredCourses" :key="course.id">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center"
                >
                  <BookOpenIcon class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ course.title }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ course.description || "No description" }}
                  </p>
                  <div
                    v-if="includeModules && course.modules?.length"
                    class="mt-2 text-xs text-gray-500 space-y-1"
                  >
                    <p v-for="module in course.modules" :key="module.id">
                      {{ module.title }} · {{ module.lessonsCount }} lessons
                    </p>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 text-gray-700">
                <BuildingOffice2Icon class="h-4 w-4 text-gray-400" />
                <span>{{ course.organization?.name || "Unknown" }}</span>
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
        :page="page"
        :page-size="pageSize"
        :total="total"
        :total-pages="totalPages"
        :is-loading="isLoading"
        @prev="coursesStore.loadCourses({ page: page - 1, includeModules })"
        @next="coursesStore.loadCourses({ page: page + 1, includeModules })"
      />
    </div>
  </div>
</template>
