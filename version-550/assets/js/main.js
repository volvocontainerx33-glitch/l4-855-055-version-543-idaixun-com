(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('open');
      menuToggle.textContent = mobilePanel.classList.contains('open') ? '×' : '☰';
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => show(i));
    });

    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5200);
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const params = new URLSearchParams(window.location.search);
    const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const tagSelect = filterPanel.querySelector('[data-filter-tag]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('[data-empty-state]');

    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilters = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      const tag = normalize(tagSelect ? tagSelect.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        const okKeyword = !keyword || haystack.includes(keyword);
        const okYear = !year || normalize(card.dataset.year) === year;
        const okRegion = !region || normalize(card.dataset.region).includes(region);
        const okTag = !tag || normalize(card.dataset.tags).includes(tag);
        const ok = okKeyword && okYear && okRegion && okTag;

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [keywordInput, yearSelect, regionSelect, tagSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const hlsLoader = (() => {
    let promise;

    return () => {
      if (window.Hls) {
        return Promise.resolve(window.Hls);
      }

      if (!promise) {
        promise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
          script.async = true;
          script.onload = () => resolve(window.Hls);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      return promise;
    };
  })();

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const source = player.dataset.hls;
    let initialized = false;
    let hlsInstance = null;

    const attachSource = async () => {
      if (initialized || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        initialized = true;
        return;
      }

      try {
        const Hls = await hlsLoader();

        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          initialized = true;
        } else {
          video.src = source;
          initialized = true;
        }
      } catch (error) {
        video.src = source;
        initialized = true;
      }
    };

    const startPlayback = async () => {
      await attachSource();

      if (button) {
        button.classList.add('hidden');
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (!initialized || video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', () => {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
