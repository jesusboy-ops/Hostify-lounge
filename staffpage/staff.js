 const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  // Clear autofilled data
  window.addEventListener("DOMContentLoaded", () => {
    [usernameInput, emailInput, passwordInput].forEach(el => el.value = "");
  });

  const validAccounts = [
    { email: "admin@hostify.com", password: "admin123", role: "Admin" },
    { email: "staff@hostify.com", password: "staff123", role: "Staff" }
  ];

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || username.length < 2) {
      errorMessage.textContent = "Please enter a valid username.";
      errorMessage.classList.add("show");
      return;
    }

    const account = validAccounts.find(acc => acc.email === email && acc.password === password);

    if (!account) {
      errorMessage.textContent = "Invalid email or password.";
      errorMessage.classList.add("show");
      return;
    }

    errorMessage.classList.remove("show");

    // Save for dashboard
    localStorage.setItem("staffName", username);
    localStorage.setItem("staffRole", account.role);

    // Redirect to dashboard after fadeout
    document.querySelector(".login-container").style.animation = "fadeOut 0.3s ease-out";
    setTimeout(() => window.location.href = "/staffpage/staffdashboard.html", 300);
  });

  // Hide error when typing
  [usernameInput, emailInput, passwordInput].forEach(el =>
    el.addEventListener("input", () => errorMessage.classList.remove("show"))
  );