import { apiClient } from "@/shared/api/axios";
import type { User } from "@/shared/types";
import { firebaseAuth } from "@/shared/firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";

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

type FirebaseRefreshResponse = {
  id_token: string;
  refresh_token: string;
  expires_in: string;
};

type FirebaseErrorPayload = {
  error?: {
    message?: string;
  };
};

const toAuthResponse = async (
  user: {
    uid: string;
    email: string | null;
    refreshToken: string;
    getIdToken: (forceRefresh?: boolean) => Promise<string>;
    getIdTokenResult: () => Promise<{ expirationTime: string }>;
  }
): Promise<FirebaseAuthResponse> => {
  const idToken = await user.getIdToken();
  const tokenResult = await user.getIdTokenResult();
  const expirationTime = tokenResult?.expirationTime
    ? new Date(tokenResult.expirationTime).getTime()
    : null;
  const expiresIn = expirationTime
    ? Math.max(
        0,
        Math.floor((expirationTime - Date.now()) / 1000)
      ).toString()
    : "3600";

  return {
    idToken,
    email: user.email ?? "",
    localId: user.uid,
    refreshToken: user.refreshToken,
    expiresIn,
  };
};

export const loginWithFirebase = async (
  email: string,
  password: string
) => {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  return toAuthResponse(credential.user);
};

export const registerWithFirebase = async (
  name: string,
  email: string,
  password: string
) => {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  if (name) {
    await updateFirebaseProfile(credential.user, { displayName: name });
    await credential.user.getIdToken(true);
  }
  return toAuthResponse(credential.user);
};

export const refreshFirebaseToken = async (refreshToken?: string) => {
  if (firebaseAuth.currentUser) {
    const idToken = await firebaseAuth.currentUser.getIdToken(true);
    const tokenResult =
      await firebaseAuth.currentUser.getIdTokenResult();
    const expirationTime = tokenResult?.expirationTime
      ? new Date(tokenResult.expirationTime).getTime()
      : null;
    const expiresIn = expirationTime
      ? Math.max(
          0,
          Math.floor((expirationTime - Date.now()) / 1000)
        ).toString()
      : "3600";

    return {
      idToken,
      refreshToken: firebaseAuth.currentUser.refreshToken,
      expiresIn,
    };
  }

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  if (!firebaseApiKey) {
    throw new Error("Missing VITE_FIREBASE_API_KEY");
  }

  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );

  const data = (await res.json()) as FirebaseRefreshResponse & FirebaseErrorPayload;

  if (!res.ok) {
    const message = data.error?.message || "Token refresh failed";
    throw new Error(message);
  }

  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
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
