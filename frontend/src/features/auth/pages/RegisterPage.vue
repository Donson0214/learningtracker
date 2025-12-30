<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import AppLogo from "@/components/ui/AppLogo.vue";

const authBgUrl = new URL(
  "@/assets/auth-background.svg",
  import.meta.url
).toString();

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isEditMode = computed(() => route.query.mode === "edit");

const fullName = ref("");
const email = ref("");
const organization = ref("Tech Academy");
const role = ref("Learner");
const password = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

watchEffect(() => {
  if (isEditMode.value && auth.user) {
    fullName.value = auth.user.name ?? "";
    email.value = auth.user.email ?? "";
    organization.value = auth.user.organization?.name ?? "Unassigned";
    role.value = auth.user.role ?? "Learner";
  }
});

const formatAuthError = (error: unknown) => {
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

const handleSubmit = async () => {
  errorMessage.value = "";
  if (isEditMode.value) {
    if (!fullName.value.trim()) {
      errorMessage.value = "Full name is required.";
      return;
    }
    isSubmitting.value = true;
    try {
      await auth.updateUserProfile(fullName.value.trim());
      router.push("/profile");
    } catch (error) {
      errorMessage.value = formatAuthError(error);
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  if (!fullName.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = "All fields are required.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  isSubmitting.value = true;
  try {
    await auth.register(
      fullName.value.trim(),
      email.value.trim(),
      password.value
    );
    const redirect = route.query.redirect as string | undefined;
    router.push(redirect || "/profile");
  } catch (error) {
    errorMessage.value = formatAuthError(error);
  } finally {
    isSubmitting.value = false;
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
            <h1 class="text-2xl font-semibold tracking-tight">
              {{ isEditMode ? "Update Profile" : "Create Account" }}
            </h1>
            <p class="text-xs text-white/70">
              {{
                isEditMode
                  ? "Keep your details up to date."
                  : "Start tracking your learning journey."
              }}    
            </p>
          </div>

          <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <p v-if="errorMessage" class="text-xs text-rose-300">
              {{ errorMessage }}
            </p>

            <label class="block text-xs text-white/70">
              Full name
              <div class="relative mt-2">
                <UserIcon
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  v-model="fullName"
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
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="Enter your email"
                  class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm
                         text-white placeholder-white/45 outline-none transition
                         focus:border-white/40 focus:bg-white/15"
                  :disabled="isEditMode"
                />
              </div>
            </label>

            <div v-if="isEditMode" class="space-y-4">
              <label class="block text-xs text-white/70">
                Organization
                <div class="relative mt-2">
                  <BuildingOffice2Icon
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                  />
                  <input
                    v-model="organization"
                    type="text"
                    class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm
                           text-white placeholder-white/45 outline-none transition
                           focus:border-white/40 focus:bg-white/15"
                    disabled
                  />
                </div>
              </label>

              <label class="block text-xs text-white/70">
                Role
                <div class="relative mt-2">
                  <BriefcaseIcon
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                  />
                  <input
                    v-model="role"
                    type="text"
                    class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm
                           text-white placeholder-white/45 outline-none transition
                           focus:border-white/40 focus:bg-white/15"
                    disabled
                  />
                </div>
              </label>
            </div>

            <div v-else class="space-y-4">
              <label class="block text-xs text-white/70">
                Password
                <div class="relative mt-2">
                  <LockClosedIcon
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                  />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Create password"
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

              <label class="block text-xs text-white/70">
                Confirm password
                <div class="relative mt-2">
                  <LockClosedIcon
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                  />
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Confirm password"
                    class="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-9 pr-10 text-sm
                           text-white placeholder-white/45 outline-none transition
                           focus:border-white/40 focus:bg-white/15"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeSlashIcon v-if="showConfirmPassword" class="h-4 w-4" />
                    <EyeIcon v-else class="h-4 w-4" />
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600 py-2.5
                     text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                     transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]
                     disabled:opacity-70 disabled:hover:translate-y-0"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Profile"
                    : "Create Account"
              }}
              <ArrowRightIcon class="ml-2 inline h-4 w-4" />
            </button>
          </form>

          <p class="mt-5 text-center text-xs text-white/60">
            {{ isEditMode ? "Need to update credentials?" : "Already have an account?" }}
            <RouterLink to="/login" class="text-white hover:underline">
              {{ isEditMode ? "Back to profile" : "Sign in instead" }}
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
