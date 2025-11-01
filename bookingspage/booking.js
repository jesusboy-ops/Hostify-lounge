 const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.textContent = document.body.classList.contains('dark') ? '🔆' : '🌙';
    });

    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('🎉 Booking confirmed! You will receive a confirmation email shortly.');
      form.reset();
    });

    const dateInput = document.querySelector('input[type="date"]');
    dateInput.min = new Date().toISOString().split('T')[0];