import { onBeforeUnmount } from "vue";
import { onRealtimeEvent } from "./socket";

type RealtimeRefreshOptions = {
  cooldownMs?: number;
};

export const useRealtimeRefresh = (
  types: string[],
  handler: () => Promise<void> | void,
  options: RealtimeRefreshOptions = {}
) => {
  const { cooldownMs = 750 } = options;
  let running = false;
  let timeoutId: number | null = null;

  const run = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      await handler();
    } finally {
      running = false;
    }
  };

  const trigger = () => {
    if (cooldownMs <= 0) {
      run();
      return;
    }
    if (timeoutId !== null) {
      return;
    }
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      run();
    }, cooldownMs);
  };

  const unsubs = types.map((type) => onRealtimeEvent(type, trigger));

  onBeforeUnmount(() => {
    unsubs.forEach((unsubscribe) => unsubscribe());
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  });

  return {
    trigger,
  };
};
