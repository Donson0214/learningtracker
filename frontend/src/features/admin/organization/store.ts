import { defineStore } from "pinia";
import { ref } from "vue";
import type { Organization } from "@/shared/types";
import {
  activateOrganization,
  deactivateOrganization,
  deleteOrganization,
  fetchOrganization,
  updateOrganization,
} from "./api";

export const useAdminOrganizationStore = defineStore(
  "adminOrganization",
  () => {
    const organization = ref<Organization | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref("");
    let loadPromise: Promise<void> | null = null;

    const clearError = () => {
      errorMessage.value = "";
    };

    const loadOrganization = async () => {
      if (loadPromise) {
        return loadPromise;
      }
      isLoading.value = true;
      clearError();
      loadPromise = (async () => {
        organization.value = await fetchOrganization();
      })()
        .catch(() => {
          errorMessage.value = "Unable to load organization.";
        })
        .finally(() => {
          isLoading.value = false;
          loadPromise = null;
        });
      return loadPromise;
    };

    const updateOrganizationName = async (name: string) => {
      clearError();
      try {
        organization.value = await updateOrganization(name);
        return organization.value;
      } catch (error) {
        errorMessage.value = "Unable to update organization.";
        throw error;
      }
    };

    const deactivate = async () => {
      clearError();
      try {
        organization.value = await deactivateOrganization();
        return organization.value;
      } catch (error) {
        errorMessage.value = "Unable to deactivate organization.";
        throw error;
      }
    };

    const activate = async () => {
      clearError();
      try {
        organization.value = await activateOrganization();
        return organization.value;
      } catch (error) {
        errorMessage.value = "Unable to reactivate organization.";
        throw error;
      }
    };

    const removeOrganization = async () => {
      clearError();
      try {
        await deleteOrganization();
        organization.value = null;
      } catch (error) {
        errorMessage.value = "Unable to delete organization.";
        throw error;
      }
    };

    const clear = () => {
      organization.value = null;
      isLoading.value = false;
      errorMessage.value = "";
    };

    return {
      organization,
      isLoading,
      errorMessage,
      loadOrganization,
      updateOrganizationName,
      deactivate,
      activate,
      removeOrganization,
      clearError,
      clear,
    };
  }
);
