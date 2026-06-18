(function () {
  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var stream = video ? video.getAttribute("data-stream") : "";

    if (!video || !stream) {
      return;
    }

    function bindStream() {
      if (video.getAttribute("data-bound") === "1") {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: false,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        shell._hls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }

      video.setAttribute("data-bound", "1");
    }

    function play() {
      bindStream();

      if (overlay) {
        overlay.classList.add("hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(startPlayer);
})();
