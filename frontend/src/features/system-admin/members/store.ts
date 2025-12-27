import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemMember } from "@/shared/types";
import { fetchSystemMembers } from "./api";

export const useSystemMembersStore = defineStore(
  "systemMembers",
  () => {
    const members = ref<SystemMember[]>([]);
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
      items: SystemMember[];
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }) => {
      members.value = data.items;
      page.value = data.page;
      pageSize.value = data.pageSize;
      total.value = data.total;
      totalPages.value = data.totalPages;
    };

    const loadMembers = async (options?: {
      page?: number;
      pageSize?: number;
      force?: boolean;
    }) => {
      const nextPage = options?.page ?? page.value;
      const nextPageSize = options?.pageSize ?? pageSize.value;

      if (loadPromise && !options?.force) {
        return loadPromise;
      }

      isLoading.value = true;
      clearError();
      loadPromise = (async () => {
        const data = await fetchSystemMembers({
          page: nextPage,
          pageSize: nextPageSize,
        });
        applyPage(data);
      })()
        .catch(() => {
          errorMessage.value = "Unable to load members.";
        })
        .finally(() => {
          isLoading.value = false;
          loadPromise = null;
        });
      return loadPromise;
    };

    const clear = () => {
      members.value = [];
      page.value = 1;
      pageSize.value = 20;
      total.value = 0;
      totalPages.value = 1;
      isLoading.value = false;
      errorMessage.value = "";
    };

    return {
      members,
      page,
      pageSize,
      total,
      totalPages,
      isLoading,
      errorMessage,
      loadMembers,
      clearError,
      clear,
    };
  }
);
