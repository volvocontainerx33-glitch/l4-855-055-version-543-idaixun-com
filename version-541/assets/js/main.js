(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function setupRails() {
    document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
      var rail = wrap.querySelector('[data-movie-rail]');
      var left = wrap.querySelector('[data-rail-left]');
      var right = wrap.querySelector('[data-rail-right]');

      if (!rail) {
        return;
      }

      function scroll(direction) {
        rail.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      }

      if (left) {
        left.addEventListener('click', function () {
          scroll(-1);
        });
      }

      if (right) {
        right.addEventListener('click', function () {
          scroll(1);
        });
      }
    });
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      var section = input.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.searchable-card'));
      var count = section.querySelector('[data-filter-count]');

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部可见';
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card searchable-card">',
      '  <a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-category">' + escapeHtml(movie.category) + '</span>',
      '    <span class="play-hover">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tagHtml + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var results = page.querySelector('[data-search-results]');
    var title = page.querySelector('[data-search-title]');
    var summary = page.querySelector('[data-search-summary]');
    var query = readQuery();

    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return keywords.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });

    if (title) {
      title.textContent = '搜索结果：' + query;
    }

    if (summary) {
      summary.textContent = '共找到 ' + matched.length + ' 部相关影片。';
    }

    if (results) {
      results.innerHTML = matched.map(renderSearchCard).join('') || '<p class="empty-tip">没有找到相关影片，请尝试其他关键词。</p>';
    }
  }

  function setupScrollPlayerLinks() {
    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-player]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var button = player.querySelector('[data-player-start]');
        if (button) {
          window.setTimeout(function () {
            button.focus();
          }, 450);
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHeroSlider();
    setupRails();
    setupLocalFilters();
    setupSearchPage();
    setupScrollPlayerLinks();
  });
})();
