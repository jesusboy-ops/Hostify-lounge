document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";

  // === THEME TOGGLE ===
  const modeToggle = document.getElementById("modeToggle");
  const body = document.body;
  if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-mode");
    if (modeToggle) modeToggle.textContent = "🔆";
  }
  modeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");
    modeToggle.textContent = isLight ? "🔆" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  // === MOBILE MENU ===
  const mobileToggle = document.getElementById("mobileToggle");
  const navCenter = document.getElementById("navCenter");
  mobileToggle?.addEventListener("click", () => {
    navCenter?.classList.toggle("active");
    mobileToggle.textContent = navCenter?.classList.contains("active") ? "✕" : "☰";
  });

  // === MESSAGE UTILITY ===
  const messageContainer = document.getElementById("messageContainer");
  function showMessage(text, type = "info", duration = 2500) {
    if (!messageContainer) return;
    messageContainer.textContent = text;
    messageContainer.className = `onscreen-message ${type}`;
    messageContainer.style.display = "block";
    setTimeout(() => (messageContainer.style.display = "none"), duration);
  }

  // === STAR RATING ===
  const stars = document.querySelectorAll("#starContainer span");
  let selectedRating = 0;
  function updateStars(rating) {
    stars.forEach((star, idx) => star.classList.toggle("active", idx < rating));
  }
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);
    star.addEventListener("click", () => { selectedRating = value; updateStars(selectedRating); });
    star.addEventListener("mouseover", () => updateStars(value));
    star.addEventListener("mouseout", () => updateStars(selectedRating));
  });

  // === FEEDBACK FORM ===
  const submitBtn = document.getElementById("submitBtn");
  const feedbackList = document.getElementById("feedbackList");
  const commentInput = document.getElementById("commentInput");
  const nameModal = document.getElementById("nameModal");
  const userNameInput = document.getElementById("userNameInput");
  const submitName = document.getElementById("submitName");
  const cancelName = document.getElementById("cancelName");

  let tempFeedbackData = {};

  // === THANK YOU POPUP ===
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

  // Inject popup styles
  const style = document.createElement("style");
  style.textContent = `
    .thank-you-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0;
      background: #fff;
      color: #333;
      text-align: center;
      border-radius: 1rem;
      padding: 1.5rem 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      transition: all 0.4s ease;
      z-index: 99999;
    }
    .thank-you-popup.show {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    .thank-you-content h3 { margin: 0.5rem 0 0.3rem; }
    .checkmark { font-size: 2rem; animation: pop 0.3s ease; }
    @keyframes pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `;
  document.head.appendChild(style);

  // === STEP 1: MAIN SUBMIT ===
  submitBtn?.addEventListener("click", () => {
    if (!selectedRating) return showMessage("Please select a rating!", "error");
    tempFeedbackData = { rating: selectedRating, comment: commentInput.value.trim() || "No comment" };
    if (nameModal) nameModal.style.display = "flex";
  });

  cancelName?.addEventListener("click", () => { if (nameModal) nameModal.style.display = "none"; });

  // === STEP 2: SUBMIT NAME & SEND TO API ===
  submitName?.addEventListener("click", async () => {
    const name = userNameInput?.value.trim();
    if (!name) return showMessage("Please enter your name!", "error");

    const feedbackData = { ...tempFeedbackData, name, date: new Date().toISOString() };

    try {
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/feedback/post`, {
        method: "POST",
        headers,
        body: JSON.stringify(feedbackData),
      });

      if (!res.ok) throw new Error("Failed to send feedback");
      const savedFeedback = await res.json();

      const feedbackItem = document.createElement("div");
      feedbackItem.className = "feedback-item";
      feedbackItem.innerHTML = `
        <div class="feedback-item__header">
          <div class="feedback-item__stars">${"★".repeat(savedFeedback.rating)}${"☆".repeat(5 - savedFeedback.rating)}</div>
          <div class="feedback-item__date">${new Date(savedFeedback.date).toLocaleDateString()}</div>
        </div>
        <div class="feedback-item__comment"><strong>${savedFeedback.name}:</strong> ${savedFeedback.comment}</div>
      `;

      if (feedbackList.querySelector("p")) feedbackList.innerHTML = "";
      feedbackList.insertBefore(feedbackItem, feedbackList.firstChild);

      // Reset form
      selectedRating = 0;
      updateStars(0);
      commentInput.value = "";
      userNameInput.value = "";
      if (nameModal) nameModal.style.display = "none";
      showThankYouMessage();
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Unable to send feedback. Try again later.", "error");
    }
  });

  // === LOAD EXISTING FEEDBACK ===
  async function loadFeedback() {
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      if (!res.ok) throw new Error("Failed to load feedbacks");
      const feedbacks = await res.json();

      if (!feedbacks.length) {
        feedbackList.innerHTML = "<p>No feedback yet. Be the first to share!</p>";
        return;
      }

      feedbackList.innerHTML = feedbacks.map(fb => `
        <div class="feedback-item">
          <div class="feedback-item__header">
            <div class="feedback-item__stars">${"★".repeat(fb.rating)}${"☆".repeat(5 - fb.rating)}</div>
            <div class="feedback-item__date">${new Date(fb.date).toLocaleDateString()}</div>
          </div>
          <div class="feedback-item__comment"><strong>${fb.name || "Anonymous"}:</strong> ${fb.comment}</div>
        </div>
      `).join("");
    } catch (err) {
      console.error(err);
      feedbackList.innerHTML = `<p class="error">⚠️ Unable to load feedbacks.</p>`;
    }
  }

  loadFeedback();
});
