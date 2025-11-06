// === API CONFIG ===
const API_BASE = "https://hostify-app-nnod.vercel.app/api"; // your backend API base
const AUTH_ENDPOINTS = {
  login: `${API_BASE}/users/login`,
  register: `${API_BASE}/users/register`,
};

// === MESSAGE UTILITY ===
function showMessage(msg, type = "info", duration = 3000) {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    document.body.appendChild(container);
  }
  container.textContent = msg;
  container.className = `message-container ${type} show`;
  setTimeout(() => container.classList.remove("show"), duration);
}

// === MODAL UTILITY ===
const authModal = document.getElementById("authModal");
const authCloseBtn = document.getElementById("authCloseBtn");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

function openAuthModal(tab = "login", message) {
  authModal?.classList.add("active");
  document.body.classList.add("modal-open");
  if (message) showMessage(message, "error", 2500);
  switchTab(tab);

  setTimeout(() => {
    const targetInput =
      tab === "login"
        ? loginForm?.querySelector('input[type="email"]')
        : signupForm?.querySelector('input[name="username"]');
    targetInput?.focus();
  }, 200);
}

function closeAuthModal() {
  authModal?.classList.remove("active");
  document.body.classList.remove("modal-open");
}

authCloseBtn?.addEventListener("click", closeAuthModal);
authModal?.addEventListener("click", e => { if (e.target === authModal) closeAuthModal(); });
authTabs?.forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

function switchTab(tabName) {
  authTabs?.forEach(t => t.classList.remove("active"));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");
  if (tabName === "login") {
    loginForm?.classList.add("active");
    signupForm?.classList.remove("active");
  } else {
    signupForm?.classList.add("active");
    loginForm?.classList.remove("active");
  }
}

// === JWT UTILITY ===
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}

function saveAuthData(token, userData) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("userData", JSON.stringify(userData));
}

function getAuthData() {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  return { token, user: userData ? JSON.parse(userData) : null };
}

function clearAuthData() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("isReturningUser");
}

// === LOGIN HANDLER ===
loginForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = loginForm.querySelector('input[type="email"]')?.value.trim();
  const password = loginForm.querySelector('input[type="password"]')?.value.trim();
  if (!email || !password) return showMessage("Please fill in all fields!", "error");

  try {
    const res = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const decoded = decodeJWT(data.token);
    if (!decoded) throw new Error("Invalid token received");

    saveAuthData(data.token, decoded);
    localStorage.setItem("isReturningUser", "true");

    closeAuthModal();
    updateAuthUI();
    showMessage(`Welcome back, ${decoded.username || "User"}!`, "success");
  } catch (err) {
    console.error("Login error:", err);
    showMessage(err.message || "Login failed. Please try again.", "error");
  }
});

// === SIGNUP HANDLER ===
signupForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name     = signupForm.querySelector('input[name="name"]')?.value.trim();
  const username = signupForm.querySelector('input[name="username"]')?.value.trim();
  const email    = signupForm.querySelector('input[type="email"]')?.value.trim();
  const phone    = signupForm.querySelector('input[name="phone"]')?.value.trim();
  const password = signupForm.querySelector('input[type="password"]')?.value.trim();
  const role     = "user"; // default role

  if (!name || !username || !email || !phone || !password) 
    return showMessage("Please fill in all fields!", "error");

  try {
    const res = await fetch(AUTH_ENDPOINTS.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, phone, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    const decoded = decodeJWT(data.token);
    if (!decoded) throw new Error("Invalid token received");

    saveAuthData(data.token, decoded);
    closeAuthModal();
    updateAuthUI();
    showMessage(`Welcome, ${decoded.username || username}!`, "success");
  } catch (err) {
    console.error("Signup error:", err);
    showMessage(err.message || "Signup failed. Please try again.", "error");
  }
});

// === LOGOUT HANDLER ===
function handleLogout() {
  clearAuthData();
  updateAuthUI();
  showMessage("You have been logged out successfully!", "success");
}

// === UI UPDATE ===
function updateAuthUI() {
  const { token, user } = getAuthData();
  const authButtonsContainer = document.getElementById("authButtons");
  if (!authButtonsContainer) return;

  if (token && user) {
    const isReturning = localStorage.getItem("isReturningUser") === "true";
    authButtonsContainer.innerHTML = `
      <div class="user-greeting">
        <span>${isReturning ? "Welcome back" : "Welcome"}, ${user.username || "User"}!</span>
        <button class="logout-btn" onclick="handleLogout()">Logout</button>
      </div>
    `;
  } else {
    authButtonsContainer.innerHTML = `
      <div class="auth-buttons">
        <button class="auth-nav-btn login" onclick="openAuthModal('login')">Login</button>
        <button class="auth-nav-btn signup" onclick="openAuthModal('signup')">Sign Up</button>
      </div>
    `;
  }
}

// === REQUIRE AUTH CHECK ===
function requireAuth() {
  const { token, user } = getAuthData();
  if (!token || !user) {
    openAuthModal("login", "You must be signed in to continue!");
    return false;
  }
  return true;
}

// === INITIALIZE ===
document.addEventListener("DOMContentLoaded", updateAuthUI);

// === EXPORT FOR GLOBAL ACCESS ===
window.openAuthModal = openAuthModal;
window.handleLogout = handleLogout;
window.requireAuth = requireAuth;
