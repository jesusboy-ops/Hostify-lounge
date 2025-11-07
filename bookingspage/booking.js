const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});
 // === THEME TOGGLE ===
  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });
  
document.addEventListener("DOMContentLoaded", () => {
  console.log("Booking script initialized ✅");

  const BOOKING_API = "https://hostify-app-nnod.vercel.app/api/bookings";

  
  const bookingForm = document.getElementById("bookingForm");
  const overlay = document.getElementById("bookingOverlay");
  const messageBox = document.getElementById("messageContainer");

  function showMessage(msg, type = "info") {
    messageBox.style.display = "block";
    messageBox.textContent = msg;
    messageBox.style.background = type === "error" ? "#e74c3c" : "#27ae60";
    messageBox.style.opacity = "1";

    setTimeout(() => {
      messageBox.style.opacity = "0";
      setTimeout(() => (messageBox.style.display = "none"), 500);
    }, 4000);
  }


  overlay.innerHTML = `
    <div style="color: white; text-align: center;">
      <div style="
        border: 6px solid rgba(255,255,255,0.3);
        border-top: 6px solid white;
        border-radius: 50%;
        width: 50px; height: 50px;
        margin: auto;
        animation: spin 1s linear infinite;
      "></div>
      <p style="margin-top: 10px;">Processing your booking...</p>
    </div>
  `;
  const spinnerStyle = document.createElement("style");
  spinnerStyle.innerHTML = `
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(spinnerStyle);

  
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submit button clicked 🧾");

    overlay.style.display = "flex";

 
    const payload = {
      customerName: document.getElementById("fullName").value.trim(),
      phoneNum: document.getElementById("phone").value.trim(),
      email: document.getElementById("email")
        ? document.getElementById("email").value.trim()
        : "guest@example.com", // fallback if email input missing
      space: document.getElementById("space").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      people: Number(document.getElementById("guests").value),
      specialRequests: document.getElementById("specialRequests").value.trim()
    };

    // Validate required fields
    if (
      !payload.customerName ||
      !payload.phoneNum ||
      !payload.email ||
      !payload.space ||
      !payload.date ||
      !payload.time ||
      !payload.people
    ) {
      overlay.style.display = "none";
      return showMessage("Please fill in all required fields.", "error");
    }

   
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(BOOKING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log("Raw response from API:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      overlay.style.display = "none";

      if (!res.ok) {
        console.error("❌ Booking failed:", data);
        return showMessage(
          data.message || data.errors?.[0]?.msg || "Booking failed. Try again later.",
          "error"
        );
      }

      console.log("✅ Booking success:", data);
      showMessage("✅ Booking successful! 🎉", "success");
      bookingForm.reset();

    } catch (err) {
      overlay.style.display = "none";
      console.error("⚠️ Network or code error:", err);
      showMessage("⚠️ Network error. Please try again.", "error");
    }
  });
});
