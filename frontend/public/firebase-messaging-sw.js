importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

let messagingInitialized = false;

const initMessaging = (config) => {
  if (messagingInitialized) {
    return;
  }
  if (
    !config ||
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId ||
    !config.appId ||
    !config.messagingSenderId
  ) {
    console.warn("Firebase messaging config missing.");
    return;
  }

  firebase.initializeApp(config);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title =
      payload?.notification?.title || "Study Reminder";
    const options = {
      body:
        payload?.notification?.body ||
        "You have a scheduled study task.",
      icon: "/favicon.svg",
    };
    self.registration.showNotification(title, options);
  });
  messagingInitialized = true;
};

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    initMessaging(event.data.config);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
      return undefined;
    })
  );
});
