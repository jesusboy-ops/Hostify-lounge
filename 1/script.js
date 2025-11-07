document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";
  const AUTH_ENDPOINTS = {
    login: `${API_BASE}/users/login`,
    register: `${API_BASE}/users/register`,
  };

  const REPORT_ENDPOINTS = {
    create: `${API_BASE}/reports/create`,
    all: `${API_BASE}/reports`,
    view: (id) => `${API_BASE}/reports/${id}`,
    update: (id) => `${API_BASE}/reports/${id}`,
    delete: (id) => `${API_BASE}/reports/${id}`,
  };

  const body = document.body;

  // ====== THEME TOGGLE ======
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.textContent = '🔆';
    }

    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? '🔆' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // ====== MOBILE MENU TOGGLE ======
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
    menuToggle.textContent = navLinks?.classList.contains('active') ? '✕' : '☰';
  });

  // ====== AUTH MODAL CONTROLS ======
  const authModal = document.getElementById('authModal');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  function openAuthModal(tab = 'login') {
    authModal?.classList.add('active');
    switchTab(tab);
  }

  function closeAuthModal() {
    authModal?.classList.remove('active');
  }

  authCloseBtn?.addEventListener('click', closeAuthModal);
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  function switchTab(tabName) {
    authTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    if (tabName === 'login') {
      loginForm?.classList.add('active');
      signupForm?.classList.remove('active');
    } else {
      signupForm?.classList.add('active');
      loginForm?.classList.remove('active');
    }
  }

  // ====== JWT HELPERS ======
  function decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')));
    } catch { return null; }
  }

  function saveAuthData(token, userData) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  function getAuthData() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userData');
    return { token, user: user ? JSON.parse(user) : null };
  }

  function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isReturningUser');
  }

  // ====== LOGIN HANDLER ======
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();
    if (!email || !password) return alert('Please fill in all fields!');

    try {
      const res = await fetch(AUTH_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (!data.token) throw new Error('No token received');

      const decoded = decodeJWT(data.token);
      if (!decoded) throw new Error('Invalid token');
      saveAuthData(data.token, decoded);
      localStorage.setItem('isReturningUser', 'true');

      if (decoded.role === 'staff' || decoded.role === 'admin') {
        alert(`Welcome back, ${decoded.username || 'Staff'}!`);
        window.location.href = '/staffpage/staffdashboard.html';
      } else {
        alert(`Welcome back, ${decoded.username || 'User'}!`);
        closeAuthModal();
        updateAuthUI();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Login failed. Try again.');
    }
  });

  // ====== SIGNUP HANDLER ======
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupForm.querySelector('input[type="text"]').value.trim();
    const email = signupForm.querySelector('input[type="email"]').value.trim();
    const password = signupForm.querySelector('input[type="password"]').value.trim();
    if (!username || !email || !password) return alert('Please fill in all fields!');

    try {
      const res = await fetch(AUTH_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      if (!data.token) throw new Error('No token received');

      const decoded = decodeJWT(data.token);
      if (!decoded) throw new Error('Invalid token');
      saveAuthData(data.token, decoded);

      alert(`Welcome, ${decoded.username || username}!`);
      closeAuthModal();
      updateAuthUI();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Signup failed. Try again.');
    }
  });

  // ====== AUTH UI UPDATE ======
  function updateAuthUI() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;
    const { token, user } = getAuthData();

    if (token && user) {
      const isReturning = localStorage.getItem('isReturningUser') === 'true';
      const greeting = isReturning ? 'Welcome back' : 'Welcome';
      authButtonsContainer.innerHTML = `
        <div class="user-greeting">
          <span>${greeting}, ${user.username || 'User'}!</span>
          <button class="logout-btn" onclick="handleLogout()">Logout</button>
        </div>`;
    } else {
      authButtonsContainer.innerHTML = `
        <div class="auth-buttons">
          <button class="auth-nav-btn login" onclick="openAuthModal('login')">Login</button>
          <button class="auth-nav-btn signup" onclick="openAuthModal('signup')">Sign up</button>
        </div>`;
    }
  }

  // ====== LOGOUT ======
  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      clearAuthData();
      updateAuthUI();
      alert('You have been logged out successfully!');
    }
  }

  // ====== REPORT FUNCTIONS ======
  async function createReport(reportData) {
    const { token } = getAuthData();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(REPORT_ENDPOINTS.create, { method: 'POST', headers, body: JSON.stringify(reportData) });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  }

  async function getAllReports() {
    const { token } = getAuthData();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(REPORT_ENDPOINTS.all, { headers });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  }

  async function getReportById(id) {
    const { token } = getAuthData();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(REPORT_ENDPOINTS.view(id), { headers });
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  }

  async function updateReport(id, updateData) {
    const { token } = getAuthData();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(REPORT_ENDPOINTS.update(id), { method: 'PUT', headers, body: JSON.stringify(updateData) });
    if (!res.ok) throw new Error('Failed to update report');
    return res.json();
  }

  async function deleteReport(id) {
    const { token } = getAuthData();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(REPORT_ENDPOINTS.delete(id), { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Failed to delete report');
    return res.json();
  }

  // ====== INIT ======
  updateAuthUI();
  window.openAuthModal = openAuthModal;
  window.handleLogout = handleLogout;
  window.createReport = createReport;
  window.getAllReports = getAllReports;
  window.getReportById = getReportById;
  window.updateReport = updateReport;
  window.deleteReport = deleteReport;
});
