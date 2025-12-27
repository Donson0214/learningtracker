import "dotenv/config";   // 👈 MUST BE FIRST
import app from "./app";
import { startNotificationScheduler } from "./modules/notifications/notification.scheduler";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
