import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase";

const getFirebaseMessagingConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as
    | string
    | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as
    | string
    | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as
    | string
    | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as
    | string
    | undefined;
  const messagingSenderId = import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;

  if (!apiKey || !authDomain || !projectId || !appId || !messagingSenderId) {
    throw new Error("Missing Firebase messaging configuration");
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId,
  };
};

const getVapidKey = () => {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as
    | string
    | undefined;
  if (!vapidKey) {
    throw new Error("Missing VITE_FIREBASE_VAPID_KEY");
  }
  return vapidKey;
};

const registerMessagingWorker = async () => {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  const ready = await navigator.serviceWorker.ready;
  const activeWorker = ready.active || registration.active;
  if (activeWorker) {
    activeWorker.postMessage({
      type: "INIT_FIREBASE",
      config: getFirebaseMessagingConfig(),
    });
  }

  return registration;
};

export const requestNotificationToken = async () => {
  if (!(await isSupported())) {
    throw new Error("Notifications are not supported in this browser.");
  }

  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("Notification permission denied.");
  }

  const registration = await registerMessagingWorker();
  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, {
    vapidKey: getVapidKey(),
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Unable to obtain notification token.");
  }

  return token;
};
