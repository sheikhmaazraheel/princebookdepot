const AUTH_API = "https://princebookdepot-backend.onrender.com";
document.documentElement.style.visibility = "hidden";

(async () => {
  try {
    const response = await fetch(`${AUTH_API}/api/auth/session`, { credentials: "include" });
    if (!response.ok) throw new Error("Unauthenticated");
    document.documentElement.classList.add("admin-session-ready");
    document.documentElement.style.visibility = "visible";
  } catch {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`../login.html?next=${encodeURIComponent(next)}`);
  }
})();
