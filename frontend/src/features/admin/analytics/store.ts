import { defineStore } from "pinia";
import { ref } from "vue";
import type { OrgAnalytics } from "@/shared/types";
import { fetchOrgAnalytics } from "./api";

export const useAdminAnalyticsStore = defineStore(
  "adminAnalytics",
  () => {
    const analytics = ref<OrgAnalytics | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref("");
    let loadPromise: Promise<void> | null = null;

    const clearError = () => {
      errorMessage.value = "";
    };

    const loadAnalytics = async () => {
      if (loadPromise) {
        return loadPromise;
      }
      isLoading.value = true;
      clearError();
      loadPromise = (async () => {
        analytics.value = await fetchOrgAnalytics();
      })()
        .catch(() => {
          errorMessage.value = "Unable to load analytics.";
        })
        .finally(() => {
          isLoading.value = false;
          loadPromise = null;
        });
      return loadPromise;
    };

    const clear = () => {
      analytics.value = null;
      isLoading.value = false;
      errorMessage.value = "";
    };

    return {
      analytics,
      isLoading,
      errorMessage,
      loadAnalytics,
      clearError,
      clear,
    };
  }
);
