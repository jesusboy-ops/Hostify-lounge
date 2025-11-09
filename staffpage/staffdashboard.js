const API_BASE = "https://hostify-app-nnod.vercel.app/api";

/* ===== AUTH HANDLING ===== */
function getAuthToken() {
  return localStorage.getItem("authToken");
}

function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../index.html";
    return null;
  }
  return token;
}

/* ===== API REQUEST WRAPPER ===== */
async function apiRequest(endpoint, method = "GET", body = null, auth = true) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (auth) headers["Authorization"] = `Bearer ${getAuthToken()}`;

    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    return null;
  }
}

/* ===== SIDEBAR NAVIGATION ===== */
const navItems = document.querySelectorAll(".nav-item");
const contentSections = document.querySelectorAll(".content-section");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    contentSections.forEach((sec) => sec.classList.remove("active"));

    item.classList.add("active");
    const sectionId = `${item.dataset.section}-section`;
    document.getElementById(sectionId)?.classList.add("active");

    if (sectionId === "bookings-section") renderBookings();
    else if (sectionId === "orders-section") renderOrders();
    else if (sectionId === "feedback-section") renderFeedback();
    else if (sectionId === "users-section") renderUsers();

    if (window.innerWidth <= 768) {
      document.getElementById("sidebar").classList.remove("visible");
      document.getElementById("menuToggle").classList.remove("active");
    }
  });
});

/* ===== MENU TOGGLE ===== */
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("visible");
  document.getElementById("menuToggle").classList.toggle("active");
});

/* ===== LOGOUT ===== */
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Logout now?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "../index.html";
  }
});

/* ===== BOOKINGS ===== */
async function renderBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = (await apiRequest("bookings/all")) || {};
  const bookings = res.bookings || [];

  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="6">No bookings found</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings
    .map(
      (b) => `
      <tr>
        <td>${b.customerName || "-"}</td>
        <td>${b.date || "-"}</td>
        <td>${b.time || "-"}</td>
        <td>${b.space || "-"}</td>
        <td>${b.status || "Pending"}</td>
        <td class="action-buttons">
          <button onclick="updateBookingStatus('${b._id}','Confirmed')">✅</button>
          <button onclick="updateBookingStatus('${b._id}','Cancelled')">❌</button>
          <button onclick="deleteBooking('${b._id}')">🗑️</button>
        </td>
      </tr>
    `
    )
    .join("");
}

async function updateBookingStatus(id, status) {
  if (!confirm(`Change booking status to "${status}"?`)) return;
  await apiRequest(`bookings/update/${id}`, "PUT", { status });
  renderBookings();
}

async function deleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  await apiRequest(`bookings/${id}`, "DELETE");
  renderBookings();
}

/* ===== ORDERS ===== */
async function renderOrders() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = (await apiRequest("orders")) || {};
  const orders = res.orders || [];

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6">No orders found</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      const itemsList = Array.isArray(o.items)
        ? o.items.map((i) => i.name || "Unnamed").join(", ")
        : o.primaryItem || "—";

      const customer =
         o.userId?.name || o.userId?.email || "—";
      const total = o.totalPrice ? `₦${Number(o.totalPrice).toLocaleString()}` : "₦0";
      const status = o.status || "Pending";
      const date = o.createdAt ? new Date(o.createdAt).toLocaleString() : "—";

      return `
      <tr>
        <td><strong>${customer}</strong></td>
        <td>${itemsList}</td>
        <td>${total}</td>
        <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
        <td>${date}</td>
        <td class="action-buttons">
          <button onclick="updateOrderStatus('${o._id}','completed')">✅</button>
          <button onclick="updateOrderStatus('${o._id}','in-progress')">⏳</button>
          <button onclick="deleteOrder('${o._id}')">🗑️</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function updateOrderStatus(id, status) {
  if (!confirm(`Change order status to "${status}"?`)) return;
  await apiRequest(`orders/update/${id}`, "PUT", { status });
  renderOrders();
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  await apiRequest(`orders/${id}`, "DELETE");
  renderOrders();
}

/* ===== FEEDBACK ===== */
async function renderFeedback() {
  const grid = document.getElementById("feedbackGrid");
  if (!grid) return;

  grid.innerHTML = `<p>⏳ Loading...</p>`;
  const res = (await apiRequest("feedback")) || {};
  const feedback = res.feedbacks || [];

  if (!feedback.length) {
    grid.innerHTML = `<p>No feedback found.</p>`;
    return;
  }

  grid.innerHTML = feedback
    .map(
      (f) => `
      <div class="feedback-card">
        <div class="feedback-header">
          <span class="feedback-name">${ f.userId?.name || f.userId?.email || "—"}</span>
          <button class="delete-feedback" onclick="deleteFeedback('${f._id}')">🗑️</button>
        </div>
        <div class="rating-stars">${"★".repeat(f.rating || 0)}${"☆".repeat(
        5 - (f.rating || 0)
      )}</div>
        <p class="feedback-comment">${f.comment || ""}</p>
      </div>
    `
    )
    .join("");
}

async function deleteFeedback(id) {
  if (!confirm("Delete this feedback?")) return;
  await apiRequest(`feedback/${id}`, "DELETE");
  renderFeedback();
}
async function renderUsers() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5">⏳ Loading...</td></tr>`; // updated colspan

  const res = await apiRequest("users/all"); 
  const users = res?.data || []; 

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`; // updated colspan
    return;
  }

  tbody.innerHTML = users
    .map(
      (u) => `
      <tr>
        <td>${u.name || "-"}</td>
        <td>${u.username || "-"}</td>
        <td>${u.email?.replace("@gmail.com", "") || "-"}</td>
        <td>${u.phone || "-"}</td>
        <td>${u.role || "-"}</td>
      </tr>
    `
    )
    .join("");
}




/* ===== DASHBOARD INIT ===== */
async function initDashboard() {
  const token = checkAuth();
  if (!token) return;

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const username = userData.username || "User";

  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.textContent = `Welcome back, ${username} 👋`;

  // Only render the section that is active by default in HTML
  const activeSection = document.querySelector(".content-section.active")?.id;
  if (activeSection === "bookings-section") await renderBookings();
  else if (activeSection === "orders-section") await renderOrders();
  else if (activeSection === "feedback-section") await renderFeedback();
  else if (activeSection === "users-section") await renderUsers();
}
