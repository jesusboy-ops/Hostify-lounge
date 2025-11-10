const API_BASE = "https://hostify-app-nnod.vercel.app/api";

// ===== Auth Helpers =====
function getAuthToken() {
  try { return localStorage.getItem("authToken"); } catch { return null; }
}
function clearAuthToken() {
  try { localStorage.removeItem("authToken"); } catch {}
}

// ===== Fullscreen Spinner =====
function showFullScreenSpinner(show = true, text = "Loading...") {
  let spinner = document.getElementById("fullScreenSpinner");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "fullScreenSpinner";
    Object.assign(spinner.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "#fff",
      fontSize: "1.2rem",
      fontFamily: "Poppins, sans-serif",
      zIndex: 9999,
      transition: "opacity 0.3s"
    });
    spinner.innerHTML = `
      <div class="spinner-circle" style="
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid #f39c12;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
      "></div>
      <span>${text}</span>
    `;
    const style = document.createElement("style");
    style.textContent = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
    document.body.appendChild(spinner);
  }
  spinner.style.display = show ? "flex" : "none";
}

// ===== API Request Wrapper =====
async function apiRequest(endpoint, method = "GET", body = null, auth = true) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found");
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    alert(err.message || "An error occurred.");
    return null;
  }
}

// ===== Fetch Current User =====
async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  const decodeJWT = (t) => {
    try {
      const base64Url = t.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(
        atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      ));
    } catch { return null; }
  };

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const idCandidates = [decoded.id, decoded._id, decoded.userId, decoded.sub, decoded.userid, decoded.user_id].filter(Boolean);

  for (const id of idCandidates) {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json().catch(() => null);
      const user = json?.user || json?.data || json;
      if (res.ok && user && (user.username || user.name || user.email)) return user;
      if (res.status === 401) return null;
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json().catch(() => null);
    const user = json?.user || json?.data || json;
    if (res.ok && user && (user.username || user.name || user.email)) return user;
  } catch {}

  return {
    username: decoded.username || decoded.name || decoded.email || "User",
    role: decoded.role || "user",
    id: idCandidates[0] || null
  };
}

// ===== Sidebar Setup =====
function setupSidebar() {
  const navItems = document.querySelectorAll(".nav-item");
  const contentSections = document.querySelectorAll(".content-section");

  navItems.forEach(item => {
    item.addEventListener("click", async () => {
      navItems.forEach(i => i.classList.remove("active"));
      contentSections.forEach(sec => sec.classList.remove("active"));

      item.classList.add("active");
      const sectionId = `${item.dataset.section}-section`;
      document.getElementById(sectionId)?.classList.add("active");

      // Render data for this section
      switch (sectionId) {
        case "bookings-section": await renderBookings(); break;
        case "orders-section": await renderOrders(); break;
        case "feedback-section": await renderFeedback(); break;
        case "users-section": await renderUsers(); break;
      }

      if (window.innerWidth <= 768) {
        document.getElementById("sidebar")?.classList.remove("visible");
        document.getElementById("menuToggle")?.classList.remove("active");
      }
    });
  });

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("visible");
    document.getElementById("menuToggle")?.classList.toggle("active");
  });
}

// ===== Logout =====
function setupLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (confirm("Logout now?")) {
      clearAuthToken();
      window.location.href = "../index.html";
    }
  });
}

// ===== Dashboard Render Functions =====
async function renderBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = await apiRequest("bookings/all");
  const bookings = res?.bookings || [];
  if (!bookings.length) return tbody.innerHTML = `<tr><td colspan="6">No bookings found</td></tr>`;

  const reversed = [...bookings].reverse();
  tbody.innerHTML = reversed.map(b => `
    <tr id="booking-${b._id}">
      <td>${b.customerName || "-"}</td>
      <td>${b.date || "-"}</td>
      <td>${b.time || "-"}</td>
      <td>${b.space || "-"}</td>
      <td class="status">${b.status || "Pending"}</td>
      <td class="action-buttons">
        <button data-booking-action="confirm" data-id="${b._id}">✅</button>
        <button data-booking-action="pending" data-id="${b._id}">⏳</button>
        <button data-booking-action="cancel" data-id="${b._id}">❌</button>
        <button data-booking-action="delete" data-id="${b._id}">🗑️</button>
      </td>
    </tr>
  `).join("");
}

async function renderOrders() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = await apiRequest("orders");
  const orders = res?.orders || [];
  if (!orders.length) return tbody.innerHTML = `<tr><td colspan="6">No orders found</td></tr>`;

  const reversed = [...orders].reverse();
  tbody.innerHTML = reversed.map(o => `
    <tr id="order-${o._id}">
      <td><strong>${o.userId?.name || o.userId?.email || "—"}</strong></td>
      <td>${Array.isArray(o.items) ? o.items.map(i => i.name).join(", ") : o.primaryItem || "—"}</td>
      <td>₦${Number(o.totalPrice || 0).toLocaleString()}</td>
      <td class="status">${o.status || "Pending"}</td>
      <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
      <td class="action-buttons">
        <button data-order-action="completed" data-id="${o._id}">✅</button>
        <button data-order-action="inprogress" data-id="${o._id}">⏳</button>
        <button data-order-action="cancelled" data-id="${o._id}">❌</button>
        <button data-order-action="delete" data-id="${o._id}">🗑️</button>
      </td>
    </tr>
  `).join("");
}

async function renderFeedback() {
  const grid = document.getElementById("feedbackGrid");
  if (!grid) return;
  grid.innerHTML = `<p>⏳ Loading...</p>`;
  const res = await apiRequest("feedback");
  const feedback = res?.feedbacks || [];
  if (!feedback.length) return grid.innerHTML = `<p>No feedback found.</p>`;

  const reversed = [...feedback].reverse();
  grid.innerHTML = reversed.map(f => `
    <div class="feedback-card" id="feedback-${f._id}">
      <div class="feedback-header">
        <span>${f.userId?.name || f.userId?.email || "Anonymous"}</span>
        <button data-feedback-action="delete" data-id="${f._id}">🗑️</button>
      </div>
      <div class="rating-stars">${"★".repeat(f.rating || 0)}${"☆".repeat(5 - (f.rating || 0))}</div>
      <p>${f.comment || ""}</p>
    </div>
  `).join("");
}

async function renderUsers() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = await apiRequest("users/all");
  const users = res?.data || [];
  if (!users.length) return tbody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;

  const reversed = [...users].reverse();
  tbody.innerHTML = reversed.map(u => {
    const displayName = u.name ? u.name.replace(/^\w/, c => c.toUpperCase()) : "-";
    const email = u.email || "-";
    return `
      <tr id="user-${u._id}">
        <td>${displayName}</td>
        <td>${u.username || "-"}</td>
        <td>${email}</td>
        <td>${u.phone || "-"}</td>
        <td>${u.role || "-"}</td>
        <td class="action-buttons">
          <button data-user-action="delete" data-id="${u._id}">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");
}

// ===== Event Delegation for Dynamic Buttons =====
document.addEventListener("click", async (e) => {
  const target = e.target;

  // Bookings
  if (target.matches("button[data-booking-action]")) {
    const id = target.dataset.id;
    const action = target.dataset.bookingAction;
    if (action === "confirm") await updateBookingStatus(id, "Confirmed");
    else if (action === "pending") await updateBookingStatus(id, "Pending");
    else if (action === "cancel") await cancelBooking(id);
    else if (action === "delete") await deleteBooking(id);
  }

  // Orders
  if (target.matches("button[data-order-action]")) {
    const id = target.dataset.id;
    const action = target.dataset.orderAction;
    if (action === "completed") await updateOrderStatus(id, "Completed");
    else if (action === "inprogress") await updateOrderStatus(id, "In Progress");
    else if (action === "cancelled") await updateOrderStatus(id, "Cancelled");
    else if (action === "delete") await deleteOrder(id);
  }

  // Feedback
  if (target.matches("button[data-feedback-action='delete']")) {
    const id = target.dataset.id;
    await deleteFeedback(id);
  }

  // Users
  if (target.matches("button[data-user-action='delete']")) {
    const id = target.dataset.id;
    await deleteUser(id);
  }
});

// ===== Dashboard Initialization =====
async function initDashboard() {
  showFullScreenSpinner(true, "Loading dashboard...");

  const token = getAuthToken();
  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  const user = await fetchCurrentUser();
  showFullScreenSpinner(false);

  if (!user) {
    alert("Could not load user info. Please login again.");
    clearAuthToken();
    window.location.href = "../index.html";
    return;
  }

  const fullName = (user.name || user.username || user.email?.split("@")[0] || "User")
    .replace(/^\w/, c => c.toUpperCase());

  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.textContent = `Welcome ${fullName}`;

  setupSidebar();
  setupLogout();

  // Render the default active section
  const activeSection = document.querySelector(".content-section.active")?.id;
  switch (activeSection) {
    case "bookings-section": await renderBookings(); break;
    case "orders-section": await renderOrders(); break;
    case "feedback-section": await renderFeedback(); break;
    case "users-section": await renderUsers(); break;
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
