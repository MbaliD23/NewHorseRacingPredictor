(() => {
  const html = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  let theme = "dark";

  if (toggle) {
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", theme);
    });
  }

  const venueSearch = document.getElementById("venueSearch");
  if (venueSearch) {
    venueSearch.addEventListener("input", (event) => {
      const term = event.target.value.toLowerCase();
      document.querySelectorAll(".venue-card").forEach((card) => {
        const text = card.dataset.search || "";
        card.style.display = text.includes(term) ? "" : "none";
      });
    });
  }

  const raceCardsGrid = document.getElementById("raceCardsGrid");
  if (raceCardsGrid) {
    const chips = document.querySelectorAll(".filter-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        const filter = chip.dataset.filter;

        document.querySelectorAll(".race-block").forEach((card) => {
          const state = card.dataset.state;
          if (filter === "all") {
            card.style.display = "";
          } else if (filter === "live") {
            card.style.display = state === "live" ? "" : "none";
          } else if (filter === "upcoming") {
            card.style.display = state === "upcoming" ? "" : "none";
          }
        });
      });
    });
  }

  const analyticsForm = document.getElementById("analyticsForm");
  if (analyticsForm) {
    const checkboxes = analyticsForm.querySelectorAll(".variable-checkbox");
    const submit = document.getElementById("proceedPredictionBtn");

    const syncSelection = () => {
      const checked = Array.from(checkboxes).filter((item) => item.checked);

      checkboxes.forEach((checkbox) => {
        const wrapper = checkbox.closest(".selectable-pill");
        wrapper.classList.toggle("selected", checkbox.checked);

        if (checked.length >= 3 && !checkbox.checked) {
          checkbox.disabled = true;
          wrapper.style.opacity = "0.45";
        } else {
          checkbox.disabled = false;
          wrapper.style.opacity = "1";
        }
      });

      submit.disabled = checked.length !== 3;
    };

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", syncSelection);
    });

    syncSelection();
  }
})();