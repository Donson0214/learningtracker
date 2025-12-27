<script setup lang="ts">
import { ref } from "vue"
import Sidebar from "./Sidebar.vue"

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- SIDEBAR -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />

    <!-- MAIN CONTENT -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- TOPBAR (empty for now, exact height like design) -->
      <header class="h-16 bg-white border-b flex items-center px-6">
        <!-- We will add Topbar content next -->
      </header>

      <!-- PAGE CONTENT -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
