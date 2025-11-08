
const API_BASE = "https://hostify-app-nnod.vercel.app/api";


function getAuthToken() {
  return localStorage.getItem("authToken");
}

function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../auth.js";
    return null;
  }
  return token;
}


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


document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function () {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    this.classList.add("active");

    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
    const sectionId = this.dataset.section + "-section";
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("active");

    
    if (window.innerWidth <= 768) {
      document.getElementById("sidebar").classList.remove("visible");
      document.getElementById("menuToggle").classList.remove("active");
    }
  });
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("visible");
  document.getElementById("menuToggle").classList.toggle("active");
});


document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Logout now?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "../index.html";
  }
});


async function renderBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return console.warn("No #bookingsTableBody found");

  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;
  const res = await apiRequest("bookings/all") || {};
  const bookings = res.bookings || [];

  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="6">No bookings found</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.customerName || '-'}</td>
      <td>${b.date || '-'}</td>
      <td>${b.time || '-'}</td>
      <td>${b.space || '-'}</td>
      <td>${b.status || 'Pending'}</td>
      <td>
        <button onclick="updateBookingStatus('${b._id}','Confirmed')">✅</button>
        <button onclick="updateBookingStatus('${b._id}','Cancelled')">❌</button>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, status) {
  if (!confirm(`Change booking status to "${status}"?`)) return;
  await apiRequest(`bookings/update/${id}`, "PUT", { status });
  renderBookings();
}


async function renderOrders() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) {
    console.warn("No #ordersTableBody found in HTML. Orders section cannot be rendered.");
    return;
  }

  tbody.innerHTML = `<tr><td colspan="6">⏳ Loading...</td></tr>`;

  const res = await apiRequest("orders") || {};
  const orders = res.orders || [];

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6">No orders found</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o._id}</td>
      <td>${o.userId?.username || '-'}</td>
      <td>${o.totalPrice || '-'}</td>
      <td>${o.status || 'Pending'}</td>
      <td>${new Date(o.createdAt).toLocaleString() || '-'}</td>
      <td>
        <button onclick="updateOrderStatus('${o._id}','in-progress')">⏳</button>
        <button onclick="updateOrderStatus('${o._id}','completed')">✅</button>
      </td>
    </tr>
  `).join('');
}


async function updateOrderStatus(id, status) {
  if (!confirm(`Change order status to "${status}"?`)) return;
  await apiRequest(`orders/update/${id}`, "PUT", { status });
  renderOrders();
}



async function renderFeedback() {
  const grid = document.getElementById("feedbackGrid");
  if (!grid) return console.warn("No #feedbackGrid found");

  grid.innerHTML = "<p>⏳ Loading...</p>";
  const res = await apiRequest("feedback") || {};
  const feedback = res.feedbacks || [];

  if (!feedback.length) {
    grid.innerHTML = "<p>No feedback found.</p>";
    return;
  }

  grid.innerHTML = feedback.map(f => `
    <div class="feedback-card">
      <div>
        <strong>${f.name || "Anonymous"}</strong>
        <button onclick="deleteFeedback('${f._id}')">🗑️</button>
      </div>
      <div>${'★'.repeat(f.rating || 0)}${'☆'.repeat(5 - (f.rating || 0))}</div>
      <p>${f.comment || ''}</p>
    </div>
  `).join('');
}

async function deleteFeedback(id) {
  if (!confirm("Delete this feedback?")) return;
  await apiRequest(`feedback/${id}`, "DELETE");
  renderFeedback();
}


async function initDashboard() {
  const token = checkAuth();
  if (!token) return;

  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.textContent = `Welcome back, ${user.username || "User"} 👋`;

  await renderBookings();
  await renderOrders();
  await renderFeedback();
}

document.addEventListener("DOMContentLoaded", initDashboard);
