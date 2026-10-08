(() => {
  const navigationButton = document.querySelector("#contents-toolbar-button");
  const contentsOverlay = document.querySelector("#contents-overlay");
  const contentsPanel = document.querySelector("#contents-panel");
  if (!navigationButton || !contentsOverlay || !contentsPanel) return;

  const toolbar = document.querySelector(".toolbar");
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
    if (event.clientY <= 24) {
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
    const fitScale = Math.max(availableWidth / bounds.width, availableHeight / bounds.height);
    const maxScale = Math.max(focusedNodeScale, Math.min(1.1, Math.max(0.95, fitScale * 1.8)));
    return { minScale: Math.min(0.35, maxScale), maxScale };
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
  zoomCanvas.style.transform = `translate(0px, 0px) scale(${targetScale})`;
  const updateCanvasExtent = (scale = targetScale) => {
    canvasExtent.style.width = `${zoomCanvas.offsetWidth * scale}px`;
    canvasExtent.style.height = `${zoomCanvas.offsetHeight * scale}px`;
  };
  updateCanvasExtent();
  let clampingScroll = false;
  let refreshingMinimap = false;
  const refreshMinimap = () => {
    refreshingMinimap = true;
    zoomViewport.dispatchEvent(new Event("scroll"));
    refreshingMinimap = false;
  };
  const constrainViewportScroll = () => {
    if (clampingScroll || refreshingMinimap) return;
    const bounds = boundsForVisibleNodes();
    const viewportRect = zoomViewport.getBoundingClientRect();
    const canvasRect = zoomCanvas.getBoundingClientRect();
    const matrix = readCanvasMatrix();
    const scale = Math.hypot(matrix.a, matrix.b);
    const originX = canvasRect.left - viewportRect.left + zoomViewport.scrollLeft - matrix.e;
    const originY = canvasRect.top - viewportRect.top + zoomViewport.scrollTop - matrix.f;
    const margin = 96;
    const maxLeft = zoomViewport.scrollWidth - zoomViewport.clientWidth;
    const maxTop = zoomViewport.scrollHeight - zoomViewport.clientHeight;
    const minAllowedLeft = originX + bounds.left * scale - margin;
    const maxAllowedLeft = originX + bounds.right * scale - zoomViewport.clientWidth + margin;
    const minAllowedTop = originY + bounds.top * scale - margin;
    const maxAllowedTop = originY + bounds.bottom * scale - zoomViewport.clientHeight + margin;
    const minLeft = Math.min(maxLeft, Math.max(0, minAllowedLeft));
    const maxLeftValue = Math.max(minLeft, Math.min(maxLeft, maxAllowedLeft));
    const minTop = Math.min(maxTop, Math.max(0, minAllowedTop));
    const maxTopValue = Math.max(minTop, Math.min(maxTop, maxAllowedTop));
    const left = Math.min(maxLeftValue, Math.max(minLeft, zoomViewport.scrollLeft));
    const top = Math.min(maxTopValue, Math.max(minTop, zoomViewport.scrollTop));
    if (left === zoomViewport.scrollLeft && top === zoomViewport.scrollTop) return;
    clampingScroll = true;
    zoomViewport.scrollLeft = left;
    zoomViewport.scrollTop = top;
    clampingScroll = false;
  };
  zoomViewport.addEventListener("scroll", constrainViewportScroll, { passive: true });
  zoomCanvas.addEventListener("transitionend", (event) => {
    if (event.target === zoomCanvas && event.propertyName === "transform") {
      refreshMinimap();
    }
  });

  window.zoomBy = (factor, anchor) => {
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
    const nextTranslateX = matrix.e + anchorWorld.x * (visualScale - nextScale);
    const nextTranslateY = matrix.f + anchorWorld.y * (visualScale - nextScale);
    const previousTargetScale = targetScale;
    targetScale = nextScale;
    originalZoomBy(nextScale / previousTargetScale);
    zoomCanvas.style.transform = `translate(${nextTranslateX}px, ${nextTranslateY}px) scale(${nextScale})`;
    updateCanvasExtent(nextScale);
    refreshMinimap();
  };

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
    const scale = Math.min(
      (zoomViewport.clientWidth - 64) / bounds.width,
      (zoomViewport.clientHeight - 64) / bounds.height,
      4,
    );
    const rect = zoomCanvas.getBoundingClientRect();
    const viewportRect = zoomViewport.getBoundingClientRect();
    const matrix = readCanvasMatrix();
    const currentVisualScale = Math.hypot(matrix.a, matrix.b);
    const centerClient = {
      x: viewportRect.left + zoomViewport.clientWidth / 2,
      y: viewportRect.top + zoomViewport.clientHeight / 2,
    };
    const targetTranslateX = matrix.e + centerClient.x - (rect.left + center.x * currentVisualScale)
      + center.x * (currentVisualScale - scale);
    const targetTranslateY = matrix.f + centerClient.y - (rect.top + center.y * currentVisualScale)
      + center.y * (currentVisualScale - scale);
    const previousTargetScale = targetScale;
    focusedNodeScale = scale;
    targetScale = scale;
    originalZoomBy(scale / previousTargetScale);
    zoomCanvas.style.transform = `translate(${targetTranslateX}px, ${targetTranslateY}px) scale(${scale})`;
    updateCanvasExtent(scale);
    refreshMinimap();
    window.closeContents?.();
  };
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (Date.now() <= (window.__canvasSuppressClickUntil || 0)) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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

  const limits = zoomLimits();
  if (targetScale < limits.minScale || targetScale > limits.maxScale) {
    window.zoomBy(limits.minScale / targetScale, {
      x: zoomViewport.getBoundingClientRect().left + zoomViewport.clientWidth / 2,
      y: zoomViewport.getBoundingClientRect().top + zoomViewport.clientHeight / 2,
    });
  }
  if (typeof originalResetZoom === "function") {
    window.resetZoom = () => {
      focusedNodeScale = 0;
      originalResetZoom();
      targetScale = readTargetScale();
      zoomCanvas.style.transform = `translate(0px, 0px) scale(${targetScale})`;
      updateCanvasExtent(targetScale);
      const updatedLimits = zoomLimits();
      const nextScale = Math.max(updatedLimits.minScale, Math.min(updatedLimits.maxScale, targetScale));
      if (Math.abs(nextScale - targetScale) >= 0.0001) {
        const viewportRect = zoomViewport.getBoundingClientRect();
        const center = { x: viewportRect.left + viewportRect.width / 2, y: viewportRect.top + viewportRect.height / 2 };
        window.zoomBy(nextScale / targetScale, center);
      } else {
        refreshMinimap();
      }
    };
  }
})();
