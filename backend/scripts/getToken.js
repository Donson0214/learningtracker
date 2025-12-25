const API_KEY = "AIzaSyBT3A5xm5uldkSiWMNGl4lv4hzXkEPohxE";
const EMAIL = "learningtracker@test.dev";
const PASSWORD = "password";

(async () => {
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
  if (!res.ok) {
    console.error("Failed to get token:", data);
    process.exit(1);
  }

  console.log("ID TOKEN:\n", data.idToken);
})();
