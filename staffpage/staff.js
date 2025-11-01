// staff.js
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.querySelector("#password");
  const loginButton = document.querySelector(".login-form_button");

  if (loginButton) {
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();

      const enteredPassword = passwordInput.value.trim();
      const correctPassword = "staff123";

      if (enteredPassword === correctPassword) {
        // ✅ Redirect to dashboard
        window.location.href = "/staffpage/staffDashboard.html";
      } else {
        alert("Incorrect password. Please try again.");
      }
    });
  }

  // === TAB SWITCHING FOR DASHBOARD ===
  const tabs = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".content-view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active states
      tabs.forEach((t) => t.classList.remove("tab-button--active"));
      views.forEach((v) => v.classList.remove("active"));

      // Add active states to clicked tab
      tab.classList.add("tab-button--active");
      const viewName = tab.getAttribute("data-tab");
      document.querySelector(`[data-view="${viewName}"]`).classList.add("active");
    });
  });

  // === LOGOUT ===
  const logoutBtn = document.querySelector(".dashboard-header_logout-button a");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../index.html"; 
    });
  }
});
