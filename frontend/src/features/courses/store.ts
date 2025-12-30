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

  const setLessonCompletion = (
    lessonId: string,
    isCompleted: boolean,
    completedAt: string | null
  ) => {
    const applyToCourse = (course: Course) => {
      course.modules?.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          if (lesson.id !== lessonId) {
            return;
          }
          lesson.isCompleted = isCompleted;
          lesson.completedAt = completedAt;
        });
      });
    };

    enrollments.value.forEach((enrollment) => {
      if (enrollment.course) {
        applyToCourse(enrollment.course);
      }
    });

    Object.values(coursesById.value).forEach((course) => {
      applyToCourse(course);
    });
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
    setLessonCompletion,
    clear,
  };
});
