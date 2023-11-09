document.addEventListener("DOMContentLoaded", function () {
  var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));

  const breakPoints = {
    small: 640, // 40em
    medium: 960, // 60em
  };

  if ("IntersectionObserver" in window) {
    var lazyVideoObserver = new IntersectionObserver(function (entries, _observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          const screenWidth = window.innerWidth;
          const wantedVideoSize =
            screenWidth < breakPoints.small ? "small" : screenWidth < breakPoints.medium ? "medium" : "large";
          let enabledVideo = false;
          for (var source in video.target.children) {
            var videoSource = video.target.children[source];
            if (
              typeof videoSource.tagName === "string" &&
              videoSource.tagName === "SOURCE" &&
              videoSource.dataset.size === wantedVideoSize
            ) {
              videoSource.src = videoSource.dataset.src;
              enabledVideo = true;
              break;
            }
          }

          if (!enabledVideo) {
            video.target.src = video.target.dataset.src;
          }

          video.target.load();
          video.target.classList.remove("lazy");
          lazyVideoObserver.unobserve(video.target);
        }
      });
    });

    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
});
