document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";

  // === Inject Spinner CSS ===
  const spinnerStyle = document.createElement("style");
  spinnerStyle.textContent = `
    /* Fullscreen Spinner Overlay */
    .spinner-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .spinner-overlay.active {
      opacity: 1;
      pointer-events: all;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 6px solid #ddd;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark mode compatibility */
    body.dark .spinner-overlay {
      background: rgba(0, 0, 0, 0.6);
    }
  `;
  document.head.appendChild(spinnerStyle);

  // === Create Spinner Element ===
  const spinnerOverlay = document.createElement("div");
  spinnerOverlay.className = "spinner-overlay";
  spinnerOverlay.innerHTML = `<div class="spinner"></div>`;
  document.body.appendChild(spinnerOverlay);

  function showSpinner() {
    spinnerOverlay.classList.add("active");
  }

  function hideSpinner() {
    spinnerOverlay.classList.remove("active");
  }

  // === Elements ===
  const messageContainer = document.getElementById("messageContainer");
  const feedbackList = document.getElementById("feedbackList");
  const commentInput = document.getElementById("commentInput");
  const submitBtn = document.getElementById("submitBtn");
  const userNameInput = document.getElementById("userNameInput");
  const nameModal = document.getElementById("nameModal");
  const submitName = document.getElementById("submitName");
  const cancelName = document.getElementById("cancelName");
  const stars = document.querySelectorAll("#starContainer span");
  const themeToggle = document.getElementById("modeToggle");
  const menuToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navCenter");

  let selectedRating = 0;
  let tempFeedbackData = {};

  // --- Helpers ---
  function showMessage(text, type = "info", duration = 2500) {
    if (!messageContainer) return;
    messageContainer.textContent = text;
    messageContainer.className = `onscreen-message ${type}`;
    messageContainer.style.display = "block";
    setTimeout(() => (messageContainer.style.display = "none"), duration);
  }

  function updateStars(rating) {
    stars.forEach((star, idx) => star.classList.toggle("active", idx < rating));
  }

  function showThankYouMessage() {
    const existing = document.querySelector(".thank-you-popup");
    if (existing) existing.remove();
    const popup = document.createElement("div");
    popup.className = "thank-you-popup";
    popup.innerHTML = `
      <div class="thank-you-content">
        <div class="checkmark">✅</div>
        <h3>Thank You!</h3>
        <p>Your feedback means a lot 💛</p>
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 50);
    setTimeout(() => popup.classList.remove("show"), 2500);
    setTimeout(() => popup.remove(), 3000);
  }

  function addFeedbackToDOM(feedback) {
    if (!feedbackList) return;
    if (feedbackList.querySelector("p")) feedbackList.innerHTML = "";

    const feedbackItem = document.createElement("div");
    feedbackItem.className = "feedback-item";
    feedbackItem.innerHTML = `
      <div class="feedback-item__header">
        <div class="feedback-item__stars">${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}</div>
        <div class="feedback-item__date">${new Date(feedback.date).toLocaleDateString()}</div>
      </div>
      <div class="feedback-item__comment"><strong>${feedback.name}:</strong> ${feedback.comment}</div>
    `;
    feedbackList.prepend(feedbackItem);
  }

  // --- Stars Hover/Click ---
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);
    star.addEventListener("click", () => { selectedRating = value; updateStars(selectedRating); });
    star.addEventListener("mouseover", () => updateStars(value));
    star.addEventListener("mouseout", () => updateStars(selectedRating));
  });

  // --- Open Name Modal ---
  submitBtn?.addEventListener("click", () => {
    if (!selectedRating) return showMessage("Please select a rating!", "error");
    tempFeedbackData = { rating: selectedRating, comment: commentInput.value.trim() || "No comment" };
    if (nameModal) nameModal.style.display = "flex";
  });

  cancelName?.addEventListener("click", () => {
    if (nameModal) nameModal.style.display = "none";
  });

  // --- Submit Feedback (with Spinner) ---
  submitName?.addEventListener("click", async () => {
    const name = userNameInput?.value.trim();
    if (!name) return showMessage("Please enter your name!", "error");

    const feedbackData = { ...tempFeedbackData, name, date: new Date().toISOString() };

    showSpinner(); // show spinner right after name input

    try {
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/feedback/post`, {
        method: "POST",
        headers,
        body: JSON.stringify(feedbackData)
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      addFeedbackToDOM(feedbackData);

      selectedRating = 0;
      updateStars(0);
      commentInput.value = "";
      userNameInput.value = "";
      if (nameModal) nameModal.style.display = "none";

      showThankYouMessage();
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Unable to send feedback. Try again later.", "error");
    } finally {
      hideSpinner(); // always hide spinner after request finishes
    }
  });

  // === THEME TOGGLE ===
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });

  // --- Mobile Menu ---
  menuToggle?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });

  // --- Logo Redirect ---
  const logo = document.getElementById("homeLogo");
  if (logo) {
    logo.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }
});
