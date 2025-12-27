import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemAnalytics } from "@/shared/types";
import { fetchSystemAnalytics } from "./api";

export const useSystemAnalyticsStore = defineStore(
  "systemAnalytics",
  () => {
    const analytics = ref<SystemAnalytics | null>(null);
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
        analytics.value = await fetchSystemAnalytics();
      })()
        .catch(() => {
          errorMessage.value = "Unable to load system analytics.";
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
