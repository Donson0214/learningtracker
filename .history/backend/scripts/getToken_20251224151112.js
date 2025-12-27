import fetch from "node-fetch";

const API_KEY = "YOUR_FIREBASE_WEB_API_KEY";
const EMAIL = "learningtracker@";
const PASSWORD = "password";

const res = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      returnSecureToken: true,
    }),
  }
);

const data = await res.json();
console.log("ID TOKEN:\n", data.idToken);
