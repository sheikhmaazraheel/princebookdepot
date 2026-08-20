const AUTH_API = "https://princebookdepot-backend.onrender.com";
const form = document.getElementById("login-form");
const button = document.getElementById("login-button");
const status = document.getElementById("login-status");

const nextPath = (() => {
  const value = new URLSearchParams(window.location.search).get("next");
  return value && value.startsWith("/") && value.includes("/protected/") ? value : "./protected/index.html";
})();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  button.disabled = true;
  button.textContent = "Signing in...";
  status.textContent = "";
  try {
    const response = await fetch(`${AUTH_API}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to sign in.");
    window.location.href = nextPath;
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
    button.innerHTML = "Enter dashboard <span aria-hidden=\"true\">→</span>";
  }
});
