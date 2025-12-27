type RealtimeEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

type RealtimeListener = (event: RealtimeEvent) => void;

const listeners = new Map<string, Set<RealtimeListener>>();
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectDelay = 1000;
let currentToken: string | null = null;
let manualClose = false;
let authBlocked = false;

const buildWebSocketUrl = (token: string) => {
  const explicitWsBase = import.meta.env.VITE_WS_BASE_URL;
  if (explicitWsBase) {
    const base = explicitWsBase.replace(/\/$/, "");
    return `${base}?token=${encodeURIComponent(token)}`;
  }

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:4000/api";
  const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api\/?$/, "");
  return `${wsBase.replace(/\/$/, "")}/ws?token=${encodeURIComponent(token)}`;
};

const notifyListeners = (event: RealtimeEvent) => {
  const handlers = listeners.get(event.type);
  if (!handlers?.size) {
    return;
  }
  handlers.forEach((handler) => handler(event));
};

const updateServerSubscriptions = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  const channels = Array.from(listeners.keys());
  socket.send(JSON.stringify({ type: "subscribe", channels }));
};

const scheduleReconnect = () => {
  if (manualClose || authBlocked || !currentToken) {
    return;
  }
  if (reconnectTimer !== null) {
    return;
  }
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectRealtime(currentToken);
  }, reconnectDelay);
  reconnectDelay = Math.min(Math.round(reconnectDelay * 1.5), 30000);
};

const resetReconnectDelay = () => {
  reconnectDelay = 1000;
};

export const connectRealtime = (token: string) => {
  if (!token) {
    return;
  }

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING) &&
    currentToken === token
  ) {
    return;
  }

  manualClose = false;
  authBlocked = false;
  currentToken = token;

  if (socket) {
    socket.close();
    socket = null;
  }

  const wsUrl = buildWebSocketUrl(token);
  socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    resetReconnectDelay();
    updateServerSubscriptions();
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data) as RealtimeEvent;
      if (payload?.type) {
        notifyListeners(payload);
      }
    } catch {
      // Ignore malformed messages.
    }
  });

  socket.addEventListener("close", (event) => {
    socket = null;
    if ([4401, 4403, 4404].includes(event.code)) {
      authBlocked = true;
      return;
    }
    scheduleReconnect();
  });

  socket.addEventListener("error", () => {
    socket?.close();
  });
};

export const disconnectRealtime = () => {
  manualClose = true;
  authBlocked = false;
  currentToken = null;

  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close();
    socket = null;
  }
};

export const onRealtimeEvent = (
  type: string,
  handler: RealtimeListener
) => {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type)!.add(handler);
  updateServerSubscriptions();

  return () => {
    const set = listeners.get(type);
    if (!set) {
      return;
    }
    set.delete(handler);
    if (!set.size) {
      listeners.delete(type);
    }
    updateServerSubscriptions();
  };
};

export type { RealtimeEvent };
