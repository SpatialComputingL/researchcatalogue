(() => {
  const navigationButton = document.querySelector("#contents-toolbar-button");
  const contentsOverlay = document.querySelector("#contents-overlay");
  const contentsPanel = document.querySelector("#contents-panel");
  if (!navigationButton || !contentsOverlay || !contentsPanel) return;

  const toolbar = document.querySelector(".toolbar");
  const toolbarButtons = [...(toolbar?.querySelectorAll(":scope > button") || [])];
  toolbarButtons[0]?.classList.add("zoom-out-button");
  toolbarButtons[1]?.classList.add("zoom-in-button");
  toolbarButtons[2]?.classList.add("reset-zoom-button");
  const themeButton = document.createElement("button");
  themeButton.type = "button";
  themeButton.id = "theme-toggle-button";
  themeButton.className = "theme-toggle-button";
  const savedTheme = localStorage.getItem("spatial-lab-theme");
  const initialTheme = savedTheme === "night" || (savedTheme !== "day" && (new Date().getHours() < 7 || new Date().getHours() >= 18));
  document.body.classList.toggle("theme-night", initialTheme);
  const syncThemeButton = () => {
    const isNight = document.body.classList.contains("theme-night");
    themeButton.setAttribute("aria-pressed", String(isNight));
    themeButton.setAttribute("aria-label", isNight ? "Enable light mode" : "Enable night mode");
    themeButton.innerHTML = isNight
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z"></path></svg>';
  };
  syncThemeButton();
  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("theme-night");
    localStorage.setItem("spatial-lab-theme", document.body.classList.contains("theme-night") ? "night" : "day");
    syncThemeButton();
  });
  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.id = "mobile-reload-button";
  reloadButton.className = "mobile-reload-button";
  reloadButton.setAttribute("aria-label", "Reload canvas");
  reloadButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5"></path><path d="M19 12a7 7 0 1 1-2.05-4.95L20 12"></path></svg>';
  reloadButton.addEventListener("click", () => window.location.reload());

  let toolbarHideTimer = 0;
  const hideToolbar = () => {
    window.clearTimeout(toolbarHideTimer);
    toolbarHideTimer = window.setTimeout(() => {
      if (document.querySelector("#canvas-shell:not([hidden])")) toolbar?.classList.add("is-hidden");
    }, 10000);
  };
  const showToolbar = () => toolbar?.classList.remove("is-hidden");
  hideToolbar();
  window.addEventListener("pointermove", (event) => {
    if (event.clientY <= (window.matchMedia("(max-width: 760px)").matches ? 42 : 24)) {
      showToolbar();
      hideToolbar();
    }
  }, { passive: true });
  toolbar?.addEventListener("pointerenter", () => window.clearTimeout(toolbarHideTimer));
  toolbar?.addEventListener("pointerleave", hideToolbar);
  toolbar?.addEventListener("focusin", () => window.clearTimeout(toolbarHideTimer));
  toolbar?.addEventListener("focusout", hideToolbar);

  const navigationDropdown = document.createElement("div");
  navigationDropdown.className = "navigation-dropdown";
  navigationButton.before(navigationDropdown);
  navigationDropdown.append(navigationButton, contentsOverlay);
  navigationButton.textContent = "↓ CONTENT";
  const minimapButton = document.querySelector("#minimap-toolbar-button");
  if (minimapButton) minimapButton.textContent = "↓ NAVIGATION";
  const minimapTitle = document.querySelector("#minimap-panel .minimap-header strong");
  if (minimapTitle) minimapTitle.textContent = "";

  const publicationTitle = document.createElement("span");
  publicationTitle.className = "publication-title";
  const titleText = document.createElement("span");
  titleText.className = "publication-title-text";
  titleText.textContent = "Spatial Computing Lab map";
  const titleMetadata = document.createElement("span");
  titleMetadata.className = "publication-title-metadata";
  const lastEdited = new Date(document.lastModified);
  const lastEditedDate = Number.isNaN(lastEdited.getTime()) ? new Date() : lastEdited;
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(lastEditedDate);
  titleMetadata.textContent = `[last edited: ${formattedDate} by Jan Duerinck]`;
  publicationTitle.append(titleText, titleMetadata);
  navigationDropdown.after(publicationTitle);
  if (minimapButton) minimapButton.textContent = "↓ NAVIGATION";
  contentsPanel.querySelector(".contents-header")?.remove();
  contentsPanel.querySelectorAll(".contents-section").forEach((section) => {
    section.querySelectorAll("h3").forEach((heading) => heading.remove());
  });
  contentsPanel.querySelectorAll('.contents-item[data-contents-kind="canvas"]').forEach((item) => {
    item.closest(".contents-section")?.remove();
  });
  contentsPanel.querySelectorAll(".contents-link").forEach((link) => {
    link.classList.remove("is-current");
    link.removeAttribute("aria-current");
  });
  contentsPanel.querySelectorAll(".contents-section").forEach((section) => {
    section.replaceWith(...section.childNodes);
  });

  navigationButton.setAttribute("aria-haspopup", "true");
  const syncExpandedState = () => {
    navigationButton.setAttribute("aria-expanded", String(!contentsOverlay.hidden));
  };
  new MutationObserver(syncExpandedState).observe(contentsOverlay, { attributes: true, attributeFilter: ["hidden"] });
  syncExpandedState();

  document.addEventListener("click", (event) => {
    if (contentsOverlay.hidden || navigationDropdown.contains(event.target)) return;
    window.closeContents?.();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !contentsOverlay.hidden) {
      window.closeContents?.();
      navigationButton.focus();
    }
  });

  const zoomViewport = document.querySelector(".viewport");
  const zoomCanvas = document.querySelector("#canvas");
  const originalZoomBy = window.zoomBy;
  const originalResetZoom = window.resetZoom;
  if (!zoomViewport || !zoomCanvas || typeof originalZoomBy !== "function") return;
  zoomViewport.append(themeButton, reloadButton);
  const canvasExtent = document.createElement("div");
  canvasExtent.className = "canvas-extent";
  zoomCanvas.before(canvasExtent);
  canvasExtent.append(zoomCanvas);
  zoomCanvas.style.position = "absolute";
  zoomCanvas.style.left = "0";
  zoomCanvas.style.top = "0";
  zoomCanvas.style.margin = "0";

  const boundsForVisibleNodes = () => {
    const nodes = [...zoomCanvas.querySelectorAll(".node[data-canvas-left]")]
      .filter((node) => getComputedStyle(node).display !== "none");
    const bounds = nodes.map((node) => ({
      left: Number(node.dataset.canvasLeft),
      top: Number(node.dataset.canvasTop),
      right: Number(node.dataset.canvasLeft) + Number(node.dataset.canvasWidth),
      bottom: Number(node.dataset.canvasTop) + Number(node.dataset.canvasHeight),
    }));
    if (!bounds.length) {
      return {
        left: 0,
        top: 0,
        right: zoomCanvas.offsetWidth,
        bottom: zoomCanvas.offsetHeight,
        width: zoomCanvas.offsetWidth,
        height: zoomCanvas.offsetHeight,
      };
    }
    const left = Math.min(...bounds.map((bound) => bound.left));
    const top = Math.min(...bounds.map((bound) => bound.top));
    const right = Math.max(...bounds.map((bound) => bound.right));
    const bottom = Math.max(...bounds.map((bound) => bound.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };
  const zoomLimits = () => {
    const bounds = boundsForVisibleNodes();
    const availableWidth = Math.max(100, zoomViewport.clientWidth - 64);
    const availableHeight = Math.max(100, zoomViewport.clientHeight - 64);
    const fitScale = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
    const maxScale = Math.max(focusedNodeScale, Math.min(1.1, Math.max(0.95, fitScale * 1.8)));
    const preferredMinScale = zoomViewport.clientWidth <= 760 ? 0.12 : 0.35;
    const minScale = Math.min(preferredMinScale, fitScale);
    return { minScale: Math.min(minScale, maxScale), maxScale };
  };
  const readCanvasMatrix = () => new DOMMatrixReadOnly(getComputedStyle(zoomCanvas).transform);
  const readCanvasScale = () => {
    const matrix = readCanvasMatrix();
    return Math.hypot(matrix.a, matrix.b);
  };
  const readTargetScale = () => {
    const transformScale = zoomCanvas.style.transform.match(/scale\(([\d.]+)\)/);
    return transformScale ? Number(transformScale[1]) : readCanvasScale();
  };
  let targetScale = readTargetScale();
  let focusedNodeScale = 0;
  let focusedNode = null;
  const initialFitBounds = boundsForVisibleNodes();
  const initialFitScale = Math.max(
    zoomViewport.clientWidth <= 760 ? 0.12 : 0.08,
    Math.min(
      1,
      (zoomViewport.clientWidth - 64) / initialFitBounds.width,
      (zoomViewport.clientHeight - 96) / initialFitBounds.height,
    ),
  );
  let fitToViewport = Math.abs(targetScale - initialFitScale) < 0.015;
  zoomCanvas.style.transform = `scale(${targetScale})`;
  zoomCanvas.querySelectorAll(".node[data-node-id]").forEach((node) => {
    const title = node.querySelector(".md-card-title")?.textContent?.trim();
    if (title) node.setAttribute("data-overview-title", title);
  });
  const updateCanvasExtent = (scale = targetScale) => {
    canvasExtent.style.width = `${zoomCanvas.offsetWidth * scale}px`;
    canvasExtent.style.height = `${zoomCanvas.offsetHeight * scale}px`;
  };
  updateCanvasExtent();
  const refreshMinimap = () => {
    zoomViewport.dispatchEvent(new Event("scroll"));
  };
  let zoomAnimationFrame = 0;
  const cancelZoomAnimation = () => {
    if (!zoomAnimationFrame) return;
    cancelAnimationFrame(zoomAnimationFrame);
    zoomAnimationFrame = 0;
  };
  const setRenderedScale = (scale) => {
    targetScale = scale;
    zoomCanvas.style.transform = `scale(${scale})`;
    zoomCanvas.style.setProperty("--canvas-scale", String(scale));
    document.body.classList.toggle("canvas-overview", scale <= 0.26);
    updateCanvasExtent(scale);
  };
  setRenderedScale(targetScale);

  const setScaleAtWorldPoint = (nextScale, worldPoint, anchor, immediate = false) => {
    cancelZoomAnimation();
    const previousTargetScale = targetScale;
    const viewportRect = zoomViewport.getBoundingClientRect();
    const canvasRect = zoomCanvas.getBoundingClientRect();
    const matrix = readCanvasMatrix();
    const originX = canvasRect.left - viewportRect.left - zoomViewport.clientLeft
      + zoomViewport.scrollLeft - matrix.e;
    const originY = canvasRect.top - viewportRect.top - zoomViewport.clientTop
      + zoomViewport.scrollTop - matrix.f;
    const anchorX = anchor.x - viewportRect.left - zoomViewport.clientLeft;
    const anchorY = anchor.y - viewportRect.top - zoomViewport.clientTop;
    const startTime = performance.now();
    const duration = immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 120;
    let appliedScale = previousTargetScale;
    const renderFrame = (time) => {
      const progress = duration === 0 ? 1 : Math.min(1, (time - startTime) / duration);
      const easedProgress = 1 - (1 - progress) ** 3;
      const scale = previousTargetScale + (nextScale - previousTargetScale) * easedProgress;
      originalZoomBy(scale / appliedScale);
      appliedScale = scale;
      setRenderedScale(scale);
      zoomViewport.scrollLeft = Math.max(0, Math.min(
        zoomViewport.scrollWidth - zoomViewport.clientWidth,
        originX + worldPoint.x * scale - anchorX,
      ));
      zoomViewport.scrollTop = Math.max(0, Math.min(
        zoomViewport.scrollHeight - zoomViewport.clientHeight,
        originY + worldPoint.y * scale - anchorY,
      ));
      refreshMinimap();
      if (progress < 1) {
        zoomAnimationFrame = requestAnimationFrame(renderFrame);
      } else {
        zoomAnimationFrame = 0;
      }
    };
    if (duration === 0) renderFrame(startTime);
    else zoomAnimationFrame = requestAnimationFrame(renderFrame);
  };
  window.zoomBy = (factor, anchor, immediate = false, preserveFit = false) => {
    if (!preserveFit) fitToViewport = false;
    const rect = zoomCanvas.getBoundingClientRect();
    const viewportRect = zoomViewport.getBoundingClientRect();
    const matrix = readCanvasMatrix();
    const visualScale = Math.hypot(matrix.a, matrix.b);
    targetScale = readTargetScale();
    const limits = zoomLimits();
    const nextScale = Math.max(limits.minScale, Math.min(limits.maxScale, targetScale * factor));
    if (Math.abs(nextScale - targetScale) < 0.0001) return;

    const pointX = anchor?.x ?? viewportRect.left + viewportRect.width / 2;
    const pointY = anchor?.y ?? viewportRect.top + viewportRect.height / 2;
    const anchorWorld = { x: (pointX - rect.left) / visualScale, y: (pointY - rect.top) / visualScale };
    setScaleAtWorldPoint(nextScale, anchorWorld, { x: pointX, y: pointY }, immediate);
  };

  let activeCanvasPinch = null;
  const touchDistance = (touches) => Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
  const touchMidpoint = (touches) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });
  zoomViewport.addEventListener("touchstart", (event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
    activeCanvasPinch = {
      distance: touchDistance(event.touches),
    };
  }, { passive: false });
  zoomViewport.addEventListener("touchmove", (event) => {
    if (event.touches.length < 2) {
      activeCanvasPinch = null;
      return;
    }
    event.preventDefault();
    const distance = touchDistance(event.touches);
    const anchor = touchMidpoint(event.touches);
    if (activeCanvasPinch && activeCanvasPinch.distance > 0 && distance > 0) {
      window.zoomBy(distance / activeCanvasPinch.distance, anchor, true);
    }
    activeCanvasPinch = { distance };
  }, { passive: false });
  const endCanvasPinch = (event) => {
    if (event.touches.length < 2) activeCanvasPinch = null;
  };
  zoomViewport.addEventListener("touchend", endCanvasPinch, { passive: true });
  zoomViewport.addEventListener("touchcancel", endCanvasPinch, { passive: true });

  const nodeForLink = (link) => {
    let path;
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.toLowerCase().endsWith(".html")) return null;
      path = url.pathname;
    } catch {
      return null;
    }
    return [...zoomCanvas.querySelectorAll(".node")].find((node) => {
      const titleLink = node.querySelector(".md-card-title-link[href]");
      if (!titleLink) return false;
      try {
        return new URL(titleLink.href, window.location.href).pathname === path;
      } catch {
        return false;
      }
    }) || null;
  };
  const zoomToNode = (node) => {
    if (!node) return;
    if (getComputedStyle(node).display === "none") {
      window.expandAllBranches?.();
      requestAnimationFrame(() => zoomToNode(node));
      return;
    }
    const bounds = {
      left: Number(node.dataset.canvasLeft),
      top: Number(node.dataset.canvasTop),
      width: Number(node.dataset.canvasWidth),
      height: Number(node.dataset.canvasHeight),
    };
    const center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    const scale = Math.max(0.2, Math.min(
      (zoomViewport.clientWidth - 64) / bounds.width,
      (zoomViewport.clientHeight - 96) / bounds.height,
      2.25,
    ));
    const viewportRect = zoomViewport.getBoundingClientRect();
    const centerClient = {
      x: viewportRect.left + zoomViewport.clientLeft + zoomViewport.clientWidth / 2,
      y: viewportRect.top + zoomViewport.clientTop + zoomViewport.clientHeight / 2,
    };
    focusedNodeScale = scale;
    focusedNode = node;
    fitToViewport = false;
    setScaleAtWorldPoint(scale, center, centerClient);
    window.closeContents?.();
  };
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (Date.now() <= (window.__canvasSuppressClickUntil || 0)) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (document.body.classList.contains("canvas-overview")) {
      const overviewNode = event.target.closest(".node[data-node-id]");
      if (overviewNode) {
        event.preventDefault();
        event.stopPropagation();
        zoomToNode(overviewNode);
        return;
      }
    }
    const link = event.target.closest("a[href]");
    if (!link) return;
    const node = nodeForLink(link);
    if (!node) return;
    event.preventDefault();
    event.stopPropagation();
    zoomToNode(node);
  }, true);

  zoomViewport.addEventListener("wheel", (event) => {
    if (!event.shiftKey) return;
    const horizontalDelta = event.deltaX || event.deltaY;
    if (!horizontalDelta) return;
    event.preventDefault();
    zoomViewport.scrollLeft += horizontalDelta;
  }, { passive: false, capture: true });

  zoomViewport.addEventListener("wheel", (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? zoomViewport.clientHeight : 1);
    window.zoomBy(Math.exp(-delta * 0.002), { x: event.clientX, y: event.clientY });
  }, { passive: false });

  zoomViewport.addEventListener("pointerdown", (event) => {
    if (event.target !== zoomViewport) return;
    const rect = zoomViewport.getBoundingClientRect();
    if (
      event.clientX >= rect.left + zoomViewport.clientWidth - 16
      || event.clientY >= rect.top + zoomViewport.clientHeight - 16
    ) cancelZoomAnimation();
  }, true);

  const limits = zoomLimits();
  if (targetScale < limits.minScale || targetScale > limits.maxScale) {
    window.zoomBy(limits.minScale / targetScale, {
      x: zoomViewport.getBoundingClientRect().left + zoomViewport.clientWidth / 2,
      y: zoomViewport.getBoundingClientRect().top + zoomViewport.clientHeight / 2,
    });
  }
  if (typeof originalResetZoom === "function") {
    window.resetZoom = () => {
      fitToViewport = true;
      focusedNodeScale = 0;
      focusedNode = null;
      const bounds = boundsForVisibleNodes();
      const minimumScale = zoomViewport.clientWidth <= 760 ? 0.12 : 0.08;
      const scale = Math.max(minimumScale, Math.min(
        1,
        (zoomViewport.clientWidth - 64) / bounds.width,
        (zoomViewport.clientHeight - 96) / bounds.height,
      ));
      const center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      const viewportRect = zoomViewport.getBoundingClientRect();
      const anchor = {
        x: viewportRect.left + zoomViewport.clientLeft + zoomViewport.clientWidth / 2,
        y: viewportRect.top + zoomViewport.clientTop + zoomViewport.clientHeight / 2,
      };
      setScaleAtWorldPoint(scale, center, anchor);
    };
  }
  let previousViewportWidth = zoomViewport.getBoundingClientRect().width;
  let previousViewportHeight = zoomViewport.getBoundingClientRect().height;
  const resizeObserver = new ResizeObserver(() => {
    const viewportRect = zoomViewport.getBoundingClientRect();
    const nextWidth = viewportRect.width;
    const nextHeight = viewportRect.height;
    const clientWidth = zoomViewport.clientWidth;
    const widthRatio = nextWidth / Math.max(1, previousViewportWidth);
    const heightRatio = nextHeight / Math.max(1, previousViewportHeight);
    previousViewportWidth = nextWidth;
    previousViewportHeight = nextHeight;
    if (widthRatio === 1 && heightRatio === 1) return;
    if (focusedNode) {
      const bounds = {
        left: Number(focusedNode.dataset.canvasLeft),
        top: Number(focusedNode.dataset.canvasTop),
        width: Number(focusedNode.dataset.canvasWidth),
        height: Number(focusedNode.dataset.canvasHeight),
      };
      const scale = Math.max(0.2, Math.min(
        (zoomViewport.clientWidth - 64) / bounds.width,
        (zoomViewport.clientHeight - 96) / bounds.height,
        2.25,
      ));
      focusedNodeScale = scale;
      setScaleAtWorldPoint(
        scale,
        { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 },
        {
          x: viewportRect.left + zoomViewport.clientLeft + zoomViewport.clientWidth / 2,
          y: viewportRect.top + zoomViewport.clientTop + zoomViewport.clientHeight / 2,
        },
        true,
      );
      return;
    }
    const limits = zoomLimits();
    if (fitToViewport) {
      const bounds = boundsForVisibleNodes();
      const fitScale = Math.max(
        limits.minScale,
        Math.min(
          limits.maxScale,
          1,
          (zoomViewport.clientWidth - 64) / bounds.width,
          (zoomViewport.clientHeight - 96) / bounds.height,
        ),
      );
      setScaleAtWorldPoint(
        fitScale,
        { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 },
        {
          x: viewportRect.left + zoomViewport.clientLeft + zoomViewport.clientWidth / 2,
          y: viewportRect.top + zoomViewport.clientTop + zoomViewport.clientHeight / 2,
        },
        true,
      );
      return;
    }
    const resizeFactor = Math.min(widthRatio, heightRatio);
    window.zoomBy(resizeFactor, {
      x: viewportRect.left + zoomViewport.clientLeft + clientWidth / 2,
      y: viewportRect.top + zoomViewport.clientTop + zoomViewport.clientHeight / 2,
    }, true, true);
  });
  resizeObserver.observe(zoomViewport);
})();
