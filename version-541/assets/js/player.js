(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  var hlsLibraryPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLibraryPromise) {
      return hlsLibraryPromise;
    }

    hlsLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
          return;
        }
        reject(new Error('Hls.js 加载失败'));
      };
      script.onerror = function () {
        reject(new Error('Hls.js 网络加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsLibraryPromise;
  }

  function setStatus(box, message) {
    var status = box.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo(video, box) {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setStatus(box, '浏览器阻止了自动播放，请再次点击视频控制栏播放。');
      });
    }
  }

  function useFallback(video, box, fallbackUrl) {
    if (!fallbackUrl) {
      setStatus(box, '当前浏览器未能加载 HLS 播放源。');
      return;
    }

    video.src = fallbackUrl;
    video.load();
    box.classList.add('is-playing');
    setStatus(box, '已切换到本地 MP4 兜底播放源。');
    playVideo(video, box);
  }

  function attachHls(video, box, hlsUrl, fallbackUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.load();
      box.classList.add('is-playing');
      setStatus(box, '正在使用浏览器原生 HLS 播放。');
      playVideo(video, box);
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (!Hls.isSupported()) {
        useFallback(video, box, fallbackUrl);
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        box.classList.add('is-playing');
        setStatus(box, 'HLS 播放源已初始化。');
        playVideo(video, box);
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus(box, 'HLS 网络错误，正在尝试恢复。');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus(box, 'HLS 媒体错误，正在尝试恢复。');
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        useFallback(video, box, fallbackUrl);
      });

      video._staticSiteHls = hls;
    }).catch(function () {
      useFallback(video, box, fallbackUrl);
    });
  }

  function setupPlayer(box) {
    var button = box.querySelector('[data-player-start]');
    var video = box.querySelector('video');
    var hlsUrl = box.getAttribute('data-hls');
    var fallbackUrl = box.getAttribute('data-fallback');
    var initialized = false;

    if (!button || !video || !hlsUrl) {
      return;
    }

    button.addEventListener('click', function () {
      if (initialized) {
        playVideo(video, box);
        return;
      }

      initialized = true;
      setStatus(box, '正在初始化播放器，请稍候。');
      attachHls(video, box, hlsUrl, fallbackUrl);
    });
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
