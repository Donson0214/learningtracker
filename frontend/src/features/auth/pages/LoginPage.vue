<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import AppLogo from "@/components/ui/AppLogo.vue";

const authBgUrl = new URL(
  "@/assets/auth-background.svg",
  import.meta.url
).toString();

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const remember = ref(true);
const isSubmitting = ref(false);
const isGoogleSubmitting = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

const formatAuthError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return (error as { response?: { data?: { message?: string } } }).response!
      .data!.message!;
  }
  if (error && typeof (error as { code?: string }).code === "string") {
    const code = (error as { code: string }).code;
    const googleMap: Record<string, string> = {
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/cancelled-popup-request": "Sign-in popup was cancelled.",
      "auth/popup-blocked": "Popup was blocked by the browser.",
      "auth/unauthorized-domain": "This domain is not authorized for sign-in.",
      "auth/operation-not-allowed":
        "Google sign-in is disabled in Firebase Console.",
      "auth/account-exists-with-different-credential":
        "Account exists with a different sign-in method.",
    };
    if (googleMap[code]) {
      return googleMap[code];
    }
    const firebaseMap: Record<string, string> = {
      "auth/user-not-found": "Invalid email or password.",
      "auth/wrong-password": "Invalid email or password.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/invalid-email": "Invalid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
    };
    if (firebaseMap[code]) {
      return firebaseMap[code];
    }
  }

  if (error instanceof Error) {
    const message = error.message;
    if (
      message === "EMAIL_NOT_FOUND" ||
      message === "INVALID_PASSWORD" ||
      message === "INVALID_LOGIN_CREDENTIALS"
    ) {
      return "Invalid email or password.";
    }
    if (message === "USER_DISABLED") {
      return "This account has been disabled.";
    }
    if (message === "INVALID_EMAIL") {
      return "Invalid email address.";
    }
    if (message === "TOO_MANY_ATTEMPTS_TRY_LATER") {
      return "Too many attempts. Try again later.";
    }
    return message;
  }
  return "Unable to sign in. Please try again.";
};

const handleSubmit = async () => {
  errorMessage.value = "";
  if (!email.value || !password.value) {
    errorMessage.value = "Email and password are required.";
    return;
  }

  isSubmitting.value = true;
  try {
    await auth.signIn(email.value, password.value, remember.value);
    const isAdmin =
      auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
    const redirect =
      (router.currentRoute.value.query.redirect as string) ||
      (isAdmin ? "/admin" : "/dashboard");
    router.push(redirect);
  } catch (error) {
    errorMessage.value = formatAuthError(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleGoogleSignIn = async () => {
  errorMessage.value = "";
  isGoogleSubmitting.value = true;
  try {
    await auth.signInWithGoogle(remember.value);
    const isAdmin =
      auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
    const redirect =
      (router.currentRoute.value.query.redirect as string) ||
      (isAdmin ? "/admin" : "/dashboard");
    router.push(redirect);
  } catch (error) {
    errorMessage.value = formatAuthError(error);
  } finally {
    isGoogleSubmitting.value = false;
  }
};
</script>

<template>
  <div class="relative min-h-screen overflow-hidden text-white">
    <div class="absolute inset-0">
      <div
        class="absolute inset-0 bg-cover bg-center scale-105"
        :style="{ backgroundImage: `url(${authBgUrl})` }"
      ></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"
      ></div>
    </div>

    <div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">
        <div
          class="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)]
                 backdrop-blur-2xl sm:p-8 card-float"
        >
          <div class="text-center space-y-2">
          <div
            class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-zinc-900
                     text-sm font-semibold shadow-lg"
          >
            <AppLogo class="h-6 w-6" />
          </div>
            <h1 class="text-2xl font-semibold tracking-tight">Trackademy</h1>
            <p class="text-xs text-white/70">
              Enter your details to log in to your account.
            </p>
          </div>

          <div class="mt-6 space-y-3">
          <button
            type="button"
            class="w-full rounded-xl border border-white/15 bg-white/10 py-2 text-xs font-semibold
                   shadow-sm transition hover:bg-white/20"
            :disabled="isGoogleSubmitting"
            @click="handleGoogleSignIn"
          >
            <span class="inline-flex items-center gap-2">
              <svg
                class="h-4 w-4"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.72 1.23 9.22 3.64l6.9-6.9C35.96 2.34 30.31 0 24 0 14.6 0 6.51 5.38 2.52 13.22l8.04 6.24C12.6 13.09 17.87 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.14-3.08-.4-4.55H24v9.02h12.94c-.58 3.02-2.23 5.58-4.73 7.3l7.3 5.66c4.27-3.94 6.47-9.75 6.47-17.43z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.56 28.47c-.54-1.6-.85-3.31-.85-5.07 0-1.76.31-3.47.85-5.07l-8.04-6.24C.93 15.7 0 19.74 0 24c0 4.26.93 8.3 2.52 11.91l8.04-6.24z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.3-5.66c-2.02 1.36-4.6 2.16-8.6 2.16-6.13 0-11.4-3.59-13.44-8.74l-8.04 6.24C6.51 42.62 14.6 48 24 48z"
                />
              </svg>
              Continue Google
            </span>
          </button>
          </div>

          <div class="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
            <span class="h-px flex-1 bg-white/15"></span>
            or
            <span class="h-px flex-1 bg-white/15"></span>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <p v-if="errorMessage" class="text-xs text-rose-300">
              {{ errorMessage }}
            </p>

            <label class="block text-xs text-white/70">
              Email
              <div class="relative mt-2">
                <EnvelopeIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="Enter your email"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
              </div>
            </label>

            <label class="block text-xs text-white/70">
              Password
              <div class="relative mt-2">
                <LockClosedIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter Password"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-10 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <EyeSlashIcon v-if="showPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </label>

            <div class="flex items-center justify-between text-[11px] text-white/60">
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-white/30 bg-white/10 text-white"
                />
                Remember me
              </label>
              <button type="button" class="hover:text-white">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600 py-2.5
                     text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                     transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]
                     disabled:opacity-70 disabled:hover:translate-y-0"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Logging in..." : "Login" }}
              <ArrowRightIcon class="ml-2 inline h-4 w-4" />
            </button>
          </form>

          <p class="mt-5 text-center text-xs text-white/60">
            Don’t Have An Account?
            <RouterLink to="/register" class="text-white hover:underline">
              Sign Up
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-card {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.card-float {
  animation: float-card 8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .card-float {
    animation: none;
  }
}
</style>
