const API_BASE = "http://localhost:4000/api";

// Theme toggle
const modeToggle = document.getElementById("modeToggle");
const body = document.body;
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light-mode");
  modeToggle.textContent = "🔆";
}
modeToggle.addEventListener("click", () => {
  body.classList.toggle("light-mode");
  const isLight = body.classList.contains("light-mode");
  modeToggle.textContent = isLight ? "🔆" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Mobile Menu Toggle
const mobileToggle = document.getElementById("mobileToggle");
const navCenter = document.getElementById("navCenter");
mobileToggle.addEventListener("click", () => {
  navCenter.classList.toggle("active");
  mobileToggle.textContent = navCenter.classList.contains("active") ? "✕" : "☰";
});

// Spinner overlay
const feedbackOverlay = document.createElement("div");
feedbackOverlay.id = "feedbackOverlay";
feedbackOverlay.classList.add("feedback-overlay");
document.body.appendChild(feedbackOverlay);

// Star rating
const stars = document.querySelectorAll("#starContainer span");
let selectedRating = 0;
stars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    updateStars(selectedRating);
  });
  star.addEventListener("mouseover", () => updateStars(parseInt(star.dataset.value)));
  star.addEventListener("mouseout", () => updateStars(selectedRating));
});
function updateStars(rating) {
  stars.forEach((star, index) => {
    star.classList.toggle("active", index < rating);
  });
}

// Feedback submission
const submitBtn = document.getElementById("submitBtn");
const feedbackList = document.getElementById("feedbackList");
const commentInput = document.getElementById("commentInput");

const nameModal = document.getElementById("nameModal");
const userNameInput = document.getElementById("userNameInput");
const submitName = document.getElementById("submitName");
const cancelName = document.getElementById("cancelName");

let tempFeedbackData = {};

submitBtn.addEventListener("click", () => {
  if (selectedRating === 0) return alert("Please select a rating!");
  tempFeedbackData = { rating: selectedRating, comment: commentInput.value.trim() || "No comment" };
  userNameInput.value = "";
  nameModal.style.display = "flex";
});

cancelName.addEventListener("click", () => {
  nameModal.style.display = "none";
});

submitName.addEventListener("click", async () => {
  const name = userNameInput.value.trim();
  if (!name) return alert("Please enter your name!");

  const feedbackData = { ...tempFeedbackData, name, date: new Date().toISOString() };

  // Show spinner
  feedbackOverlay.innerHTML = `<div class="overlay-content">
                                 <div class="spinner"></div>
                                 <p>Sending feedback...</p>
                               </div>`;
  feedbackOverlay.style.display = "flex";

  try {
    const res = await fetch(`${API_BASE}/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    tempFeedbackData = {};
    selectedRating = 0;
    updateStars(0);
    commentInput.value = "";
    nameModal.style.display = "none";

    setTimeout(() => {
      feedbackOverlay.innerHTML = `<p>🎉 Thank you for your feedback!</p>`;
      setTimeout(() => (feedbackOverlay.style.display = "none"), 1500);
    }, 500);

  } catch (err) {
    console.error(err);
    feedbackOverlay.innerHTML = `<p>⚠️ Unable to send feedback. Try again later.</p>`;
    setTimeout(() => (feedbackOverlay.style.display = "none"), 2000);
  }
});

// Load existing feedback
async function loadFeedback() {
  try {
    const res = await fetch(`${API_BASE}/feedbacks`);
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

document.addEventListener("DOMContentLoaded", loadFeedback);
