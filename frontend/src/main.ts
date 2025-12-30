import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./app/App.vue";
import router from "./app/router";
import { useAuthStore } from "@/features/auth/store";
import { initTheme } from "@/shared/theme/useTheme";
import {
  connectRealtime,
  disconnectRealtime,
} from "@/shared/realtime/socket";
import {
  setAuthRefreshHandler,
  setOrgInactiveHandler,
  setOrgMissingHandler,
} from "@/shared/api/axios";

import "./assets/main.css";

initTheme();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const auth = useAuthStore(pinia);
auth.initialize();
setAuthRefreshHandler(() => auth.refreshSession());
setOrgInactiveHandler(() => auth.markOrganizationInactive());
setOrgMissingHandler(() => auth.markOrganizationMissing());
watch(
  () => auth.token,
  (token) => {
    if (token) {
      connectRealtime(token);
    } else {
      disconnectRealtime();
    }
  },
  { immediate: true }
);

app.mount("#app");
