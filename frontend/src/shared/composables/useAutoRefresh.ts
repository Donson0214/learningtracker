import { onBeforeUnmount, onMounted, ref } from "vue";

type AutoRefreshOptions = {
  intervalMs?: number;
  immediate?: boolean;
  pauseWhenHidden?: boolean;
  pauseWhenOffline?: boolean;
};

export const useAutoRefresh = (
  handler: () => Promise<void> | void,
  options: AutoRefreshOptions = {}
) => {
  const {
    intervalMs = 30000,
    immediate = true,
    pauseWhenHidden = true,
    pauseWhenOffline = true,
  } = options;

  const intervalId = ref<number | null>(null);
  const isRunning = ref(false);

  const clear = () => {
    if (intervalId.value !== null) {
      window.clearInterval(intervalId.value);
      intervalId.value = null;
    }
  };

  const shouldPause = () => {
    if (pauseWhenHidden && document.visibilityState === "hidden") {
      return true;
    }
    if (pauseWhenOffline && typeof navigator !== "undefined" && !navigator.onLine) {
      return true;
    }
    return false;
  };

  const run = async () => {
    if (isRunning.value) {
      return;
    }
    isRunning.value = true;
    try {
      await handler();
    } finally {
      isRunning.value = false;
    }
  };

  const start = async () => {
    if (intervalId.value !== null || shouldPause()) {
      return;
    }
    if (immediate) {
      await run();
    }
    intervalId.value = window.setInterval(run, intervalMs);
  };

  const stop = () => {
    clear();
  };

  const handleVisibility = () => {
    if (shouldPause()) {
      stop();
    } else {
      start();
    }
  };

  const handleOnline = () => {
    if (!shouldPause()) {
      start();
    }
  };

  const handleOffline = () => {
    stop();
  };

  onMounted(() => {
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    if (pauseWhenOffline) {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
  });

  onBeforeUnmount(() => {
    stop();
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleVisibility);
    if (pauseWhenOffline) {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  });

  return {
    start,
    stop,
    isRunning,
  };
};
