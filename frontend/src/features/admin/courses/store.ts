import { defineStore } from "pinia";
import { ref } from "vue";
import type { Course, Lesson, Module } from "@/shared/types";
import {
  createCourse,
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  fetchCourses,
  updateCourse,
  updateLesson,
  updateModule,
} from "./api";

export const useAdminCoursesStore = defineStore("adminCourses", () => {
  const courses = ref<Course[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const totalPages = ref(1);
  const cache = new Map<
    string,
    { data: { items: Course[]; page: number; pageSize: number; total: number; totalPages: number }; fetchedAt: number }
  >();
  const cacheTtlMs = 60000;
  let loadPromise: Promise<void> | null = null;
  let activeKey: string | null = null;

  const clearError = () => {
    errorMessage.value = "";
  };

  const applyPage = (data: {
    items: Course[];
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

  const cacheKeyFor = (input: {
    page: number;
    pageSize: number;
    includeModules: boolean;
  }) => `${input.page}:${input.pageSize}:${input.includeModules ? "1" : "0"}`;

  const clearCache = () => {
    cache.clear();
  };

  const loadCourses = async (
    options: {
      page?: number;
      pageSize?: number;
      includeModules?: boolean;
      silent?: boolean;
      force?: boolean;
    } = {}
  ) => {
    const targetPage = options.page ?? page.value;
    const targetPageSize = options.pageSize ?? pageSize.value;
    const includeModules = options.includeModules ?? true;
    const cacheKey = cacheKeyFor({
      page: targetPage,
      pageSize: targetPageSize,
      includeModules,
    });
    const cached = cache.get(cacheKey);
    if (
      cached &&
      !options.force &&
      Date.now() - cached.fetchedAt < cacheTtlMs
    ) {
      applyPage(cached.data);
      return;
    }

    if (loadPromise && activeKey === cacheKey) {
      return loadPromise;
    }

    if (!options.silent) {
      isLoading.value = true;
    }
    clearError();
    activeKey = cacheKey;
    loadPromise = (async () => {
      const data = await fetchCourses({
        page: targetPage,
        pageSize: targetPageSize,
        includeModules,
      });
      cache.set(cacheKey, { data, fetchedAt: Date.now() });
      applyPage(data);
    })()
      .catch(() => {
        errorMessage.value = "Unable to load courses.";
      })
      .finally(() => {
        if (!options.silent) {
          isLoading.value = false;
        }
        loadPromise = null;
        activeKey = null;
      });
    return loadPromise;
  };

  const createCourseEntry = async (payload: {
    title: string;
    description?: string;
    estimatedHours?: number | null;
  }) => {
    clearError();
    try {
      await createCourse(payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save course.";
      throw error;
    }
  };

  const updateCourseEntry = async (
    courseId: string,
    payload: {
      title?: string;
      description?: string;
      estimatedHours?: number | null;
    }
  ) => {
    clearError();
    try {
      await updateCourse(courseId, payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save course.";
      throw error;
    }
  };

  const deleteCourseEntry = async (courseId: string) => {
    clearError();
    try {
      await deleteCourse(courseId);
      courses.value = courses.value.filter(
        (course) => course.id !== courseId
      );
      clearCache();
    } catch (error) {
      errorMessage.value = "Unable to delete course.";
      throw error;
    }
  };

  const createModuleEntry = async (
    courseId: string,
    payload: { title: string; order: number }
  ) => {
    clearError();
    try {
      await createModule(courseId, payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save module.";
      throw error;
    }
  };

  const updateModuleEntry = async (
    moduleId: string,
    payload: { title?: string; order?: number }
  ) => {
    clearError();
    try {
      await updateModule(moduleId, payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save module.";
      throw error;
    }
  };

  const deleteModuleEntry = async (moduleId: string) => {
    clearError();
    try {
      await deleteModule(moduleId);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to delete module.";
      throw error;
    }
  };

  const createLessonEntry = async (
    moduleId: string,
    payload: { title: string; estimatedMinutes: number }
  ) => {
    clearError();
    try {
      await createLesson(moduleId, payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save lesson.";
      throw error;
    }
  };

  const updateLessonEntry = async (
    lessonId: string,
    payload: { title?: string; estimatedMinutes?: number }
  ) => {
    clearError();
    try {
      await updateLesson(lessonId, payload);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to save lesson.";
      throw error;
    }
  };

  const deleteLessonEntry = async (lessonId: string) => {
    clearError();
    try {
      await deleteLesson(lessonId);
      clearCache();
      await loadCourses({ silent: true, force: true });
    } catch (error) {
      errorMessage.value = "Unable to delete lesson.";
      throw error;
    }
  };

  const clear = () => {
    courses.value = [];
    isLoading.value = false;
    errorMessage.value = "";
    page.value = 1;
    pageSize.value = 10;
    total.value = 0;
    totalPages.value = 1;
    clearCache();
  };

  return {
    courses,
    isLoading,
    errorMessage,
    page,
    pageSize,
    total,
    totalPages,
    loadCourses,
    createCourseEntry,
    updateCourseEntry,
    deleteCourseEntry,
    createModuleEntry,
    updateModuleEntry,
    deleteModuleEntry,
    createLessonEntry,
    updateLessonEntry,
    deleteLessonEntry,
    clearError,
    clearCache,
    clear,
  };
});
