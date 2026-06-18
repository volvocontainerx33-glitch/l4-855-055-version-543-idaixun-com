(function () {
  var body = document.body;
  var navButton = document.querySelector('[data-nav-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        body.classList.remove('nav-open');
      });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startCarousel() {
      if (slides.length < 2) {
        return;
      }
      stopCarousel();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startCarousel();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startCarousel();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startCarousel();
      });
    });

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    showSlide(0);
    startCarousel();
  }

  var pageSearch = document.querySelector('[data-page-search]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var filterState = document.querySelector('[data-filter-state]');
  var activeChip = chips[0] || null;

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchesChip(card, chip) {
    if (!chip || !chip.getAttribute('data-filter-value')) {
      return true;
    }

    var value = normalize(chip.getAttribute('data-filter-value'));
    var field = chip.getAttribute('data-filter-field') || 'text';
    var words = value.split(/\s+/).filter(Boolean);

    if (field === 'category') {
      return normalize(card.getAttribute('data-category')) === value;
    }

    var haystack = normalize(card.getAttribute('data-search-text'));
    return words.some(function (word) {
      return haystack.indexOf(word) !== -1;
    });
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var term = normalize(pageSearch ? pageSearch.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var ok = (!term || text.indexOf(term) !== -1) && matchesChip(card, activeChip);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }

    if (filterState) {
      filterState.textContent = visible === 0 ? '没有匹配内容' : '片单已更新';
    }
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      pageSearch.value = query;
    }

    pageSearch.addEventListener('input', applyFilters);
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', function () {
      if (pageSearch) {
        pageSearch.value = '';
      }
      applyFilters();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      activeChip = chip;
      applyFilters();
    });
  });

  applyFilters();
})();
