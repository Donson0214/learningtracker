<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import {
  AcademicCapIcon,
  BookOpenIcon,
  SparklesIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";

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
  <div class="min-h-screen relative overflow-hidden bg-[#050b17] text-slate-100">
    <div
      class="absolute inset-0"
      style="
        background-image:
          radial-gradient(900px 500px at 20% 20%, rgba(56, 189, 248, 0.18), transparent 60%),
          radial-gradient(900px 500px at 80% 80%, rgba(16, 185, 129, 0.14), transparent 60%);
      "
    ></div>
    <div
      class="absolute inset-0 opacity-20"
      style="
        background-image:
          repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.06) 1px,
            transparent 1px,
            transparent 26px
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
                linear-gradient(120deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.6)),
                radial-gradient(circle at top right, rgba(16, 185, 129, 0.2), transparent 55%);
            "
          ></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-lg bg-emerald-500/80 text-white
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
                  {{ isEditMode ? "Update your profile" : "Start learning today" }}
                </h1>
              </div>
            </div>

            <p class="mt-4 text-sm text-slate-200 max-w-sm">
              Build a personalized learning space with weekly goals, skill paths,
              and progress analytics that keep your momentum strong.
            </p>

            <ul class="mt-6 space-y-3 text-sm text-slate-200">
              <li class="flex items-center gap-2">
                <AcademicCapIcon class="h-4 w-4 text-emerald-300" />
                Personalized study plans and reminders
              </li>
              <li class="flex items-center gap-2">
                <BookOpenIcon class="h-4 w-4 text-emerald-300" />
                Curated courses and structured modules
              </li>
              <li class="flex items-center gap-2">
                <SparklesIcon class="h-4 w-4 text-emerald-300" />
                Milestones that celebrate every win
              </li>
            </ul>

            <div class="mt-8 grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">
                  Weekly Goals
                </p>
                <p class="text-lg font-semibold text-slate-100">10 hours</p>
              </div>
              <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">
                  Progress View
                </p>
                <p class="text-lg font-semibold text-slate-100">Real time</p>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-slate-950/80 p-8 lg:p-10">
          <div class="mb-6">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
              {{ isEditMode ? "Edit profile" : "Sign up" }}
            </p>
            <h2
              class="text-2xl font-semibold text-white mt-2"
              style="font-family: var(--font-display);"
            >
              {{ isEditMode ? "Update your details" : "Create your account" }}
            </h2>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <p v-if="errorMessage" class="text-sm text-rose-300">
              {{ errorMessage }}
            </p>
            <label class="block text-sm text-slate-300">
              Full name
              <div class="relative mt-2">
                <UserIcon
                  class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  v-model="fullName"
                  type="text"
                  autocomplete="name"
                  placeholder="Your name"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                         pl-9 pr-3 py-2.5 text-sm text-slate-100
                         placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                         focus:ring-emerald-400/30 outline-none"
                />
              </div>
            </label>

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
                         placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                         focus:ring-emerald-400/30 outline-none"
                  :disabled="isEditMode"
                />
              </div>
            </label>

            <div v-if="isEditMode" class="space-y-4">
              <label class="block text-sm text-slate-300">
                Organization
                <div class="relative mt-2">
                  <BuildingOffice2Icon
                    class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    v-model="organization"
                    type="text"
                    placeholder="Your organization"
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                           pl-9 pr-3 py-2.5 text-sm text-slate-100
                           placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                           focus:ring-emerald-400/30 outline-none"
                    disabled
                  />
                </div>
              </label>

              <label class="block text-sm text-slate-300">
                Role
                <div class="relative mt-2">
                  <BriefcaseIcon
                    class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    v-model="role"
                    type="text"
                    placeholder="Role"
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                           pl-9 pr-3 py-2.5 text-sm text-slate-100
                           placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                           focus:ring-emerald-400/30 outline-none"
                    disabled
                  />
                </div>
              </label>
            </div>

            <div v-else class="space-y-4">
              <label class="block text-sm text-slate-300">
                Password
                <div class="relative mt-2">
                  <LockClosedIcon
                    class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Create a password"
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                           pl-9 pr-10 py-2.5 text-sm text-slate-100
                           placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                           focus:ring-emerald-400/30 outline-none"
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

              <label class="block text-sm text-slate-300">
                Confirm password
                <div class="relative mt-2">
                  <LockClosedIcon
                    class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Re-enter your password"
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/70
                           pl-9 pr-10 py-2.5 text-sm text-slate-100
                           placeholder-slate-500 focus:border-emerald-400 focus:ring-2
                           focus:ring-emerald-400/30 outline-none"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
              class="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500
                     text-white py-2.5 text-sm font-semibold tracking-wide
                     inline-flex items-center justify-center gap-2 disabled:opacity-70"
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
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </form>

          <p class="mt-6 text-sm text-slate-400">
            {{ isEditMode ? "Need to update credentials?" : "Already have an account?" }}
            <RouterLink
              :to="isEditMode ? '/profile' : '/login'"
              class="text-emerald-300 hover:text-emerald-200"
            >
              {{ isEditMode ? "Back to profile" : "Sign in instead" }}
            </RouterLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
