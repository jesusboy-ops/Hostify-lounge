document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";

  // === Light Mode First ===
  document.body.classList.remove("dark");
  const themeToggle = document.getElementById("modeToggle");
  if (themeToggle) themeToggle.textContent = "🌙";

  // === Spinner CSS ===
  const spinnerStyle = document.createElement("style");
  spinnerStyle.textContent = `
    .spinner-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .spinner-overlay.active {
      opacity: 1; pointer-events: all;
    }
    .spinner {
      width: 60px; height: 60px;
      border: 6px solid #ddd;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    body.dark .spinner-overlay { background: rgba(0, 0, 0, 0.6); }

    /* Message styling */
    #messageContainer {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 9999;
      display: none;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.3s;
    }
    #messageContainer.info { background: #007bff; }
    #messageContainer.error { background: #dc3545; }
    #messageContainer.success { background: #28a745; }

    /* Thank you popup */
    .thank-you-popup {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: #fff;
      color: #333;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      padding: 25px;
      text-align: center;
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .thank-you-popup.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .thank-you-popup .checkmark {
      font-size: 40px;
      margin-bottom: 10px;
    }
    body.dark .thank-you-popup {
      background: #1f2732;
      color: #fff;
    }
  `;
  document.head.appendChild(spinnerStyle);

  // === Spinner Element ===
  const spinnerOverlay = document.createElement("div");
  spinnerOverlay.className = "spinner-overlay";
  spinnerOverlay.innerHTML = `<div class="spinner"></div>`;
  document.body.appendChild(spinnerOverlay);

  const showSpinner = () => spinnerOverlay.classList.add("active");
  const hideSpinner = () => spinnerOverlay.classList.remove("active");

  // === Message Helper ===
  function showMessage(text, type = "info", duration = 3000) {
    let msg = document.getElementById("messageContainer");
    if (!msg) {
      msg = document.createElement("div");
      msg.id = "messageContainer";
      document.body.appendChild(msg);
    }
    msg.textContent = text;
    msg.className = type;
    msg.style.display = "block";
    msg.style.opacity = "1";
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => (msg.style.display = "none"), 300);
    }, duration);
  }

  // === Elements ===
  const feedbackList = document.getElementById("feedbackList");
  const commentInput = document.getElementById("commentInput");
  const submitBtn = document.getElementById("submitBtn");
  const userNameInput = document.getElementById("userNameInput");
  const nameModal = document.getElementById("nameModal");
  const submitName = document.getElementById("submitName");
  const cancelName = document.getElementById("cancelName");
  const stars = document.querySelectorAll("#starContainer span");
  const menuToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navCenter");
  const logo = document.getElementById("homeLogo");

  let selectedRating = 0;
  let tempFeedbackData = {};

  // === Star Logic ===
  function updateStars(rating) {
    stars.forEach((star, idx) => star.classList.toggle("active", idx < rating));
  }
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);
    star.addEventListener("click", () => {
      selectedRating = value;
      updateStars(value);
    });
    star.addEventListener("mouseover", () => updateStars(value));
    star.addEventListener("mouseout", () => updateStars(selectedRating));
  });

  // === Thank You Popup ===
  function showThankYouMessage() {
    const popup = document.createElement("div");
    popup.className = "thank-you-popup";
    popup.innerHTML = `
      <div class="thank-you-content">
        <div class="checkmark">✅</div>
        <h3>Thank You!</h3>
        <p>Your feedback means a lot 💛</p>
      </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 50);
    setTimeout(() => popup.classList.remove("show"), 2500);
    setTimeout(() => popup.remove(), 3000);
  }

  // === Add Feedback to DOM ===
  function addFeedbackToDOM(feedback) {
    if (!feedbackList) return;
    if (feedbackList.querySelector("p")) feedbackList.innerHTML = "";
    const el = document.createElement("div");
    el.className = "feedback-item";
    el.innerHTML = `
      <div class="feedback-item__header">
        <div class="feedback-item__stars">${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}</div>
        <div class="feedback-item__date">${new Date(feedback.date).toLocaleDateString()}</div>
      </div>
      <div class="feedback-item__comment"><strong>${feedback.name}:</strong> ${feedback.comment}</div>`;
    feedbackList.prepend(el);
  }

  // === Open Name Modal ===
  submitBtn?.addEventListener("click", () => {
    if (!selectedRating) return showMessage("Please select a rating!", "error");
    tempFeedbackData = {
      rating: selectedRating,
      comment: commentInput.value.trim() || "No comment",
    };
    if (nameModal) nameModal.style.display = "flex";
  });

  cancelName?.addEventListener("click", () => {
    if (nameModal) nameModal.style.display = "none";
  });

  // === Submit Feedback ===
  submitName?.addEventListener("click", async () => {
    const name = userNameInput?.value.trim();
    if (!name) return showMessage("Please enter your name!", "error");

    const token = localStorage.getItem("authToken");
    if (!token) {
      showMessage("🔒 Please sign in to submit feedback.", "error");
      if (nameModal) nameModal.style.display = "none";
      return;
    }

    const feedbackData = { ...tempFeedbackData, name, date: new Date().toISOString() };

    showSpinner();
    try {
      const res = await fetch(`${API_BASE}/feedback/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (res.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        return;
      }
      if (!res.ok) throw new Error("Failed to send feedback");

      addFeedbackToDOM(feedbackData);
      showThankYouMessage();

      selectedRating = 0;
      commentInput.value = "";
      userNameInput.value = "";
      updateStars(0);
      if (nameModal) nameModal.style.display = "none";
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Unable to send feedback. Try again later.", "error");
    } finally {
      hideSpinner();
    }
  });

  // === Theme Toggle ===
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });

  // === Mobile Menu ===
  menuToggle?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });

  // === Logo Redirect ===
  logo?.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
});
