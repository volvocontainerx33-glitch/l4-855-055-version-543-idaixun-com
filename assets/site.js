(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var input = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var empty = document.querySelector("[data-filter-empty]");

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      var matched = matchedKeyword && matchedYear;

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      input.value = q;
    }

    input.addEventListener("input", applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
  }

  if (input || yearSelect) {
    applyFilters();
  }
})();
