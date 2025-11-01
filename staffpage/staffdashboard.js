 // === TAB SWITCHING ===
    const tabs = document.querySelectorAll(".tab-button");
    const views = document.querySelectorAll(".content-view");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("tab-button--active"));
        tab.classList.add("tab-button--active");

        const target = tab.dataset.tab;
        views.forEach(view => {
          view.classList.toggle("active", view.dataset.view === target);
        });
      });
    });

    // === THEME TOGGLE ===
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");

    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
      body.classList.add("light-mode");
      themeToggle.textContent = "🔆";
    }

    // Toggle theme
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      const isLight = body.classList.contains("light-mode");
      themeToggle.textContent = isLight ? "🔆" : "🌙";
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });

    // === MOBILE TOGGLE ===
    const mobileToggle = document.getElementById("mobileToggle");
    const tabsList = document.querySelector(".tabs-list");

    mobileToggle.addEventListener("click", () => {
      tabsList.classList.toggle("show");
      mobileToggle.textContent = tabsList.classList.contains("show") ? "✕" : "☰";
    });