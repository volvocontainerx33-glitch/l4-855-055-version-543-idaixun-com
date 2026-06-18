(() => {
  const video = document.getElementById("moviePlayer");
  const cover = document.querySelector(".player-cover");
  const source = typeof videoSource === "string" ? videoSource : "";
  let ready = false;

  const prepare = () => {
    if (!video || ready || !source) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const start = () => {
    prepare();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    if (video) {
      video.controls = true;
      const playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(() => {});
      }
    }
  };

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
  }
})();
