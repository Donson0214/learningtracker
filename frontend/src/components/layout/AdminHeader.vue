<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/store";
import { useTheme } from "@/shared/theme/useTheme";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const { theme, toggleTheme } = useTheme();

const title = computed(() => {
  const map: Record<string, string> = {
    "/admin": "Admin Dashboard",
    "/admin/organization": "Organization Management",
    "/admin/courses": "Course Management",
    "/admin/members": "Member Management",
    "/admin/analytics": "Analytics",
  };
  return map[route.path] ?? "Admin";
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!menuRef.value) {
    return;
  }
  if (!menuRef.value.contains(event.target as Node)) {
    menuOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    menuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleEscape);
});

const handleLogout = async () => {
  await auth.signOut();
  closeMenu();
  router.push("/login");
};
</script>

<template>
  <header
    class="h-16 bg-white border-b border-gray-200
           flex items-center justify-between
           px-6 dark:bg-slate-900 dark:border-slate-800"
  >
    <!-- Page Title -->
    <h1 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
      {{ title }}
    </h1>

    <!-- Right Actions -->
    <div class="flex items-center gap-4">
      <!-- Notifications -->
      <div class="cursor-pointer">
        <BellIcon class="h-5 w-5 text-gray-600 dark:text-slate-400" />
      </div>

      <button
        type="button"
        class="text-gray-600 hover:text-gray-900
               dark:text-slate-400 dark:hover:text-slate-200"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <SunIcon v-if="theme === 'dark'" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <!-- User -->
      <div ref="menuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-transparent
                 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100
                 dark:text-slate-200 dark:hover:bg-slate-800"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <div
            class="h-8 w-8 rounded-full bg-blue-600 text-white
                   flex items-center justify-center dark:bg-sky-500"
          >
            <UserIcon class="h-4 w-4" />
          </div>
          <span class="hidden sm:inline">
            {{ auth.user?.name || auth.user?.email || "Admin" }}
          </span>
          <ChevronDownIcon class="h-4 w-4 text-gray-400 dark:text-slate-400" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200
                 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <RouterLink
            to="/profile"
            class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                   dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeMenu"
          >
            Profile
          </RouterLink>
          <button
            type="button"
            class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                   dark:text-slate-200 dark:hover:bg-slate-800"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
