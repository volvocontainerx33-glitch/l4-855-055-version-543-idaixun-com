(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileNav() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupImageFallback() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panel = $('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var queryInput = $('[data-filter-query]', panel);
    var typeSelect = $('[data-filter-type]', panel);
    var regionSelect = $('[data-filter-region]', panel);
    var genreSelect = $('[data-filter-genre]', panel);
    var yearSelect = $('[data-filter-year]', panel);
    var result = $('[data-filter-result]', panel);
    var zone = $('[data-filter-zone]');
    var cards = $all('.movie-card[data-title]', zone || document);
    var params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function readFilters() {
      return {
        q: normalize(queryInput && queryInput.value),
        type: normalize(typeSelect && typeSelect.value),
        region: normalize(regionSelect && regionSelect.value),
        genre: normalize(genreSelect && genreSelect.value),
        year: normalize(yearSelect && yearSelect.value)
      };
    }

    function cardMatches(card, filters) {
      var title = normalize(card.dataset.title);
      var type = normalize(card.dataset.type);
      var region = normalize(card.dataset.region);
      var genre = normalize(card.dataset.genre);
      var year = normalize(card.dataset.year);
      var tags = normalize(card.dataset.tags);
      var summary = normalize(card.dataset.summary);
      var searchArea = [title, type, region, genre, year, tags, summary].join(' ');
      if (filters.q && searchArea.indexOf(filters.q) === -1) {
        return false;
      }
      if (filters.type && type !== filters.type) {
        return false;
      }
      if (filters.region && region !== filters.region) {
        return false;
      }
      if (filters.genre && genre.indexOf(filters.genre) === -1) {
        return false;
      }
      if (filters.year && year !== filters.year) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      var filters = readFilters();
      var visible = 0;
      cards.forEach(function (card) {
        var matched = cardMatches(card, filters);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = '当前筛选结果：' + visible + ' 部';
      }
    }

    [queryInput, typeSelect, regionSelect, genreSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    var form = $('[data-filter-form]', panel);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilters();
      });
      form.addEventListener('reset', function () {
        window.setTimeout(applyFilters, 0);
      });
    }

    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupImageFallback();
    setupHero();
    setupFilters();
  });
})();
