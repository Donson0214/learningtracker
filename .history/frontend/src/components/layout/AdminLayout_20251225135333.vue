<script setup lang="ts">
import AdminSidebar from "./AdminSidebar.vue";
import AdminHeader from "./AdminHeader.vue";
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Header -->
      <AdminHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
