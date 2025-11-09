const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("homeLogo");
  if (logo) {
    logo.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }
});
const themeToggle = document.getElementById("themeToggle");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Booking script initialized ✅");

  const BOOKING_API = "https://hostify-app-nnod.vercel.app/api/bookings/book";
  const bookingForm = document.getElementById("bookingForm");
  const overlay = document.getElementById("bookingOverlay");
  const messageBox = document.getElementById("messageContainer");

  // Message helper
  function showMessage(msg, type = "info") {
    if (!messageBox) return;
    messageBox.style.display = "block";
    messageBox.textContent = msg;
    messageBox.style.background = type === "error" ? "#e74c3c" : "#27ae60";
    messageBox.style.opacity = "1";

    setTimeout(() => {
      messageBox.style.opacity = "0";
      setTimeout(() => (messageBox.style.display = "none"), 500);
    }, 4000);
  }

  // Spinner overlay
  if (overlay) {
    overlay.innerHTML = `
      <div style="color:white;text-align:center;">
        <div style="
          border:6px solid rgba(255,255,255,0.3);
          border-top:6px solid white;
          border-radius:50%;
          width:50px;height:50px;
          margin:auto;
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top:10px;">Processing your booking...</p>
      </div>
    `;
    const spinnerStyle = document.createElement("style");
    spinnerStyle.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(spinnerStyle);
  }

  // Booking form submission
  bookingForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Booking submitted 🧾");

    if (overlay) overlay.style.display = "flex";

    const token = localStorage.getItem("authToken"); // optional if backend uses auth
    const userEmail = localStorage.getItem("userEmail"); // get email from login

    const payload = {
      customerName: document.getElementById("fullName")?.value.trim(),
      phoneNum: document.getElementById("phone")?.value.trim(),
      space: document.getElementById("space")?.value,
      date: document.getElementById("date")?.value,
      time: document.getElementById("time")?.value,
      people: Number(document.getElementById("guests")?.value),
      specialRequests: document.getElementById("specialRequests")?.value.trim(),
      email: userEmail || `guest${Date.now()}@example.com` // always provide email
    };

    // Validate required fields
    if (!payload.customerName || !payload.phoneNum || !payload.space || !payload.date || !payload.time || !payload.people) {
      if (overlay) overlay.style.display = "none";
      return showMessage("Please fill in all required fields.", "error");
    }

    try {
      const res = await fetch(BOOKING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (overlay) overlay.style.display = "none";

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        console.error("❌ Booking failed:", data);
        return showMessage(data.message || "Booking failed. Try again later.", "error");
      }

      console.log("✅ Booking success:", data);
      showMessage("✅ Booking successful! 🎉", "success");
      bookingForm.reset();

    } catch (err) {
      if (overlay) overlay.style.display = "none";
      console.error("⚠️ Network error:", err);
      showMessage("⚠️ Network error. Please try again.", "error");
    }
  });
});
