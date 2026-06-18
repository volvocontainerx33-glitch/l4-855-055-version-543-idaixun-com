(() => {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobileNav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
      toggle.textContent = mobileNav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  let activeIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }

  const searchPage = document.getElementById("searchPage");

  if (searchPage && Array.isArray(window.SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");

    if (input) {
      input.value = q;
    }

    const normalize = (value) => String(value || "").toLowerCase();
    const query = normalize(q);
    const matched = query
      ? window.SEARCH_INDEX.filter((item) => normalize([item.t, item.r, item.y, item.g, item.tags].join(" ")).includes(query))
      : window.SEARCH_INDEX.slice(0, 48);

    if (results) {
      results.innerHTML = matched.slice(0, 96).map((item) => `
        <a class="movie-card" href="${item.u}">
          <span class="poster-wrap">
            <img src="${item.c}" alt="${item.t}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="poster-play">▶</span>
            <span class="poster-badge">${item.type}</span>
          </span>
          <span class="movie-card-body">
            <strong>${item.t}</strong>
            <em>${item.d}</em>
            <span class="card-meta">
              <span>${item.y}</span>
              <span>${item.r}</span>
              <span>${item.g}</span>
            </span>
          </span>
        </a>
      `).join("");
    }
  }
})();
