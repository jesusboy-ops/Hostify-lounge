// Robust auth + live fetch (diagnostics added)
const API_BASE = "https://hostify-app-nnod.vercel.app/api";
const AUTH_ENDPOINTS = {
  login: `${API_BASE}/users/login`,
  register: `${API_BASE}/users/register`,
  allUsers: `${API_BASE}/users/all`,
  userById: id => `${API_BASE}/users/${id}`,
  currentUser: `${API_BASE}/users/me`
};

/* ========= Helpers ========= */
function dbg(...args) { console.log("AUTH DEBUG:", ...args); }

function showMessage(msg, type = "info", duration = 5000) {
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

/* ===== Token storage ===== */
function saveToken(token) { try { localStorage.setItem("authToken", token); } catch(e){ dbg(e); } }
function getToken() { try { return localStorage.getItem("authToken"); } catch(e){ return null; } }
function clearToken() { try { localStorage.removeItem("authToken"); } catch(e){ } }

/* ===== Flexible user fetcher ===== */
async function fetchUserById(id, token) {
  try {
    const res = await fetch(AUTH_ENDPOINTS.userById(id), { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { json = text; }
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function fetchCurrentUserAlternative(token) {
  try {
    const res = await fetch(AUTH_ENDPOINTS.currentUser, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { json = text; }
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) { clearToken(); return null; }

  const idCandidates = [decoded.id, decoded._id, decoded.userId, decoded.sub, decoded.userid, decoded.user_id].filter(Boolean);

  for (const id of idCandidates) {
    const resp = await fetchUserById(id, token);
    if (resp.ok && resp.body) {
      const user = resp.body.user || resp.body.data || resp.body || null;
      if (user && (user.username || user.name || user.email)) return user;
    } else if (resp.status === 401) { clearToken(); return null; }
  }

  const alt = await fetchCurrentUserAlternative(token);
  if (alt.ok && alt.body) {
    const user = alt.body.user || alt.body.data || alt.body || null;
    if (user && (user.username || user.name || user.email)) return user;
  } else if (alt.status === 401) { clearToken(); return null; }

  return {
    username: decoded.username || decoded.name || decoded.email || null,
    role: decoded.role || null,
    id: idCandidates[0] || null
  };
}

/* ===== Auth modal elems ===== */
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
    const targetInput = tab === "login"
      ? loginForm?.querySelector('input[name="email"]')
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
  if (tabName === "login") { loginForm?.classList.add("active"); signupForm?.classList.remove("active"); }
  else { signupForm?.classList.add("active"); loginForm?.classList.remove("active"); }
}

/* ===== LOGIN ===== */
loginForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = loginForm.querySelector('input[name="email"]').value.trim();
  const password = loginForm.querySelector('input[name="password"]').value.trim();
  const role = loginForm.querySelector('select[name="role"]').value;
  if (!email || !password || !role) { showMessage("Please fill in all fields!", "error"); return; }

  try {
    const res = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Login failed (status ${res.status})`);
    if (!data.token) throw new Error("Login response did not include token");

    saveToken(data.token);
    const userInfo = await fetchCurrentUser();
    if (!userInfo) { showMessage("Logged in but could not fetch profile.", "error"); updateAuthUI(null); return; }

    closeAuthModal();
    updateAuthUI(userInfo);
    showMessage(`Welcome ${userInfo.username || userInfo.name || "User"}!`, "success");

    setTimeout(() => {
      if (userInfo.role === "admin") window.location.href = "/staffpage/staffDashboard.html";
      else window.location.href = "/index.html";
    }, 900);
  } catch (err) { showMessage(err.message || "Login failed. Please try again.", "error"); dbg(err); }
});

/* ===== SIGNUP ===== */
signupForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = signupForm.querySelector('input[name="name"]').value.trim();
  const username = signupForm.querySelector('input[name="username"]').value.trim();
  const email = signupForm.querySelector('input[name="email"]').value.trim();
  const phone = signupForm.querySelector('input[name="phone"]').value.trim();
  const password = signupForm.querySelector('input[name="password"]').value.trim();
  const role = signupForm.querySelector('select[name="role"]').value;
  if (!name || !username || !email || !phone || !password || !role) { showMessage("Please fill in all fields!", "error"); return; }

  try {
    const res = await fetch(AUTH_ENDPOINTS.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, phone, password, role })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Signup failed (status ${res.status})`);
    if (!data.token) throw new Error("Signup response did not include token");

    saveToken(data.token);
    const userInfo = await fetchCurrentUser();
    if (!userInfo) { showMessage("Signed up but could not fetch profile.", "error"); updateAuthUI(null); return; }

    closeAuthModal();
    updateAuthUI(userInfo);
    showMessage(`Welcome, ${userInfo.username || userInfo.name || "User"}!`, "success");
    setTimeout(() => (window.location.href = "/index.html"), 900);
  } catch (err) { showMessage(err.message || "Signup failed. Please try again.", "error"); dbg(err); }
});

/* ===== LOGOUT ===== */
function handleLogout() {
  clearToken();
  updateAuthUI(null);
  showMessage("You have been logged out successfully!", "success");
}
window.handleLogout = handleLogout;

/* ===== UI UPDATER ===== */
async function updateAuthUI(user = null) {
  const authButtonsContainer = document.getElementById("authButtons");
  if (!authButtonsContainer) return;

  let userInfo = user;
  const token = getToken();
  if (token && !userInfo) userInfo = await fetchCurrentUser();

  if (token && userInfo) {
    authButtonsContainer.innerHTML = `
      <div class="user-greeting">
        <span class="username" title="${userInfo.name || userInfo.username || "User"}">
          Welcome, ${userInfo.name || userInfo.username || "User"}!
        </span>
        <span class="role" style="opacity:0.8">Role: (${userInfo.role || "user"})</span>
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

/* ===== Responsive CSS for nav ===== */
function injectResponsiveNavCSS() {
  if (document.getElementById("responsiveUserNavCSS")) return;
  const style = document.createElement("style");
  style.id = "responsiveUserNavCSS";
  style.textContent = `
    /* User greeting flex */
    .user-greeting { 
      display: flex; 
      align-items: center; 
      flex-wrap: nowrap; 
      font-family: sans-serif; 
      font-size: 16px; 
      color: #f39c12; 
      max-width: 100%;
    }
    .user-greeting .username, 
    .user-greeting span { 
      margin: 0 6px; 
      white-space: nowrap; 
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .user-greeting .logout-btn { 
      margin: 0 4px; 
      padding: 4px 8px; 
      font-size: 14px; 
      cursor: pointer; 
      border: 1px solid #f39c12; 
      border-radius: 8px; 
      background: transparent; 
      color: #f39c12; 
      transition: background 0.2s, color 0.2s; 
      white-space: nowrap;
    }
    .user-greeting .logout-btn:hover { 
      background: #f39c12; 
      color: #fff; 
    }

 
    @media (max-width: 480px) {
      .user-greeting { font-size: 15px; }
      .user-greeting span.role { display: none; }
    
    }
  `;
  document.head.appendChild(style);
}

/* ===== Boot ===== */
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  injectResponsiveNavCSS();
});

/* ===== Expose for debugging ===== */
window.openAuthModal = openAuthModal;
window.requireAuth = () => !!getToken();
