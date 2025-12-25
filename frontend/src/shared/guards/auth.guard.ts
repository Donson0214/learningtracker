import { useAuthStore } from "@/features/auth/store";

export const requireAuth = (redirectPath: string) => {
  const auth = useAuthStore();
  if (auth.isAuthenticated) {
    return true;
  }
  return { name: "login", query: { redirect: redirectPath } };
};
