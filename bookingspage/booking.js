document.addEventListener("DOMContentLoaded", () => {
  // === API CONFIG ===
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";
  const BOOKING_ENDPOINT = `${API_BASE}/book/post`;

  // === ELEMENTS ===
  const bookingForm = document.getElementById("bookingForm");
  const nameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const guestsInput = document.getElementById("guests");

  if (!bookingForm) return console.error("Booking form not found!");

  // === MESSAGE UTILITY ===
  function showMessage(msg, isError = false) {
    alert(isError ? `❌ ${msg}` : `✅ ${msg}`);
  }

  // === LOADING OVERLAY ===
  function showLoading(show) {
    let overlay = document.getElementById("bookingOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bookingOverlay";
      overlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-size: 18px;
      `;
      document.body.appendChild(overlay);
    }

    if (show) {
      overlay.innerHTML = `
        <div style="background: white; color: black; padding: 20px; border-radius: 10px; text-align: center;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
          <p>Processing your booking...</p>
        </div>
      `;
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
    }
  }

  // Add spinner CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // === BOOKING SUBMISSION ===
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    
    if (!window.requireAuth?.()) return;

    const { token, user } = JSON.parse(localStorage.getItem("userData"))
      ? getAuthData()
      : { token: null, user: null };

    
    if (!nameInput?.value || !phoneInput?.value) {
      return showMessage("Please enter name and phone number", true);
    }

    const bookingData = {
      customerName: nameInput.value.trim(),
      email: emailInput?.value.trim() || "",
      phoneNum: phoneInput.value.trim(),
      date: dateInput?.value,
      time: timeInput?.value,
      people: Number(guestsInput?.value) || 1,
      status: "Pending",
    };

    showLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          showMessage("Please log in to make a booking", true);
        } else {
          showMessage(`Booking failed: ${response.status} ${errorText}`, true);
        }
        throw new Error(errorText);
      }

      const result = await response.json();
      showMessage("Booking confirmed! We'll contact you soon.");
      bookingForm.reset();
      console.log("Booking success:", result);
    } catch (err) {
      console.error("Booking error:", err);
      if (err.message.includes("Failed to fetch")) {
        showMessage(
          "Network error. Please check your internet or backend server.",
          true
        );
      }
    } finally {
      showLoading(false);
    }
  });

  
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split("T")[0];
  }

  if (timeInput) {
    timeInput.min = "08:00";
    timeInput.max = "22:00";
  }

  console.log("Booking page ready");
});
