document.addEventListener("DOMContentLoaded", function () {
  const AUTH_KEY = "lamak-bana-admin-auth";

  // Jika sudah login, tidak perlu melewati security check lagi.
  if (localStorage.getItem(AUTH_KEY) === "true") {
    window.location.replace("../admin-dashboard/index.html");
    return;
  }

  const form = document.getElementById("security-form");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const error = document.getElementById("security-error");
  const toggle = document.getElementById("toggle-password");

  // Kredensial demo untuk kebutuhan UTS frontend.
  const DEMO_USERNAME = "admin";
  const DEMO_PASSWORD = "lamakbana";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const user = username.value.trim();
    const pass = password.value;

    if (user === DEMO_USERNAME && pass === DEMO_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      window.location.href = "../admin-dashboard/index.html";
      return;
    }

    error.textContent = "Username atau password tidak sesuai.";
    password.focus();
  });

  toggle.addEventListener("click", function () {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    toggle.textContent = visible ? "Lihat" : "Sembunyikan";
    toggle.setAttribute(
      "aria-label",
      visible ? "Tampilkan password" : "Sembunyikan password"
    );
  });
});
