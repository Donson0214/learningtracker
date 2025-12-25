import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Course, Enrollment } from "@/shared/types";
import { fetchCourseById, fetchMyEnrollments } from "./api";

export const useCoursesStore = defineStore("courses", () => {
  const enrollments = ref<Enrollment[]>([]);
  const coursesById = ref<Record<string, Course>>({});
  const isLoading = ref(false);
  const errorMessage = ref("");
  const initialized = ref(false);

  const enrolledCourseIds = computed(() =>
    enrollments.value.map((enrollment) => enrollment.courseId)
  );

  const loadEnrollments = async () => {
    errorMessage.value = "";
    isLoading.value = true;
    try {
      enrollments.value = await fetchMyEnrollments();
      enrollments.value.forEach((enrollment) => {
        if (enrollment.course) {
          coursesById.value[enrollment.courseId] = enrollment.course;
        }
      });
      initialized.value = true;
    } catch (error) {
      errorMessage.value = "Unable to load enrollments.";
    } finally {
      isLoading.value = false;
    }
  };

  const getCourse = async (courseId: string) => {
    const cached = coursesById.value[courseId];
    if (cached) {
      return cached;
    }
    const course = await fetchCourseById(courseId);
    coursesById.value[courseId] = course;
    return course;
  };

  const clear = () => {
    enrollments.value = [];
    coursesById.value = {};
    initialized.value = false;
  };

  return {
    enrollments,
    coursesById,
    enrolledCourseIds,
    isLoading,
    errorMessage,
    initialized,
    loadEnrollments,
    getCourse,
    clear,
  };
});
