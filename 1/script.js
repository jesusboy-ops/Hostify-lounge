
const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.textContent = '🔆';
    }

    
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? '🌙' : '🔆';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    
  function togglePassword(el) {
  const input = el.previousElementSibling;
  input.type = input.type === "password" ? "text" : "password";
}

function validateForm(form) {
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const uppercasePattern = /[A-Z]/;

  if (!emailPattern.test(email)) {
    alert("Invalid email address!");
    return false;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long!");
    return false;
  }

  if (!uppercasePattern.test(password)) {
    alert("Password must include at least one uppercase letter (A–Z)!");
    return false;
  }

  return true;
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
  if (!validateForm(this)) e.preventDefault();
});

document.getElementById("signupForm").addEventListener("submit", function(e) {
  if (!validateForm(this)) e.preventDefault();
});