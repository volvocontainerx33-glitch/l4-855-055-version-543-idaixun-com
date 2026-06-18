(function () {
  function setText(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  function initPlayer(root) {
    var video = root.querySelector('video');
    var mainButton = root.querySelector('[data-player-toggle]');
    var controlButton = root.querySelector('[data-control-toggle]');
    var muteButton = root.querySelector('[data-control-mute]');
    var fullButton = root.querySelector('[data-control-fullscreen]');
    var status = root.querySelector('[data-player-status]');
    var hlsSource = video ? video.getAttribute('data-src') : '';
    var fallbackSource = video ? video.getAttribute('data-fallback') : '';
    var hls = null;

    if (!video) {
      return;
    }

    function useFallback() {
      if (!fallbackSource) {
        setText(status, '视频加载失败');
        return;
      }
      if (video.getAttribute('src') !== fallbackSource) {
        video.src = fallbackSource;
        video.load();
      }
      setText(status, '播放源已就绪');
    }

    function setupSource() {
      setText(status, '正在加载播放源');
      if (window.Hls && window.Hls.isSupported() && hlsSource) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setText(status, '播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            hls = null;
            useFallback();
          }
        });
        return;
      }
      if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
        video.addEventListener('loadedmetadata', function () {
          setText(status, '播放源已就绪');
        }, { once: true });
        video.addEventListener('error', useFallback, { once: true });
        return;
      }
      useFallback();
    }

    function updateState() {
      var playing = !video.paused && !video.ended;
      root.classList.toggle('playing', playing);
      if (mainButton) {
        mainButton.textContent = playing ? 'Ⅱ' : '▶';
      }
      if (controlButton) {
        controlButton.textContent = playing ? '暂停' : '播放';
      }
      if (muteButton) {
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      }
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setText(status, '点击播放按钮开始播放');
          });
        }
      } else {
        video.pause();
      }
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);

    if (mainButton) {
      mainButton.addEventListener('click', togglePlay);
    }
    if (controlButton) {
      controlButton.addEventListener('click', togglePlay);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        updateState();
      });
    }
    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    setupSource();
    updateState();
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
