import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Course,
  OrganizationInvite,
  OrganizationMember,
  OrganizationMembersSummary,
} from "@/shared/types";
import { fetchCourses } from "@/features/admin/courses/api";
import {
  createInvite,
  enrollLearner,
  fetchInvites,
  fetchOrganizationMembers,
  fetchUserEnrollments,
  removeOrganizationMember,
  revokeInvite,
  unenrollLearner,
} from "./api";

type MembersPageData = {
  items: OrganizationMember[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: OrganizationMembersSummary;
};

type CourseCatalogPage = {
  items: Course[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const useAdminMembersStore = defineStore(
  "adminMembers",
  () => {
    const members = ref<OrganizationMember[]>([]);
    const invites = ref<OrganizationInvite[]>([]);
    const enrollmentsByUser = ref<
      Record<string, Record<string, string>>
    >({});
    const summary = ref<OrganizationMembersSummary>({
      total: 0,
      learners: 0,
      admins: 0,
    });
    const membersPage = ref(1);
    const membersPageSize = ref(20);
    const membersTotal = ref(0);
    const membersTotalPages = ref(1);
    const courseCatalog = ref<Course[]>([]);
    const catalogPage = ref(1);
    const catalogPageSize = ref(12);
    const catalogTotal = ref(0);
    const catalogTotalPages = ref(1);
    const isLoading = ref(false);
    const isCatalogLoading = ref(false);
    const isEnrollmentsLoading = ref(false);
    const errorMessage = ref("");
    const cacheTtlMs = 60000;
    const membersCache = new Map<string, { data: MembersPageData; fetchedAt: number }>();
    const catalogCache = new Map<string, { data: CourseCatalogPage; fetchedAt: number }>();
    let membersPromise: Promise<void> | null = null;
    let membersActiveKey: string | null = null;
    let loadAllPromise: Promise<void> | null = null;

    const clearError = () => {
      errorMessage.value = "";
    };

    const applyMembersPage = (data: MembersPageData) => {
      members.value = data.items;
      membersPage.value = data.page;
      membersPageSize.value = data.pageSize;
      membersTotal.value = data.total;
      membersTotalPages.value = data.totalPages;
      summary.value = data.summary;
    };

    const applyCatalogPage = (data: CourseCatalogPage) => {
      courseCatalog.value = data.items;
      catalogPage.value = data.page;
      catalogPageSize.value = data.pageSize;
      catalogTotal.value = data.total;
      catalogTotalPages.value = data.totalPages;
    };

    const loadMembers = async (
      options: {
        page?: number;
        pageSize?: number;
        silent?: boolean;
        force?: boolean;
      } = {}
    ) => {
      const targetPage = options.page ?? membersPage.value;
      const targetPageSize = options.pageSize ?? membersPageSize.value;
      const cacheKey = `${targetPage}:${targetPageSize}`;
      const cached = membersCache.get(cacheKey);
      if (
        cached &&
        !options.force &&
        Date.now() - cached.fetchedAt < cacheTtlMs
      ) {
        applyMembersPage(cached.data);
        return;
      }

      if (membersPromise && membersActiveKey === cacheKey) {
        return membersPromise;
      }

      if (!options.silent) {
        isLoading.value = true;
      }
      clearError();
      membersActiveKey = cacheKey;
      membersPromise = (async () => {
        const data = await fetchOrganizationMembers({
          page: targetPage,
          pageSize: targetPageSize,
        });
        const payload: MembersPageData = {
          items: data.items,
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
          summary: data.summary,
        };
        membersCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
        applyMembersPage(payload);
      })()
        .catch(() => {
          errorMessage.value = "Unable to load members.";
        })
        .finally(() => {
          if (!options.silent) {
            isLoading.value = false;
          }
          membersPromise = null;
          membersActiveKey = null;
        });
      return membersPromise;
    };

    const loadInvites = async () => {
      invites.value = await fetchInvites();
    };

    const loadAll = async (options: { force?: boolean } = {}) => {
      if (loadAllPromise) {
        return loadAllPromise;
      }
      isLoading.value = true;
      clearError();
      loadAllPromise = (async () => {
        await Promise.all([
          loadMembers({ silent: true, force: options.force }),
          loadInvites(),
        ]);
      })()
        .catch(() => {
          errorMessage.value = "Unable to load members.";
        })
        .finally(() => {
          isLoading.value = false;
          loadAllPromise = null;
        });
      return loadAllPromise;
    };

    const loadCourseCatalog = async (
      options: { page?: number; pageSize?: number; force?: boolean } = {}
    ) => {
      const targetPage = options.page ?? catalogPage.value;
      const targetPageSize = options.pageSize ?? catalogPageSize.value;
      const cacheKey = `${targetPage}:${targetPageSize}`;
      const cached = catalogCache.get(cacheKey);
      if (
        cached &&
        !options.force &&
        Date.now() - cached.fetchedAt < cacheTtlMs
      ) {
        applyCatalogPage(cached.data);
        return;
      }

      isCatalogLoading.value = true;
      clearError();
      try {
        const data = await fetchCourses({
          page: targetPage,
          pageSize: targetPageSize,
          includeModules: false,
        });
        const payload: CourseCatalogPage = {
          items: data.items,
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
        };
        catalogCache.set(cacheKey, {
          data: payload,
          fetchedAt: Date.now(),
        });
        applyCatalogPage(payload);
      } catch (error) {
        errorMessage.value = "Unable to load courses.";
      } finally {
        isCatalogLoading.value = false;
      }
    };

    const loadEnrollmentsForUser = async (userId: string) => {
      isEnrollmentsLoading.value = true;
      clearError();
      try {
        const enrollments = await fetchUserEnrollments(userId);
        const enrollmentMap: Record<string, string> = {};
        enrollments.forEach((enrollment) => {
          enrollmentMap[enrollment.courseId] = enrollment.id;
        });
        enrollmentsByUser.value = {
          ...enrollmentsByUser.value,
          [userId]: enrollmentMap,
        };
      } catch (error) {
        errorMessage.value = "Unable to load enrollments.";
      } finally {
        isEnrollmentsLoading.value = false;
      }
    };

    const sendInvite = async (payload: {
      email: string;
      role: "LEARNER" | "ORG_ADMIN";
    }) => {
      clearError();
      try {
        const response = await createInvite(payload);
        if (response.emailSent === false && response.inviteLink) {
          errorMessage.value =
            "Invite created, but email was not sent. Share this link: " +
            response.inviteLink;
        }
        invites.value = await fetchInvites();
      } catch (error) {
        errorMessage.value = "Unable to send invite.";
        throw error;
      }
    };

    const removeInvite = async (inviteId: string) => {
      clearError();
      try {
        await revokeInvite(inviteId);
        invites.value = await fetchInvites();
      } catch (error) {
        errorMessage.value = "Unable to revoke invite.";
        throw error;
      }
    };

    const updateEnrollmentsForUser = async (
      userId: string,
      selectedCourseIds: string[]
    ) => {
      clearError();
      try {
        const current = enrollmentsByUser.value[userId] ?? {};
        const target = new Set(selectedCourseIds);

        for (const courseId of selectedCourseIds) {
          if (!current[courseId]) {
            await enrollLearner({ userId, courseId });
          }
        }

        for (const [courseId, enrollmentId] of Object.entries(current)) {
          if (!target.has(courseId)) {
            await unenrollLearner(enrollmentId);
          }
        }

        await loadEnrollmentsForUser(userId);
      } catch (error) {
        errorMessage.value = "Unable to update enrollments.";
        throw error;
      }
    };

    const removeMember = async (memberId: string) => {
      clearError();
      try {
        await removeOrganizationMember(memberId);
        membersCache.clear();
        await loadMembers({ page: membersPage.value, force: true });
      } catch (error) {
        errorMessage.value = "Unable to remove member.";
        throw error;
      }
    };

    const clear = () => {
      members.value = [];
      invites.value = [];
      enrollmentsByUser.value = {};
      summary.value = { total: 0, learners: 0, admins: 0 };
      membersPage.value = 1;
      membersPageSize.value = 20;
      membersTotal.value = 0;
      membersTotalPages.value = 1;
      courseCatalog.value = [];
      catalogPage.value = 1;
      catalogPageSize.value = 12;
      catalogTotal.value = 0;
      catalogTotalPages.value = 1;
      isLoading.value = false;
      isCatalogLoading.value = false;
      isEnrollmentsLoading.value = false;
      errorMessage.value = "";
      membersCache.clear();
      catalogCache.clear();
    };

    return {
      members,
      invites,
      enrollmentsByUser,
      summary,
      membersPage,
      membersPageSize,
      membersTotal,
      membersTotalPages,
      courseCatalog,
      catalogPage,
      catalogPageSize,
      catalogTotal,
      catalogTotalPages,
      isLoading,
      isCatalogLoading,
      isEnrollmentsLoading,
      errorMessage,
      loadMembers,
      loadCourseCatalog,
      loadEnrollmentsForUser,
      loadAll,
      sendInvite,
      removeInvite,
      updateEnrollmentsForUser,
      removeMember,
      clearError,
      clear,
    };
  }
);
