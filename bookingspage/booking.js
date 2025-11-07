// === API CONFIG ===
const BOOKING_API = "https://hostify-app-nnod.vercel.app/api/bookings";

// === MESSAGE UTILITY ===
function showMessage(msg, type = "info", duration = 3000) {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "8px",
      zIndex: 10000,
      color: "#fff",
      fontWeight: "600",
      fontFamily: "sans-serif",
      opacity: "0",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(container);
  }

  container.textContent = msg;

  switch(type) {
    case "success": container.style.background = "#28a745"; break;
    case "error": container.style.background = "#dc3545"; break;
    default: container.style.background = "#007bff";
  }

  container.style.opacity = "1";
  setTimeout(() => container.style.opacity = "0", duration);
}

// === OVERLAY UTILITY ===
const overlay = document.getElementById("bookingOverlay");
function showOverlay() { overlay.style.display = "flex"; }
function hideOverlay() { overlay.style.display = "none"; }

// === GET CURRENT USER DATA FROM LOCALSTORAGE ===
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("userData") || "{}");
}

// === BOOKING FORM HANDLER ===
const bookingForm = document.getElementById("bookingForm");

bookingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Booking form submitted!");

  const fullName = document.getElementById("fullName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const space = document.getElementById("space")?.value;
  const date = document.getElementById("date")?.value;
  const time = document.getElementById("time")?.value;
  const people = document.getElementById("guests")?.value;
  const specialRequests = document.getElementById("specialRequests")?.value.trim();

  const user = getCurrentUser();
  const userId = user?._id;
  const email = user?.email;

  if (!userId || !email) {
    return showMessage("You must be logged in to book a table.", "error");
  }

  if (!fullName || !phone || !space || !date || !time || !people) {
    return showMessage("Please fill in all required fields.", "error");
  }

  const payload = {
    user: userId,
    email,
    customerName: fullName,
    phoneNum: phone,
    space,
    date,
    time,
    people: Number(people),
    ...(specialRequests && { specialRequests })
  };

  console.log("Booking payload:", payload);

  try {
    showOverlay();

    const response = await fetch(BOOKING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    hideOverlay();

    // Always log the backend response
    console.log("Backend response:", data, "Status:", response.status);

    if (!response.ok) {
      // Show backend error message directly
      showMessage(data.message || "Booking failed", "error");
      return;
    }

    // Success
    console.log("Booking successful:", data);
    showMessage("Booking successful! 🎉", "success");
    bookingForm.reset();

  } catch (err) {
    hideOverlay();
    console.error("Booking error (network or parsing):", err);
    showMessage(err.message || "Booking failed", "error");
  }
});
