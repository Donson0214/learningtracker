import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { setAuthToken } from "@/shared/api/axios";
import type { User } from "@/shared/types";
import { firebaseAuth, googleProvider } from "@/shared/firebase/firebase";
import {
  fetchProfile,
  loginWithFirebase,
  refreshFirebaseToken,
  registerWithFirebase,
  updateProfile,
} from "./api";

const tokenKey = "learningtracker.authToken";
const refreshTokenKey = "learningtracker.refreshToken";
const expiresAtKey = "learningtracker.authExpiresAt";
const storageTypeKey = "learningtracker.authStorage";

type StorageType = "local" | "session";

const getStorageType = (): StorageType =>
  (localStorage.getItem(storageTypeKey) as StorageType | null) ?? "local";

const getStorage = (type: StorageType) =>
  type === "session" ? sessionStorage : localStorage;

const clearTokenStorage = () => {
  localStorage.removeItem(storageTypeKey);
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(expiresAtKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(refreshTokenKey);
  sessionStorage.removeItem(expiresAtKey);
};

const loadSession = () => {
  const storageType = getStorageType();
  const storage = getStorage(storageType);
  const token = storage.getItem(tokenKey);
  const refreshToken = storage.getItem(refreshTokenKey);
  const expiresAtRaw = storage.getItem(expiresAtKey);
  const expiresAtParsed = expiresAtRaw ? Number(expiresAtRaw) : null;
  const expiresAt = Number.isFinite(expiresAtParsed)
    ? expiresAtParsed
    : null;
  return { token, refreshToken, expiresAt, storageType };
};

const saveSession = (payload: {
  token: string;
  refreshToken?: string | null;
  expiresAt?: number | null;
  remember: boolean;
}) => {
  const storageType: StorageType = payload.remember ? "local" : "session";
  const storage = getStorage(storageType);
  localStorage.setItem(storageTypeKey, storageType);
  storage.setItem(tokenKey, payload.token);
  if (payload.refreshToken) {
    storage.setItem(refreshTokenKey, payload.refreshToken);
  } else {
    storage.removeItem(refreshTokenKey);
  }
  if (payload.expiresAt) {
    storage.setItem(expiresAtKey, payload.expiresAt.toString());
  } else {
    storage.removeItem(expiresAtKey);
  }
};

const setFirebasePersistence = async (remember: boolean) => {
  const persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(firebaseAuth, persistence);
};

const refreshBufferMs = 5 * 60 * 1000;

const toExpiresAt = (expiresIn: string | number | undefined) => {
  const seconds = Number(expiresIn);
  if (!Number.isFinite(seconds)) {
    return null;
  }
  return Date.now() + seconds * 1000;
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const expiresAt = ref<number | null>(null);
  const storageType = ref<StorageType>(getStorageType());
  const initialized = ref(false);
  const initializing = ref(false);
  let initPromise: Promise<void> | null = null;
  let refreshPromise: Promise<string | null> | null = null;
  let refreshTimer: number | null = null;

  const isAuthenticated = computed(() => Boolean(token.value));

  const stopRefreshTimer = () => {
    if (refreshTimer !== null) {
      window.clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  const scheduleRefresh = () => {
    stopRefreshTimer();
    if (!token.value || !refreshToken.value || !expiresAt.value) {
      return;
    }
    const delay =
      expiresAt.value - Date.now() - refreshBufferMs;
    if (delay <= 0) {
      void refreshSession();
      return;
    }
    refreshTimer = window.setTimeout(() => {
      void refreshSession();
    }, delay);
  };

  const applySession = (payload: {
    token: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
    remember?: boolean;
    persist?: boolean;
  }) => {
    token.value = payload.token;
    setAuthToken(payload.token);

    if (payload.token === null) {
      refreshToken.value = null;
      expiresAt.value = null;
    }

    if (payload.refreshToken !== undefined) {
      refreshToken.value = payload.refreshToken;
    }

    if (payload.expiresAt !== undefined) {
      expiresAt.value = payload.expiresAt;
    }

    if (payload.remember !== undefined) {
      storageType.value = payload.remember ? "local" : "session";
      localStorage.setItem(storageTypeKey, storageType.value);
    }

    if (payload.persist) {
      if (!payload.token) {
        clearTokenStorage();
      } else {
        saveSession({
          token: payload.token,
          refreshToken: refreshToken.value,
          expiresAt: expiresAt.value ?? undefined,
          remember: storageType.value === "local",
        });
      }
    }

    scheduleRefresh();
  };

  const ensureFreshSession = async () => {
    if (!token.value) {
      return;
    }
    if (!refreshToken.value) {
      scheduleRefresh();
      return;
    }
    if (!expiresAt.value || Date.now() >= expiresAt.value - refreshBufferMs) {
      try {
        await refreshSession();
      } catch {
        return;
      }
    } else {
      scheduleRefresh();
    }
  };

  const refreshSession = async () => {
    if (!refreshToken.value) {
      return null;
    }
    if (refreshPromise) {
      return refreshPromise;
    }
    refreshPromise = (async () => {
      const data = await refreshFirebaseToken(refreshToken.value);
      const nextExpiresAt = toExpiresAt(data.expiresIn);
      applySession({
        token: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt: nextExpiresAt,
        persist: true,
      });
      return data.idToken;
    })()
      .catch((error) => {
        applySession({
          token: null,
          refreshToken: null,
          expiresAt: null,
          persist: true,
        });
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
    return refreshPromise;
  };

  const initialize = async () => {
    if (initialized.value) {
      return;
    }

    if (!initPromise) {
      initializing.value = true;
      initPromise = (async () => {
        const stored = loadSession();
        storageType.value = stored.storageType;
        if (stored.token) {
          applySession({
            token: stored.token,
            refreshToken: stored.refreshToken,
            expiresAt: stored.expiresAt,
          });
          await ensureFreshSession();
          try {
            user.value = await fetchProfile();
          } catch {
            applySession({
              token: null,
              refreshToken: null,
              expiresAt: null,
              persist: true,
            });
            user.value = null;
          }
        }
        initialized.value = true;
      })().finally(() => {
        initializing.value = false;
        initPromise = null;
      });
    }

    await initPromise;
  };

  const signIn = async (
    email: string,
    password: string,
    remember = true
  ) => {
    const data = await loginWithFirebase(email, password);
    const nextExpiresAt = toExpiresAt(data.expiresIn);
    applySession({
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: nextExpiresAt,
      remember,
      persist: true,
    });
    try {
      user.value = await fetchProfile(data.idToken);
    } catch (error) {
      applySession({
        token: null,
        refreshToken: null,
        expiresAt: null,
        persist: true,
      });
      throw error;
    }
  };

  const signInWithGoogle = async (remember = true) => {
    await setFirebasePersistence(remember);
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken(true);
    const tokenResult = await result.user.getIdTokenResult();
    const nextExpiresAt = tokenResult?.expirationTime
      ? new Date(tokenResult.expirationTime).getTime()
      : null;
    const nextRefreshToken = result.user.refreshToken ?? null;
    applySession({
      token: idToken,
      refreshToken: nextRefreshToken,
      expiresAt: nextExpiresAt,
      remember,
      persist: true,
    });
    try {
      user.value = await fetchProfile(idToken);
    } catch (error) {
      applySession({
        token: null,
        refreshToken: null,
        expiresAt: null,
        persist: true,
      });
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    remember = true
  ) => {
    const data = await registerWithFirebase(name, email, password);
    const nextExpiresAt = toExpiresAt(data.expiresIn);
    applySession({
      token: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: nextExpiresAt,
      remember,
      persist: true,
    });
    try {
      const profile = await fetchProfile(data.idToken);
      user.value = name ? await updateProfile({ name }) : profile;
    } catch (error) {
      applySession({
        token: null,
        refreshToken: null,
        expiresAt: null,
        persist: true,
      });
      throw error;
    }
  };

  const updateUserProfile = async (name: string) => {
    user.value = await updateProfile({ name });
  };

  const refreshProfile = async () => {
    await ensureFreshSession();
    user.value = await fetchProfile();
  };

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth).catch(() => undefined);
    stopRefreshTimer();
    applySession({
      token: null,
      refreshToken: null,
      expiresAt: null,
      persist: true,
    });
    user.value = null;
  };

  return {
    user,
    token,
    refreshToken,
    expiresAt,
    initialized,
    initializing,
    isAuthenticated,
    initialize,
    refreshSession,
    signIn,
    register,
    updateUserProfile,
    refreshProfile,
    signInWithGoogle,
    signOut,
  };
});
