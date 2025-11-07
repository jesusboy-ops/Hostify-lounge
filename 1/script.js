// === API CONFIG ===
const API_BASE = "https://hostify-app-nnod.vercel.app/api";

// === AUTH HELPERS ===
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

// === GENERIC API REQUEST ===
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
    console.error(err);
    alert(`Server error: ${err.message}`);
    return null;
  }
}

// === BOOKINGS HANDLERS ===
async function renderBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return;
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
        <button class="action-btn approve" onclick="updateBookingStatus('${b._id}','Confirmed')">✅</button>
        <button class="action-btn reject" onclick="updateBookingStatus('${b._id}','Cancelled')">❌</button>
        <button class="action-btn delete" onclick="deleteBooking('${b._id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, status) {
  if (!confirm(`Change booking status to "${status}"?`)) return;
  await apiRequest(`bookings/update/${id}`, "PUT", { status });
  renderBookings();
}

async function deleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  await apiRequest(`bookings/delete/${id}`, "DELETE");
  renderBookings();
}

// === BOOKING FORM SUBMISSION ===
const bookingForm = document.getElementById("bookingForm");
bookingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = checkAuth();
  if (!token) return;

  const customerName = document.getElementById("fullName")?.value.trim();
  const phoneNum = document.getElementById("phone")?.value.trim();
  const space = document.getElementById("space")?.value.trim() || "Default";
  const date = document.getElementById("date")?.value;
  const time = document.getElementById("time")?.value;
  const people = Number(document.getElementById("guests")?.value) || 1;

  if (!customerName || !phoneNum || !date || !time) {
    alert("Please fill in all required fields");
    return;
  }

  const bookingData = { customerName, phoneNum, space, date, time, people };

  try {
    const res = await apiRequest("bookings/book", "POST", bookingData);
    alert(res.message || "Booking submitted!");
    bookingForm.reset();
    renderBookings();
  } catch (err) {
    console.error("Booking error:", err);
    alert("Error submitting booking: " + err.message);
  }
});

// === FEEDBACK HANDLERS ===
async function renderFeedback() {
  const grid = document.getElementById("feedbackGrid");
  if (!grid) return;
  grid.innerHTML = "<p>⏳ Loading...</p>";

  const feedback = await apiRequest("feedback") || [];
  if (!feedback.length) {
    grid.innerHTML = '<div class="empty-state"><p>No feedback yet.</p></div>';
    return;
  }

  grid.innerHTML = feedback.map(f => `
    <div class="feedback-card">
      <div class="feedback-header">
        <span class="feedback-name">${f.name || 'Anonymous'}</span>
        <button class="delete-feedback" onclick="deleteFeedback('${f._id}')">🗑️</button>
      </div>
      <div class="rating-stars">${'★'.repeat(f.rating || 0) + '☆'.repeat(5 - (f.rating || 0))}</div>
      <div class="feedback-comment">${f.comment || ''}</div>
    </div>
  `).join('');
}

async function deleteFeedback(id) {
  if (!confirm("Delete this feedback?")) return;
  await apiRequest(`feedback/${id}`, "DELETE");
  renderFeedback();
}

// === SIDEBAR NAVIGATION ===
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function () {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    this.classList.add("active");

    const sectionId = this.dataset.section + "-section";
    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    if (window.innerWidth <= 768) {
      document.getElementById("sidebar").classList.remove("visible");
      document.getElementById("menuToggle").classList.remove("active");
    }
  });
});

const menuToggleBtn = document.getElementById("menuToggle");
if (menuToggleBtn) {
  menuToggleBtn.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar?.classList.toggle("visible");
    menuToggleBtn.classList.toggle("active");
  });
}

// === LOGOUT ===
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", () => {
  if (confirm("Logout now?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "";
  }
});

// === DASHBOARD INIT ===
async function initDashboard() {
  const token = checkAuth();
  if (!token) return;

  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const welcomeEl = document.getElementById("welcomeMessage");
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${user.username || "User"} 👋`;
  }

  await renderBookings();
  await renderFeedback();
}

document.addEventListener("DOMContentLoaded", initDashboard);
