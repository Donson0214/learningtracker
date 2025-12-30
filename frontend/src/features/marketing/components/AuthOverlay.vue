<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/store";
import AppLogo from "@/components/ui/AppLogo.vue";

const props = defineProps<{
  open: boolean;
  mode: "login" | "register";
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "update:mode", value: "login" | "register"): void;
}>();

const router = useRouter();
const auth = useAuthStore();

const isLogin = computed(() => props.mode === "login");

const loginEmail = ref("");
const loginPassword = ref("");
const loginRemember = ref(true);
const loginError = ref("");
const loginSubmitting = ref(false);
const googleSubmitting = ref(false);
const showLoginPassword = ref(false);

const registerName = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerConfirm = ref("");
const registerError = ref("");
const registerSubmitting = ref(false);
const showRegisterPassword = ref(false);
const showRegisterConfirm = ref(false);

const setMode = (mode: "login" | "register") => {
  emit("update:mode", mode);
};

const formatLoginError = (error: unknown) => {
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

const formatRegisterError = (error: unknown) => {
  if (error && typeof (error as { code?: string }).code === "string") {
    const code = (error as { code: string }).code;
    const firebaseMap: Record<string, string> = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/invalid-email": "Invalid email address.",
    };
    if (firebaseMap[code]) {
      return firebaseMap[code];
    }
  }
  if (error instanceof Error) {
    const message = error.message;
    if (message === "EMAIL_EXISTS") {
      return "An account with this email already exists.";
    }
    if (message === "WEAK_PASSWORD : Password should be at least 6 characters") {
      return "Password should be at least 6 characters.";
    }
    return message;
  }
  return "Unable to complete the request.";
};

const handleLogin = async () => {
  loginError.value = "";
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = "Email and password are required.";
    return;
  }
  loginSubmitting.value = true;
  try {
    await auth.signIn(loginEmail.value, loginPassword.value, loginRemember.value);
    const isAdmin =
      auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
    const redirect =
      (router.currentRoute.value.query.redirect as string) ||
      (isAdmin ? "/admin" : "/dashboard");
    emit("close");
    router.push(redirect);
  } catch (error) {
    loginError.value = formatLoginError(error);
  } finally {
    loginSubmitting.value = false;
  }
};

const handleGoogleSignIn = async () => {
  loginError.value = "";
  googleSubmitting.value = true;
  try {
    await auth.signInWithGoogle(loginRemember.value);
    const isAdmin =
      auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
    const redirect =
      (router.currentRoute.value.query.redirect as string) ||
      (isAdmin ? "/admin" : "/dashboard");
    emit("close");
    router.push(redirect);
  } catch (error) {
    loginError.value = formatLoginError(error);
  } finally {
    googleSubmitting.value = false;
  }
};

const handleRegister = async () => {
  registerError.value = "";
  if (!registerName.value.trim() || !registerEmail.value.trim() || !registerPassword.value) {
    registerError.value = "All fields are required.";
    return;
  }
  if (registerPassword.value !== registerConfirm.value) {
    registerError.value = "Passwords do not match.";
    return;
  }
  registerSubmitting.value = true;
  try {
    await auth.register(
      registerName.value.trim(),
      registerEmail.value.trim(),
      registerPassword.value
    );
    emit("close");
    router.push("/profile");
  } catch (error) {
    registerError.value = formatRegisterError(error);
  } finally {
    registerSubmitting.value = false;
  }
};

const resetErrors = () => {
  loginError.value = "";
  registerError.value = "";
};

watch(
  () => props.mode,
  () => resetErrors()
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetErrors();
    }
  }
);

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.open) {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
      @click.self="emit('close')"
    >
      <div
        class="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/10 p-6 text-white
               shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-8 auth-float"
      >
        <button
          type="button"
          class="absolute right-4 top-4 text-xs text-white/60 hover:text-white"
          @click="emit('close')"
        >
          Close
        </button>

        <div class="text-center space-y-2">
          <div
            class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-zinc-900
                   text-sm font-semibold shadow-lg"
          >
            <AppLogo class="h-6 w-6" />
          </div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isLogin ? "Trackademy" : "Create Account" }}
          </h1>
          <p class="text-xs text-white/70">
            {{ isLogin ? "Enter your details to log in to your account." : "Start tracking your learning journey." }}
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
          <button
            type="button"
            class="rounded-xl py-2 text-xs font-semibold transition"
            :class="isLogin ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'"
            @click="setMode('login')"
          >
            Sign In
          </button>
          <button
            type="button"
            class="rounded-xl py-2 text-xs font-semibold transition"
            :class="!isLogin ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'"
            @click="setMode('register')"
          >
            Sign Up
          </button>
        </div>

        <div v-if="isLogin" class="mt-6 space-y-4">
          <button
            type="button"
            class="w-full rounded-xl border border-white/15 bg-white/10 py-2 text-xs font-semibold
                   shadow-sm transition hover:bg-white/20"
            :disabled="googleSubmitting"
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

          <div class="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
            <span class="h-px flex-1 bg-white/15"></span>
            or
            <span class="h-px flex-1 bg-white/15"></span>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <p v-if="loginError" class="text-xs text-rose-300">
              {{ loginError }}
            </p>

            <label class="block text-xs text-white/70">
              Email
              <div class="relative mt-2">
                <EnvelopeIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="loginEmail"
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
                  v-model="loginPassword"
                  :type="showLoginPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter Password"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-10 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  :aria-label="showLoginPassword ? 'Hide password' : 'Show password'"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <EyeSlashIcon v-if="showLoginPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </label>

            <div class="flex items-center justify-between text-[11px] text-white/60">
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="loginRemember"
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
              :disabled="loginSubmitting"
            >
              {{ loginSubmitting ? "Logging in..." : "Login" }}
              <ArrowRightIcon class="ml-2 inline h-4 w-4" />
            </button>
          </form>
        </div>

        <div v-else class="mt-6">
          <form class="space-y-4" @submit.prevent="handleRegister">
            <p v-if="registerError" class="text-xs text-rose-300">
              {{ registerError }}
            </p>

            <label class="block text-xs text-white/70">
              Full name
              <div class="relative mt-2">
                <UserIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="registerName"
                  type="text"
                  autocomplete="name"
                  placeholder="Enter your name"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
              </div>
            </label>

            <label class="block text-xs text-white/70">
              Email
              <div class="relative mt-2">
                <EnvelopeIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="registerEmail"
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
                  v-model="registerPassword"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Create password"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-10 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  :aria-label="showRegisterPassword ? 'Hide password' : 'Show password'"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  <EyeSlashIcon v-if="showRegisterPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </label>

            <label class="block text-xs text-white/70">
              Confirm password
              <div class="relative mt-2">
                <LockClosedIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="registerConfirm"
                  :type="showRegisterConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Confirm password"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-10 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  :aria-label="showRegisterConfirm ? 'Hide password' : 'Show password'"
                  @click="showRegisterConfirm = !showRegisterConfirm"
                >
                  <EyeSlashIcon v-if="showRegisterConfirm" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </label>

            <button
              type="submit"
              class="w-full rounded-xl bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600 py-2.5
                     text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                     transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]
                     disabled:opacity-70 disabled:hover:translate-y-0"
              :disabled="registerSubmitting"
            >
              {{ registerSubmitting ? "Creating..." : "Create Account" }}
              <ArrowRightIcon class="ml-2 inline h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </teleport>
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

.auth-float {
  animation: float-card 8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .auth-float {
    animation: none;
  }
}
</style>
