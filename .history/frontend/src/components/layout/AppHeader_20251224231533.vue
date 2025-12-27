<template>
  <header class="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
      <RouterLink
        class="text-lg font-semibold tracking-wide text-slate-100"
        to="/"
      >
        Learning Tracker
      </RouterLink>
      <nav class="flex flex-1 gap-3 text-sm text-slate-300 md:hidden">
        <RouterLink class="hover:text-emerald-200" to="/">Overview</RouterLink>
        <RouterLink class="hover:text-emerald-200" to="/study-plan">
          Plan
        </RouterLink>
        <RouterLink class="hover:text-emerald-200" to="/study-sessions">
          Sessions
        </RouterLink>
      </nav>
      <div class="ml-auto flex items-center gap-3">
        <Badge v-if="auth.isAuthenticated">
          Signed in as {{ auth.user?.name }}
        </Badge>
        <Button variant="ghost" @click="handleAuth">
          <component :is="auth.isAuthenticated ? LogOut : LogIn" class="h-4 w-4" />
          {{ auth.isAuthenticated ? "Sign out" : "Quick sign in" }}
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LogIn, LogOut } from "lucide-vue-next";
import { RouterLink } from "vue-router";

import { useAuthStore } from "@/features/auth/store";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const auth = useAuthStore();

const handleAuth = () => {
  if (auth.isAuthenticated) {
    auth.signOut();
    return;
  }
  auth.signIn("Ari Lane", "ari@example.com");
};
</script>
