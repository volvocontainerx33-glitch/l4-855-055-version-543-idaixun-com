
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function clean(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        play();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function unique(values) {
        var seen = Object.create(null);
        return values.filter(function (value) {
            if (!value || seen[value]) {
                return false;
            }
            seen[value] = true;
            return true;
        }).sort(function (a, b) {
            return b.localeCompare(a, "zh-Hans-CN");
        });
    }

    function setupFilters() {
        var form = qs("[data-filter-form]");
        var list = qs("[data-card-list]");
        if (!form || !list) {
            return;
        }
        var cards = qsa(".movie-card", list);
        var keyword = qs("[data-filter-keyword]", form);
        var year = qs("[data-filter-year]", form);
        var type = qs("[data-filter-type]", form);
        var region = qs("[data-filter-region]", form);
        fillSelect(year, unique(cards.map(function (card) { return card.getAttribute("data-year"); })));
        fillSelect(type, unique(cards.map(function (card) { return card.getAttribute("data-type"); })));
        fillSelect(region, unique(cards.map(function (card) { return card.getAttribute("data-region"); })));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial && keyword) {
            keyword.value = initial;
        }
        function apply() {
            var q = clean(keyword && keyword.value);
            var y = year && year.value;
            var t = type && type.value;
            var r = region && region.value;
            cards.forEach(function (card) {
                var hay = clean([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type")
                ].join(" "));
                var ok = true;
                if (q && hay.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && card.getAttribute("data-year") !== y) {
                    ok = false;
                }
                if (t && card.getAttribute("data-type") !== t) {
                    ok = false;
                }
                if (r && card.getAttribute("data-region") !== r) {
                    ok = false;
                }
                card.hidden = !ok;
            });
        }
        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, src, triggerSelector) {
        var video = document.getElementById(videoId);
        var trigger = qs(triggerSelector);
        if (!video || !src) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        function start() {
            attach();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (trigger) {
            trigger.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
