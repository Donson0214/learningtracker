import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemCourse } from "@/shared/types";
import { fetchSystemCourses } from "./api";

export const useSystemCoursesStore = defineStore(
  "systemCourses",
  () => {
    const courses = ref<SystemCourse[]>([]);
    const page = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const totalPages = ref(1);
    const isLoading = ref(false);
    const errorMessage = ref("");
    let loadPromise: Promise<void> | null = null;

    const clearError = () => {
      errorMessage.value = "";
    };

    const applyPage = (data: {
      items: SystemCourse[];
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }) => {
      courses.value = data.items;
      page.value = data.page;
      pageSize.value = data.pageSize;
      total.value = data.total;
      totalPages.value = data.totalPages;
    };

    const loadCourses = async (options?: {
      page?: number;
      pageSize?: number;
      includeModules?: boolean;
      force?: boolean;
    }) => {
      const nextPage = options?.page ?? page.value;
      const nextPageSize = options?.pageSize ?? pageSize.value;
      const includeModules = options?.includeModules ?? false;

      if (loadPromise && !options?.force) {
        return loadPromise;
      }

      isLoading.value = true;
      clearError();
      loadPromise = (async () => {
        const data = await fetchSystemCourses({
          page: nextPage,
          pageSize: nextPageSize,
          includeModules,
        });
        applyPage(data);
      })()
        .catch(() => {
          errorMessage.value = "Unable to load courses.";
        })
        .finally(() => {
          isLoading.value = false;
          loadPromise = null;
        });
      return loadPromise;
    };

    const clear = () => {
      courses.value = [];
      page.value = 1;
      pageSize.value = 20;
      total.value = 0;
      totalPages.value = 1;
      isLoading.value = false;
      errorMessage.value = "";
    };

    return {
      courses,
      page,
      pageSize,
      total,
      totalPages,
      isLoading,
      errorMessage,
      loadCourses,
      clearError,
      clear,
    };
  }
);
