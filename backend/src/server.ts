import "dotenv/config";   // dY`^ MUST BE FIRST
import http from "http";
import app from "./app";
import { startNotificationScheduler } from "./modules/notifications/notification.scheduler";
import { initRealtimeServer } from "./realtime/realtime";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
initRealtimeServer(server);

server.listen(PORT, () => {
  console.log(`dYs? Server running on port ${PORT}`);
  startNotificationScheduler();

});
