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
  registerWithFirebase,
  updateProfile,
} from "./api";

const storageKey = "learningtracker.authToken";
const storageTypeKey = "learningtracker.authStorage";

type StorageType = "local" | "session";

const saveToken = (token: string, remember: boolean) => {
  const storageType: StorageType = remember ? "local" : "session";
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(storageKey, token);
  localStorage.setItem(storageTypeKey, storageType);
};

const loadToken = () => {
  const storageType =
    (localStorage.getItem(storageTypeKey) as StorageType | null) ?? "local";
  const storage =
    storageType === "session" ? sessionStorage : localStorage;
  return storage.getItem(storageKey);
};

const clearTokenStorage = () => {
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
  localStorage.removeItem(storageTypeKey);
};

const setFirebasePersistence = async (remember: boolean) => {
  const persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(firebaseAuth, persistence);
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const initialized = ref(false);
  const initializing = ref(false);
  let initPromise: Promise<void> | null = null;

  const isAuthenticated = computed(() => Boolean(token.value));

  const applyToken = (nextToken: string | null, remember?: boolean) => {
    token.value = nextToken;
    setAuthToken(nextToken);

    if (!nextToken) {
      clearTokenStorage();
      return;
    }

    if (remember !== undefined) {
      saveToken(nextToken, remember);
    }
  };

  const initialize = async () => {
    if (initialized.value) {
      return;
    }

    if (!initPromise) {
      initializing.value = true;
      initPromise = (async () => {
        const storedToken = loadToken();
        if (storedToken) {
          applyToken(storedToken);
          try {
            user.value = await fetchProfile();
          } catch {
            applyToken(null);
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
    applyToken(data.idToken, remember);
    try {
      user.value = await fetchProfile(data.idToken);
    } catch (error) {
      applyToken(null);
      throw error;
    }
  };

  const signInWithGoogle = async (remember = true) => {
    await setFirebasePersistence(remember);
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken(true);
    applyToken(idToken, remember);
    try {
      user.value = await fetchProfile(idToken);
    } catch (error) {
      applyToken(null);
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
    applyToken(data.idToken, remember);
    try {
      const profile = await fetchProfile(data.idToken);
      user.value = name ? await updateProfile({ name }) : profile;
    } catch (error) {
      applyToken(null);
      throw error;
    }
  };

  const updateUserProfile = async (name: string) => {
    user.value = await updateProfile({ name });
  };

  const refreshProfile = async () => {
    user.value = await fetchProfile();
  };

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth).catch(() => undefined);
    applyToken(null);
    user.value = null;
  };

  return {
    user,
    token,
    initialized,
    initializing,
    isAuthenticated,
    initialize,
    signIn,
    register,
    updateUserProfile,
    refreshProfile,
    signInWithGoogle,
    signOut,
  };
});
