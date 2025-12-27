import fetch from "node-fetch";

const API_KEY = "AIzaSyBT3A5xm5uldkSiWMNGl4lv4hzXkEPohxE";
const EMAIL = "learningtracker@test.dev";
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
