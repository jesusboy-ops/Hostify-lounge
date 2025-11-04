 // === MOBILE MENU TOGGLE ===
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // === DARK / LIGHT MODE TOGGLE ===
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.textContent = '🔆';
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? '🌙' : '🔆';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });