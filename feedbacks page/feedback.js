// Light/Dark Mode Toggle
    const modeToggle = document.getElementById("modeToggle");
    const body = document.body;

    // Load saved theme
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

    // Star Rating System
    const stars = document.querySelectorAll("#starContainer span");
    let selectedRating = 0;

    stars.forEach((star) => {
      // Click to select rating
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        updateStars(selectedRating);
      });

      // Hover effect
      star.addEventListener("mouseover", () => {
        const value = parseInt(star.dataset.value);
        updateStars(value);
      });

      // Reset to selected on mouse out
      star.addEventListener("mouseout", () => {
        updateStars(selectedRating);
      });
    });

    function updateStars(rating) {
      stars.forEach((star, index) => {
        star.classList.toggle("active", index < rating);
      });
    }

    // Submit Feedback
    const submitBtn = document.getElementById("submitBtn");
    const commentInput = document.getElementById("commentInput");
    const feedbackList = document.getElementById("feedbackList");

    submitBtn.addEventListener("click", () => {
      if (selectedRating === 0) {
        alert("Please select a rating!");
        return;
      }

      const comment = commentInput.value.trim();
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      // Create feedback item
      const feedbackItem = document.createElement("div");
      feedbackItem.className = "feedback-item";
      feedbackItem.innerHTML = `
        <div class="feedback-item__header">
          <div class="feedback-item__stars">${'★'.repeat(selectedRating)}${'☆'.repeat(5 - selectedRating)}</div>
          <div class="feedback-item__date">${dateStr}</div>
        </div>
        <div class="feedback-item__comment">
          ${comment || "No additional comments provided."}
        </div>
      `;

      // Add to list
      if (feedbackList.querySelector("p")) {
        feedbackList.innerHTML = "";
      }
      feedbackList.insertBefore(feedbackItem, feedbackList.firstChild);

      // Reset form
      selectedRating = 0;
      updateStars(0);
      commentInput.value = "";

      // Success message
      alert("Thank you for your feedback! 🎉");
    });