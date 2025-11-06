

const API_BASE = "https://hostify-app.vercel.app/api";


function getAuthToken() {
  return localStorage.getItem("authToken");
}

function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../auth.html";
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
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    alert(`Server error: ${err.message}`);
    return null;
  }
}


function getSpinnerHTML() {
  return '<tr><td colspan="6">⏳ Loading...</td></tr>';
}

async function renderBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  tbody.innerHTML = getSpinnerHTML();
  const bookings = await apiRequest("book/viewbooking") || [];
  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="6">No bookings found</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.fullName || '-'}</td>
      <td>${b.date || '-'}</td>
      <td>${b.time || '-'}</td>
      <td>${b.table || '-'}</td>
      <td>${b.status || 'Pending'}</td>
      <td>
        <button class="action-btn approve" onclick="updateBookingStatus('${b._id}','Confirmed')">✅</button>
        <button class="action-btn reject" onclick="updateBookingStatus('${b._id}','Cancelled')">❌</button>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, newStatus) {
  if (!confirm(`Change booking status to "${newStatus}"?`)) return;
  await apiRequest(`book/update/${id}`, "PUT", { status: newStatus });
  renderBookings();
}


async function renderFeedback() {
  const grid = document.getElementById("feedbackGrid");
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
  if (!confirm("Are you sure you want to delete this feedback?")) return;
  await apiRequest(`feedback/${id}`, "DELETE");
  renderFeedback();
}


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


document.getElementById("menuToggle").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("visible");
  this.classList.toggle("active");
});


document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Logout now?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "auth.html";
  }
});


async function initDashboard() {
  const token = checkAuth();
  if (!token) return;

  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  document.getElementById("welcomeMessage").textContent = `Welcome back, ${user.username || "User"} 👋`;

  renderBookings();
  renderFeedback();
}

document.addEventListener("DOMContentLoaded", initDashboard);
