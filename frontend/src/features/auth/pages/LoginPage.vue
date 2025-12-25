<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import {
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";

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
  <div class="min-h-screen relative overflow-hidden bg-[#050b17] text-slate-100">
    <div
      class="absolute inset-0"
      style="
        background-image:
          radial-gradient(900px 500px at 15% 15%, rgba(56, 189, 248, 0.18), transparent 60%),
          radial-gradient(800px 480px at 85% 85%, rgba(14, 165, 233, 0.16), transparent 60%);
      "
    ></div>
    <div
      class="absolute inset-0 opacity-20"
      style="
        background-image:
          repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.07),
            rgba(255, 255, 255, 0.07) 1px,
            transparent 1px,
            transparent 22px
          );
      "
    ></div>

    <div class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div
        class="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-700/60
               bg-slate-900/70 shadow-2xl grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr]"
        style="font-family: var(--font-body);"
      >
        <section class="relative p-8 lg:p-10">
          <div
            class="absolute inset-0"
            style="
              background-image:
                linear-gradient(120deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.55)),
                radial-gradient(circle at top left, rgba(56, 189, 248, 0.2), transparent 55%);
            "
          ></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-lg bg-sky-500/80 text-white
                       flex items-center justify-center text-sm font-semibold"
              >
                LT
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.25em] text-slate-300">
                  Learning Tracker
                </p>
                <h1
                  class="text-3xl font-semibold text-slate-100"
                  style="font-family: var(--font-display);"
                >
                  Welcome back
                </h1>
              </div>
            </div>

            <p class="mt-4 text-sm text-slate-200 max-w-sm">
              Build momentum with focused study plans, curated lessons, and
              progress snapshots that keep every milestone in sight.
            </p>

            <ul class="mt-6 space-y-3 text-sm text-slate-200">
              <li class="flex items-center gap-2">
                <AcademicCapIcon class="h-4 w-4 text-sky-300" />
                Structured learning paths and weekly goals
              </li>
              <li class="flex items-center gap-2">
                <BookOpenIcon class="h-4 w-4 text-sky-300" />
                Course libraries tailored to each learner
              </li>
              <li class="flex items-center gap-2">
                <LightBulbIcon class="h-4 w-4 text-sky-300" />
                Smart insights to improve study habits
              </li>
            </ul>

            <div class="mt-8 grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">
                  Focus Hours
                </p>
                <p class="text-lg font-semibold text-slate-100">124h</p>
              </div>
              <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">
                  Active Paths
                </p>
                <p class="text-lg font-semibold text-slate-100">6</p>
              </div>
              <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">
                  Streak
                </p>
                <p class="text-lg font-semibold text-slate-100">12 days</p>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-slate-950/80 p-8 lg:p-10">
          <div class="mb-6">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
              Sign in
            </p>
            <h2
              class="text-2xl font-semibold text-white mt-2"
              style="font-family: var(--font-display);"
            >
              Continue your learning journey
            </h2>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <p v-if="errorMessage" class="text-sm text-rose-300">
              {{ errorMessage }}
            </p>
            <label class="block text-sm text-slate-300">
              Email address
              <div class="relative mt-2">
                <EnvelopeIcon
                  class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@learning.com"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                         pl-9 pr-3 py-2.5 text-sm text-slate-100
                         placeholder-slate-500 focus:border-sky-400 focus:ring-2
                         focus:ring-sky-400/30 outline-none"
                />
              </div>
            </label>

            <label class="block text-sm text-slate-300">
              Password
              <div class="relative mt-2">
                <LockClosedIcon
                  class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                         pl-9 pr-10 py-2.5 text-sm text-slate-100
                         placeholder-slate-500 focus:border-sky-400 focus:ring-2
                         focus:ring-sky-400/30 outline-none"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <EyeSlashIcon v-if="showPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </label>

            <div class="flex items-center justify-between text-xs text-slate-400">
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500"
                />
                Remember me
              </label>
              <button type="button" class="hover:text-slate-200">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-500
                     text-white py-2.5 text-sm font-semibold tracking-wide
                     inline-flex items-center justify-center gap-2 disabled:opacity-70"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Signing in..." : "Sign in" }}
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </form>

          <div class="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span class="h-px flex-1 bg-slate-800"></span>
            or
            <span class="h-px flex-1 bg-slate-800"></span>
          </div>

          <button
            type="button"
            class="w-full rounded-xl border border-slate-700 bg-slate-900/60
                   text-slate-100 py-2.5 text-sm font-semibold tracking-wide
                   inline-flex items-center justify-center gap-2
                   hover:border-slate-500 disabled:opacity-70"
            :disabled="isGoogleSubmitting"
            @click="handleGoogleSignIn"
          >
            {{ isGoogleSubmitting ? "Connecting..." : "Sign in with Google" }}
          </button>

          <p class="mt-6 text-sm text-slate-400">
            New to Learning Tracker?
            <RouterLink to="/register" class="text-sky-300 hover:text-sky-200">
              Create an account
            </RouterLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
