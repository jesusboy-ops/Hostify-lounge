/* ====== AUTH.JS FULL EDIT (FIXED + SPINNER) ====== */
const API_BASE = "https://hostify-app-nnod.vercel.app/api";
const AUTH_ENDPOINTS = {
  login: `${API_BASE}/users/login`,
  register: `${API_BASE}/users/register`,
  allUsers: `${API_BASE}/users/all`,
  userById: id => `${API_BASE}/users/${id}`,
  currentUser: `${API_BASE}/users/me`
};

/* ====== HELPERS ====== */
function dbg(...args) { console.log("AUTH DEBUG:", ...args); }

function showMessage(msg, type = "info", duration = 4000) {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      borderRadius: "8px",
      zIndex: 9999,
      color: "#fff",
      fontWeight: "600",
      fontFamily: "sans-serif",
      opacity: "0",
      transition: "opacity 0.3s"
    });
    document.body.appendChild(container);
  }

  container.textContent = msg;
  container.style.background =
    type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#007bff";
  container.style.opacity = "1";
  setTimeout(() => (container.style.opacity = "0"), duration);
}

/* ====== JWT HELPERS ====== */
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    dbg("JWT decode error:", err);
    return null;
  }
}

function saveToken(token) { localStorage.setItem("authToken", token); }
function getToken() { return localStorage.getItem("authToken"); }
function clearToken() { localStorage.removeItem("authToken"); }

/* ====== SPINNER OVERLAY ====== */
function showSpinner() {
  if (document.getElementById("fullSpinner")) return;
  const spinner = document.createElement("div");
  spinner.id = "fullSpinner";
  spinner.innerHTML = `
    <div class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `;
  document.body.appendChild(spinner);

  const style = document.createElement("style");
  style.id = "spinnerStyle";
  style.textContent = `
    .spinner-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; justify-content: center; align-items: center;
      z-index: 999999;
    }
    .spinner {
      width: 60px; height: 60px;
      border: 6px solid #f3f3f3;
      border-top: 6px solid #f39c12;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

function hideSpinner() {
  const spinner = document.getElementById("fullSpinner");
  if (spinner) spinner.remove();
}

/* ====== FETCH CURRENT USER ====== */
async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) {
    clearToken();
    return null;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Try /users/me first
  try {
    const meRes = await fetch(AUTH_ENDPOINTS.currentUser, { headers });
    if (meRes.ok) {
      const meData = await meRes.json().catch(() => ({}));
      const user = meData.user || meData.data || meData || null;
      if (user && (user.name || user.username)) return user;
    } else {
      dbg("fetchCurrentUser /users/me failed:", meRes.status);
    }
  } catch (err) {
    dbg("Error calling /users/me:", err);
  }

  // Try /users/:id next
  const userId =
    decoded.id || decoded._id || decoded.userId || decoded.sub || decoded.userid || decoded.user_id;
  if (userId) {
    try {
      const idRes = await fetch(AUTH_ENDPOINTS.userById(userId), { headers });
      if (idRes.ok) {
        const idData = await idRes.json().catch(() => ({}));
        const user = idData.user || idData.data || idData || null;
        if (user && (user.name || user.username)) return user;
      }
    } catch (err) {
      dbg("Error calling /users/:id:", err);
    }
  }

  return {
    name: decoded.name || decoded.username || decoded.email || "User",
    role: decoded.role || "user"
  };
}

/* ====== AUTH MODAL + FORMS ====== */
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
  if (tabName === "login") { loginForm?.classList.add("active"); signupForm?.classList.remove("active"); }
  else { signupForm?.classList.add("active"); loginForm?.classList.remove("active"); }
}

/* ====== LOGIN ====== */
loginForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = loginForm.querySelector('input[name="email"]').value.trim();
  const password = loginForm.querySelector('input[name="password"]').value.trim();
  const role = loginForm.querySelector('select[name="role"]').value;
  if (!email || !password || !role) { showMessage("Please fill in all fields!", "error"); return; }

  showSpinner();
  try {
    const res = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Login failed (${res.status})`);
    if (!data.token) throw new Error("No token in response");

    saveToken(data.token);
    const userInfo = await fetchCurrentUser();
    if (!userInfo) throw new Error("Logged in but could not fetch user info");

    closeAuthModal();
    updateAuthUI(userInfo);
    showMessage(`Welcome ${userInfo.name || userInfo.username || "User"}!`, "success");
    setTimeout(() => {
      if (userInfo.role === "admin") window.location.href = "/staffpage/staffDashboard.html";
      else window.location.href = "/index.html";
    }, 800);
  } catch (err) {
    showMessage(err.message || "Login failed!", "error");
    dbg(err);
  } finally {
    hideSpinner();
  }
});

/* ====== SIGNUP ====== */
signupForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = signupForm.querySelector('input[name="name"]').value.trim();
  const username = signupForm.querySelector('input[name="username"]').value.trim();
  const email = signupForm.querySelector('input[name="email"]').value.trim();
  const phone = signupForm.querySelector('input[name="phone"]').value.trim();
  const password = signupForm.querySelector('input[name="password"]').value.trim();
  const role = signupForm.querySelector('select[name="role"]').value;
  if (!name || !username || !email || !phone || !password || !role) {
    showMessage("Please fill in all fields!", "error"); return;
  }

  showSpinner();
  try {
    const res = await fetch(AUTH_ENDPOINTS.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, phone, password, role })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Signup failed (${res.status})`);
    if (!data.token) throw new Error("No token in signup response");

    saveToken(data.token);
    const userInfo = await fetchCurrentUser();
    if (!userInfo) throw new Error("Signed up but could not fetch user info");

    closeAuthModal();
    updateAuthUI(userInfo);
    showMessage(`Welcome, ${userInfo.name || userInfo.username || "User"}!`, "success");
    setTimeout(() => (window.location.href = "../index.html"), 800);
  } catch (err) {
    showMessage(err.message || "Signup failed!", "error");
    dbg(err);
  } finally {
    hideSpinner();
  }
});

/* ====== LOGOUT & UI UPDATE ====== */
function handleLogout() {
  clearToken();
  updateAuthUI(null);
  showMessage("Logged out successfully!", "success");
}
window.handleLogout = handleLogout;

async function updateAuthUI(user = null) {
  const container = document.getElementById("authButtons");
  if (!container) return;

  let userInfo = user;
  const token = getToken();
  if (token && !userInfo) userInfo = await fetchCurrentUser();

  if (token && userInfo) {
    container.innerHTML = `
      <div class="user-greeting">
        <span class="username">Welcome, ${userInfo.name || userInfo.username || "User"}!</span>
        <span class="role">(Role: ${userInfo.role || "user"})</span>
        <button class="logout-btn" onclick="handleLogout()">Logout</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="auth-buttons">
        <button class="auth-nav-btn login" onclick="openAuthModal('login')">Login</button>
        <button class="auth-nav-btn signup" onclick="openAuthModal('signup')">Sign Up</button>
      </div>
    `;
  }
}

/* ====== RESPONSIVE NAV STYLING ====== */
function injectResponsiveNavCSS() {
  if (document.getElementById("responsiveUserNavCSS")) return;
  const style = document.createElement("style");
  style.id = "responsiveUserNavCSS";
  style.textContent = `
    .user-greeting {
      display: flex;
      align-items: center;
      font-family: sans-serif;
      color: #f39c12;
      gap: 6px;
    }
    .user-greeting .logout-btn {
      border: 1px solid #f39c12;
      padding: 4px 8px;
      background: transparent;
      color: #f39c12;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.3s;
    }
    .user-greeting .logout-btn:hover {
      background: #f39c12;
      color: #fff;
    }
    @media (max-width: 480px) {
      .user-greeting .role { display: none; }
    }
  `;
  document.head.appendChild(style);
}

/* ====== INIT ====== */
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  injectResponsiveNavCSS();
});

window.openAuthModal = openAuthModal;
window.requireAuth = () => !!getToken();
