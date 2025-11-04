document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });

  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark")
      ? "🔆"
      : "🌙";
  });

  // === Booking Form ===
  const form = document.getElementById("bookingForm");

  let bookingOverlay = document.getElementById("bookingOverlay");
  if (!bookingOverlay) {
    bookingOverlay = document.createElement("div");
    bookingOverlay.id = "bookingOverlay";
    bookingOverlay.classList.add("booking-overlay");
    document.body.appendChild(bookingOverlay);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show spinner
    bookingOverlay.innerHTML = `
      <div class="overlay-content">
        <div class="spinner"></div>
        <p>Sending your booking...</p>
      </div>
    `;
    bookingOverlay.style.display = "flex";

    const bookingData = {
      fullName: form.querySelector('input[type="text"]').value.trim(),
      email: form.querySelector('input[type="email"]').value.trim(),
      phone: form.querySelector('input[type="tel"]').value.trim(),
      date: form.querySelector('input[type="date"]').value,
      time: form.querySelector('input[type="time"]').value,
      guests: form.querySelector('input[type="number"]').value,
      message: form.querySelector("textarea").value.trim(),
    };

    try {
      const res = await fetch("http://localhost:4000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      await res.json();

      // Show thank you message
      setTimeout(() => {
        bookingOverlay.innerHTML =
          "<p>🎉 Thank you for choosing Hostify! We’ll contact you shortly.</p>";
        form.reset();
      }, 1500);
    } catch (err) {
      console.error(err);
      bookingOverlay.innerHTML =
        "<p>⚠️ Unable to send booking. Please try again later.</p>";
    }
  });
});
