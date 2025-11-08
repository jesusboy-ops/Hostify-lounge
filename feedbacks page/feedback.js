document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://hostify-app-nnod.vercel.app/api";

  // Elements
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

  // --- Submit Feedback ---
  submitName?.addEventListener("click", async () => {
    const name = userNameInput?.value.trim();
    if (!name) return showMessage("Please enter your name!", "error");

    const feedbackData = { ...tempFeedbackData, name, date: new Date().toISOString() };

    try {
      // Send to backend
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/feedback/post`, {
        method: "POST",
        headers,
        body: JSON.stringify(feedbackData)
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      // Add feedback immediately
      addFeedbackToDOM(feedbackData);

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

 // === THEME TOGGLE ===
  const theToggle = document.getElementById("modeToggle");

  
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });
  // --- Mobile Menu ---
  menuToggle?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });
});
