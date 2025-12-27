import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemOrganization } from "@/shared/types";
import {
  activateSystemOrganization,
  deactivateSystemOrganization,
  fetchSystemOrganizations,
} from "./api";

export const useSystemOrganizationsStore = defineStore(
  "systemOrganizations",
  () => {
    const organizations = ref<SystemOrganization[]>([]);
    const total = ref(0);
    const page = ref(1);
    const pageSize = ref(20);
    const isLoading = ref(false);
    const errorMessage = ref("");
    let loadPromise: Promise<void> | null = null;

    const clearError = () => {
      errorMessage.value = "";
    };

    const loadOrganizations = async (options?: {
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
        const data = await fetchSystemOrganizations({
          page: nextPage,
          pageSize: nextPageSize,
        });
        organizations.value = data.items;
        total.value = data.total;
        page.value = data.page;
        pageSize.value = data.pageSize;
      })()
        .catch(() => {
          errorMessage.value = "Unable to load organizations.";
        })
        .finally(() => {
          isLoading.value = false;
          loadPromise = null;
        });
      return loadPromise;
    };

    const applyUpdate = (updated: SystemOrganization) => {
      const index = organizations.value.findIndex(
        (item) => item.id === updated.id
      );
      if (index === -1) {
        return;
      }
      organizations.value = organizations.value.map((item, idx) =>
        idx === index ? updated : item
      );
    };

    const activate = async (id: string) => {
      clearError();
      try {
        const updated = await activateSystemOrganization(id);
        applyUpdate(updated);
        return updated;
      } catch (error) {
        errorMessage.value = "Unable to activate organization.";
        throw error;
      }
    };

    const deactivate = async (id: string) => {
      clearError();
      try {
        const updated = await deactivateSystemOrganization(id);
        applyUpdate(updated);
        return updated;
      } catch (error) {
        errorMessage.value = "Unable to deactivate organization.";
        throw error;
      }
    };

    const clear = () => {
      organizations.value = [];
      total.value = 0;
      page.value = 1;
      pageSize.value = 20;
      isLoading.value = false;
      errorMessage.value = "";
    };

    return {
      organizations,
      total,
      page,
      pageSize,
      isLoading,
      errorMessage,
      loadOrganizations,
      activate,
      deactivate,
      clearError,
      clear,
    };
  }
);
