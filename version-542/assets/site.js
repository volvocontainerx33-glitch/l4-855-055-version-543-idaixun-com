(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", panel.classList.contains("is-open"));
    });
    panel.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        panel.classList.remove("is-open");
        document.body.classList.remove("is-menu-open");
      }
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    show(0);
    play();
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
      var input = panel.querySelector(".filter-search");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".filter-card"));
      var empty = panel.querySelector("[data-empty-state]");
      var active = "all";

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var category = card.getAttribute("data-category") || "";
          var byChip = active === "all" || category === active || text.indexOf(active) !== -1;
          var byTerm = !term || text.indexOf(term) !== -1;
          var ok = byChip && byTerm;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
      if (input) {
        input.addEventListener("input", apply);
        try {
          var params = new URLSearchParams(window.location.search);
          var q = params.get("q");
          if (q) {
            input.value = q;
          }
        } catch (error) {}
      }
      apply();
    });
  }

  function setupMoviePlayer(streamUrl) {
    ready(function () {
      var video = document.querySelector('[data-role="movie-player"]');
      var overlay = document.querySelector('[data-role="player-overlay"]');
      if (!video || !overlay || !streamUrl) {
        return;
      }
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        prepare();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", start);
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
