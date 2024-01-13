function toggleImageFullscreenOnBody(bodyEl: HTMLElement) {
    if (bodyEl.classList.contains("fullscreen-mode")) {
      bodyEl.classList.remove("fullscreen-mode");
    } else {
      bodyEl.classList.add("fullscreen-mode");
    }
  }

  function toggleFullscreenOnImg(el: HTMLElement) {
    if (el.classList.contains("fullscreen")) {
      el.classList.remove("fullscreen");
    } else {
      el.classList.add("fullscreen");
    }
  }

  document.addEventListener("click", function (e) {
    if (window.innerWidth < 760) {
      return;
    }
    const el = e.target as HTMLElement;
    const fullscreenEls = document.querySelectorAll(".fullscreen");
    if (fullscreenEls.length > 0) {
      fullscreenEls.forEach((fsEl) => { toggleFullscreenOnImg(fsEl as HTMLElement)})
      toggleImageFullscreenOnBody(this.body);
    } else {
      if (el.tagName.toUpperCase() === "IMG") {
        toggleFullscreenOnImg(el);
        toggleImageFullscreenOnBody(this.body);
      }
    }
  });

  document.addEventListener("keyup", function (e) {
    if (window.innerWidth < 760) {
      return;
    }
    if (e.key.toUpperCase() === "ESCAPE") {
      const els = document.querySelectorAll(".fullscreen");
      if (els.length > 0) {
        toggleImageFullscreenOnBody(this.body);
        for (const el of els) {
          el.classList.remove("fullscreen");
        }
      }
    }
  });
