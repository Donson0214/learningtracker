<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import { acceptInvite } from "../api";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const token = computed(() => route.query.token as string | undefined);
const status = ref<"idle" | "loading" | "accepted" | "error" | "invalid">(
  "idle"
);
const errorMessage = ref("");

const redirectToAuth = (path: "/login" | "/register") => {
  router.push({ path, query: { redirect: route.fullPath } });
};

const formatError = (error: unknown) => {
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
  return "Unable to accept the invite. Please try again.";
};

const accept = async () => {
  errorMessage.value = "";
  if (!token.value) {
    status.value = "invalid";
    return;
  }
  if (!auth.isAuthenticated) {
    status.value = "idle";
    return;
  }

  status.value = "loading";
  try {
    await acceptInvite(token.value);
    await auth.refreshProfile();
    status.value = "accepted";
    const isAdmin =
      auth.user?.role === "ORG_ADMIN" || auth.user?.role === "SYSTEM_ADMIN";
    router.replace(isAdmin ? "/admin" : "/dashboard");
  } catch (error) {
    status.value = "error";
    errorMessage.value = formatError(error);
  }
};

watch(
  () => auth.isAuthenticated,
  () => {
    accept();
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen bg-[#050b17] text-slate-100 flex items-center justify-center p-6">
    <div class="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8">
      <h1 class="text-2xl font-semibold text-white mb-2">
        Accept Invitation
      </h1>
      <p class="text-sm text-slate-300 mb-6">
        Join your organization and start learning together.
      </p>

      <p v-if="status === 'invalid'" class="text-sm text-rose-300">
        Invite link is missing or invalid.
      </p>

      <div v-else-if="status === 'loading'" class="text-sm text-slate-300">
        Accepting your invite...
      </div>

      <div v-else-if="status === 'error'" class="text-sm text-rose-300">
        {{ errorMessage }}
      </div>

      <div v-else-if="!auth.isAuthenticated" class="space-y-4">
        <p class="text-sm text-slate-300">
          Please sign in or create an account to accept this invite.
        </p>
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg bg-sky-500 text-white px-4 py-2 text-sm font-semibold"
            @click="redirectToAuth('/login')"
          >
            Sign in
          </button>
          <button
            class="rounded-lg border border-slate-600 text-slate-100 px-4 py-2 text-sm font-semibold"
            @click="redirectToAuth('/register')"
          >
            Create account
          </button>
        </div>
      </div>

      <p v-else-if="status === 'accepted'" class="text-sm text-emerald-300">
        Invite accepted. Redirecting...
      </p>
    </div>
  </div>
</template>
