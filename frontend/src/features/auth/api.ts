import { apiClient } from "@/shared/api/axios";
import type { User } from "@/shared/types";

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY as
  | string
  | undefined;

type FirebaseAuthResponse = {
  idToken: string;
  email: string;
  localId: string;
  refreshToken: string;
  expiresIn: string;
};

type FirebaseErrorPayload = {
  error?: {
    message?: string;
  };
};

const firebaseRequest = async (
  endpoint: string,
  payload: Record<string, unknown>
) => {
  if (!firebaseApiKey) {
    throw new Error("Missing VITE_FIREBASE_API_KEY");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, returnSecureToken: true }),
    }
  );

  const data = (await res.json()) as FirebaseAuthResponse & FirebaseErrorPayload;

  if (!res.ok) {
    const message = data.error?.message || "Authentication failed";
    throw new Error(message);
  }

  return data;
};

const updateFirebaseProfile = async (
  idToken: string,
  displayName: string
) => {
  if (!displayName) {
    return;
  }

  await firebaseRequest("accounts:update", {
    idToken,
    displayName,
  });
};

export const loginWithFirebase = async (
  email: string,
  password: string
) => {
  return firebaseRequest("accounts:signInWithPassword", {
    email,
    password,
  });
};

export const registerWithFirebase = async (
  name: string,
  email: string,
  password: string
) => {
  const data = await firebaseRequest("accounts:signUp", {
    email,
    password,
  });
  await updateFirebaseProfile(data.idToken, name);
  return data;
};

export const fetchProfile = async (token?: string) => {
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;
  const { data } = await apiClient.get<User>(
    "/users/me",
    headers ? { headers } : undefined
  );
  return data;
};

export const updateProfile = async (payload: { name?: string }) => {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
};
