import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    sidebarCollapsed: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
  },
});
