(() => {
  const modelNode = document.querySelector("#node-ca93d4f84581e0a4");
  const modelContent = modelNode?.querySelector(".node-content");
  const modelLink = modelContent?.querySelector('a[href*="lab-3d-viewer.html"]');
  if (modelNode && modelContent && modelLink) {
    const exportedModelUrl = new URL(modelLink.getAttribute("href"), document.baseURI);
    const customModelUrl = new URL("024_lab-3d-viewer.html", exportedModelUrl);
    const previewUrl = new URL(customModelUrl);
    previewUrl.searchParams.set("preview", "1");
    const openLink = modelLink.cloneNode(true);
    openLink.className = "model-preview-link";
    openLink.textContent = "Open interactive model ↗";
    openLink.href = customModelUrl.href;
    const previewFrame = document.createElement("iframe");
    previewFrame.className = "model-preview-frame";
    previewFrame.title = "Orbitable Spatial Computing Lab 3D model";
    previewFrame.loading = "lazy";
    previewFrame.src = previewUrl.href;
    modelContent.replaceChildren(openLink, previewFrame);
    modelNode.classList.add("model-preview-node", "overview-orbit-node");
  }

  const navigationButton = document.querySelector("#contents-toolbar-button");
  const contentsOverlay = document.querySelector("#contents-overlay");
  const contentsPanel = document.querySelector("#contents-panel");
  if (!navigationButton || !contentsOverlay || !contentsPanel) return;
  const contentsNavigation = contentsPanel.querySelector(".contents-navigation");
  const contentsPageLinks = [...contentsPanel.querySelectorAll(".contents-link[href]")];

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
    document.body.classList.remove("groups-flipped");
    localStorage.setItem("spatial-lab-theme", document.body.classList.contains("theme-night") ? "night" : "day");
    syncThemeButton();
  });
  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.id = "mobile-reload-button";
  reloadButton.className = "mobile-reload-button";
  reloadButton.setAttribute("aria-label", "Reframe canvas");
  reloadButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5"></path><path d="M19 12a7 7 0 1 1-2.05-4.95L20 12"></path></svg>';
  reloadButton.addEventListener("click", () => window.reframeCanvas?.());
  const controlGuide = document.createElement("div");
  controlGuide.className = "canvas-controls-guide";
  controlGuide.setAttribute("role", "note");
  controlGuide.setAttribute("aria-label", "Canvas controls");
  const controlGuideTrack = document.createElement("div");
  controlGuideTrack.className = "canvas-controls-guide-track";
  const controlGuideItems = [
    ["touch", "drag or two-finger scroll: pan"],
    ["touch", "pinch: zoom"],
    ["touch", "reload button: reframe"],
    ["mouse", "click + drag: pan"],
    ["mouse", "scroll: pan"],
    ["mouse", "Ctrl/Cmd + scroll or pinch: zoom"],
    ["mouse", "Shift/Ctrl/Cmd + drag: zoom"],
    ["mouse", "Space: reframe"],
  ];
  for (let copy = 0; copy < 2; copy += 1) {
    const sequence = document.createElement("div");
    sequence.className = "canvas-controls-guide-sequence";
    if (copy) sequence.setAttribute("aria-hidden", "true");
    for (const [kind, text] of controlGuideItems) {
      const item = document.createElement("span");
      item.className = `guide-${kind}`;
      item.textContent = text;
      sequence.append(item);
    }
    controlGuideTrack.append(sequence);
  }
  controlGuide.append(controlGuideTrack);
  const zoomLevelIndicator = document.createElement("output");
  zoomLevelIndicator.className = "zoom-level-indicator";
  zoomLevelIndicator.setAttribute("aria-label", "Current zoom level");
  zoomLevelIndicator.setAttribute("aria-live", "off");
  document.body.append(zoomLevelIndicator);
  const syncZoomIndicatorMenuState = () => {
    zoomLevelIndicator.classList.toggle("is-menu-hidden", toolbar?.classList.contains("is-hidden") || false);
  };
  syncZoomIndicatorMenuState();
  if (toolbar) {
    new MutationObserver(syncZoomIndicatorMenuState).observe(toolbar, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

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
  const minimapPanel = document.querySelector("#minimap-panel");
  if (minimapButton) minimapButton.textContent = "↓ NAVIGATION";
  const externalLinksDropdown = document.createElement("div");
  externalLinksDropdown.className = "external-links-dropdown";
  const externalLinksButton = document.createElement("button");
  externalLinksButton.type = "button";
  externalLinksButton.className = "external-links-button";
  externalLinksButton.textContent = "↓ LINKS";
  externalLinksButton.setAttribute("aria-label", "External links");
  externalLinksButton.setAttribute("aria-haspopup", "true");
  externalLinksButton.setAttribute("aria-expanded", "false");
  const externalLinksPanel = document.createElement("div");
  externalLinksPanel.className = "external-links-panel";
  externalLinksPanel.hidden = true;
  const externalLinksHeading = document.createElement("strong");
  externalLinksHeading.className = "external-links-heading";
  externalLinksHeading.textContent = "EXTERNAL LINKS";
  const externalLinksList = document.createElement("ul");
  externalLinksList.className = "external-links-list";
  const externalLinksByUrl = new Map();
  for (const link of document.querySelectorAll("#canvas .node-content a[href]")) {
    let url;
    try {
      url = new URL(link.getAttribute("href"), document.baseURI);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(url.protocol) || url.origin === window.location.origin) continue;
    url.hash = "";
    const href = url.href;
    if (externalLinksByUrl.has(href)) continue;
    const text = link.textContent.trim();
    externalLinksByUrl.set(href, text && !/^https?:\/\//i.test(text) ? text : url.hostname.replace(/^www\./, ""));
  }
  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  const institutionHosts = [
    "luca-arts.be", "filmeu.eu", "wire.filmeu.eu", "ulusofona.pt", "tlu.ee",
    "cordacampus.com", "corda-arena.com", "wintercircus.be", "imec-int.com",
    "imec.be", "vlaio.be", "zhdk.ch", "researchcatalogue.net"
  ];
  const hostOf = (href) => new URL(href).hostname.replace(/^www\./, "");
  const matchesHost = (href, hosts) => hosts.some((h) => hostOf(href) === h || hostOf(href).endsWith(`.${h}`));
  const sorted = [...externalLinksByUrl].sort((x, y) => collator.compare(x[1], y[1]));
  const github = sorted.filter(([href]) => matchesHost(href, ["github.com"]));
  const institutions = sorted.filter(([href]) => matchesHost(href, institutionHosts));
  const rest = sorted.filter(([href]) => !matchesHost(href, ["github.com", ...institutionHosts]));
  const addLink = (href, text, spaced) => {
    const item = document.createElement("li");
    if (spaced) item.className = "external-links-block-end";
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    link.title = href;
    item.append(link);
    externalLinksList.append(item);
  };
  const addBlock = (entries) => {
    entries.forEach(([href, text], index) => addLink(href, text, index === entries.length - 1));
  };
  addBlock(github);
  addBlock(institutions);
  let currentLetter = "";
  for (const [href, text] of rest) {
    const letter = text.trim().charAt(0).toUpperCase() || "#";
    if (letter !== currentLetter) {
      currentLetter = letter;
      const heading = document.createElement("li");
      heading.className = "external-links-subtitle";
      heading.textContent = letter;
      externalLinksList.append(heading);
    }
    addLink(href, text, false);
  }
  externalLinksPanel.append(externalLinksHeading, externalLinksList);
  externalLinksDropdown.append(externalLinksButton, externalLinksPanel);
  minimapButton?.after(externalLinksDropdown);
  if (minimapButton) minimapButton.style.order = "-3";
  externalLinksDropdown.style.order = "-2";
  document.querySelector("#search-toolbar-button")?.style.setProperty("order", "-1");
  const syncExternalLinksState = () => {
    const isOpen = !externalLinksPanel.hidden;
    externalLinksButton.textContent = `${isOpen ? "↑" : "↓"} LINKS`;
    externalLinksButton.setAttribute("aria-expanded", String(isOpen));
  };
  externalLinksButton.addEventListener("click", () => {
    externalLinksPanel.hidden = !externalLinksPanel.hidden;
    if (!externalLinksPanel.hidden) window.closeContents?.();
    syncExternalLinksState();
  });
  document.addEventListener("click", (event) => {
    if (!externalLinksPanel.hidden && !externalLinksDropdown.contains(event.target)) {
      externalLinksPanel.hidden = true;
      syncExternalLinksState();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || externalLinksPanel.hidden) return;
    externalLinksPanel.hidden = true;
    syncExternalLinksState();
    externalLinksButton.focus();
  });
  const minimapTitle = document.querySelector("#minimap-panel .minimap-header strong");
  if (minimapTitle) minimapTitle.textContent = "NAVIGATION";
  const minimapDragHandle = document.querySelector("#minimap-drag-handle");
  if (minimapPanel && minimapDragHandle) {
    const edgeHandle = document.createElement("div");
    edgeHandle.className = "minimap-edge-handle";
    minimapPanel.prepend(edgeHandle);
    edgeHandle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      minimapDragHandle.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        button: event.button,
        clientX: event.clientX,
        clientY: event.clientY,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
      }));
    });
  }

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
  contentsPanel.querySelectorAll(".contents-link").forEach((link) => {
    link.classList.remove("is-current");
    link.removeAttribute("aria-current");
  });
  contentsNavigation?.replaceChildren();

  navigationButton.setAttribute("aria-haspopup", "true");
  const syncExpandedState = () => {
    const isOpen = !contentsOverlay.hidden;
    navigationButton.setAttribute("aria-expanded", String(isOpen));
    navigationButton.textContent = `${isOpen ? "↑" : "↓"} CONTENT`;
  };
  new MutationObserver(syncExpandedState).observe(contentsOverlay, { attributes: true, attributeFilter: ["hidden"] });
  syncExpandedState();
  if (minimapButton && minimapPanel) {
    const syncMinimapState = () => {
      const isOpen = minimapPanel && !minimapPanel.hidden;
      minimapButton.textContent = `${isOpen ? "↑" : "↓"} NAVIGATION`;
      minimapButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
    };
    new MutationObserver(syncMinimapState).observe(minimapPanel, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    syncMinimapState();
  }

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
  zoomViewport.append(themeButton, reloadButton, controlGuide);
  const mainMapNode = [...zoomCanvas.querySelectorAll(".node[data-node-id]")].find((node) =>
    node.querySelector(".md-card-title-link")?.textContent?.trim().toLowerCase()
      === "abstract spatial computing lab",
  );
  const groupNodes = [...zoomCanvas.querySelectorAll(".node.group[data-node-id]")];
  for (const node of zoomCanvas.querySelectorAll(".node:not(.group)")) {
    const heading = node.querySelector(".node-content h1, .node-content h2, .node-content h3");
    if (!heading?.textContent?.trim().toLowerCase().startsWith("comments on ")) continue;
    node.classList.add("overview-comment-node");
  }
  const translucentFill = /rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*0?\.[0-2]\d*\)/g;
  for (const node of zoomCanvas.querySelectorAll(".node:not(.group)")) {
    for (const property of ["background", "--node-background-color"]) {
      const value = node.style.getPropertyValue(property);
      if (translucentFill.test(value)) {
        translucentFill.lastIndex = 0;
        node.style.setProperty(property, value.replace(translucentFill, "rgb($1, $2, $3)"));
      }
      translucentFill.lastIndex = 0;
    }
  }
  for (const node of zoomCanvas.querySelectorAll(".node.text:not(.overview-comment-node)")) {
    if (node.querySelector(".md-card-title")) continue;
    const walker = document.createTreeWalker(node.querySelector(".node-content") || node, NodeFilter.SHOW_TEXT);
    let first = "";
    while (!first && walker.nextNode()) first = walker.currentNode.textContent.replace(/\s+/g, " ").trim();
    if (first) node.setAttribute("data-overview-title", first);
  }
  for (const node of zoomCanvas.querySelectorAll(".overview-comment-node, .overview-orbit-node")) {
    const icon = document.createElement("span");
    icon.className = "overview-node-icon";
    icon.setAttribute("aria-hidden", "true");
    const nodeHeight = Number(node.dataset.canvasHeight);
    icon.style.setProperty("--overview-icon-size", `${nodeHeight * 0.75}px`);
    if (node.classList.contains("overview-comment-node")) {
      icon.classList.add("overview-question-icon");
      icon.style.setProperty("--overview-question-size", `${nodeHeight}px`);
      icon.textContent = "?";
    } else {
      icon.classList.add("overview-world-icon");
      icon.innerHTML = '<svg viewBox="0 0 100 100" focusable="false"><circle cx="50" cy="50" r="25"></circle><ellipse cx="50" cy="50" rx="43" ry="15" transform="rotate(-28 50 50)"></ellipse><path d="M29 37c12 5 30 5 42 0M27 61c14-6 32-6 46 0M50 25c-8 8-12 17-12 25s4 17 12 25m0-50c8 8 12 17 12 25s-4 17-12 25"></path></svg>';
    }
    node.append(icon);
  }
  const groupChannels = (node) => {
    const raw = getComputedStyle(node).getPropertyValue("--node-border-color").trim();
    const hex = raw.match(/^#([0-9a-f]{6})/i);
    if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
    return getComputedStyle(node).borderTopColor.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  };
  for (const node of groupNodes) {
    const channels = groupChannels(node);
    if (channels && channels.join() === "170,181,196") {
      node.classList.add("neutral-gray-group", "group-shape-oval");
      zoomCanvas
        .querySelector(`.group-title[data-group-title-node-id="${CSS.escape(node.dataset.nodeId)}"]`)
        ?.classList.add("neutral-gray-group-title");
    }
  }
  for (const node of groupNodes) {
    const channels = groupChannels(node);
    if (!channels || channels.length < 3) continue;
    const luminance = (0.299 * channels[0] + 0.587 * channels[1] + 0.114 * channels[2]) / 255;
    if (luminance < 0.8) continue;
    zoomCanvas
      .querySelector(`.group-title[data-group-title-node-id="${CSS.escape(node.dataset.nodeId)}"]`)
      ?.classList.add("light-group-title");
  }
  zoomCanvas.querySelectorAll(".group-title-text").forEach((title) => {
    title.title = "Double-click to toggle the shape of groups with this color";
  });
  if (mainMapNode) {
    const size = Math.min(Number(mainMapNode.dataset.canvasWidth), Number(mainMapNode.dataset.canvasHeight));
    const inset = (Number(mainMapNode.dataset.canvasWidth) - size) / 2;
    mainMapNode.classList.add("main-map-node");
    mainMapNode.style.setProperty("--main-node-circle-size", `${size}px`);
    mainMapNode.style.setProperty(
      "--main-node-circle-left",
      `${Number(mainMapNode.dataset.canvasLeft) + inset}px`,
    );
  }
  const originalNodePositions = new Map(
    [...zoomCanvas.querySelectorAll(".node[data-node-id]")].map((node) => [
      node.getAttribute("data-node-id"),
      {
        left: Number(node.getAttribute("data-canvas-left") || 0),
        top: Number(node.getAttribute("data-canvas-top") || 0),
      },
    ]),
  );
  const nodePositionStorageKey = `spatial-lab-node-positions:${location.pathname}`;
  const applyNodePositions = (positions) => {
    for (const node of zoomCanvas.querySelectorAll(".node[data-node-id]")) {
      const position = positions.get(node.getAttribute("data-node-id"));
      if (!position) continue;
      node.setAttribute("data-canvas-left", String(position.left));
      node.setAttribute("data-canvas-top", String(position.top));
      node.style.left = `${position.left}px`;
      node.style.top = `${position.top}px`;
      const minimapNode = document.querySelector(
        `.minimap-node[data-node-id="${node.getAttribute("data-node-id")}"]`,
      );
      if (minimapNode) {
        minimapNode.setAttribute("x", String(position.left));
        minimapNode.setAttribute("y", String(position.top));
      }
    }
    window.drawCanvasEdges?.();
    zoomViewport.dispatchEvent(new Event("scroll"));
  };
  let storedNodePositions = {};
  const storedNodePositionsJson = localStorage.getItem(nodePositionStorageKey);
  if (storedNodePositionsJson) {
    try {
      storedNodePositions = JSON.parse(storedNodePositionsJson);
    } catch (error) {
      console.warn("Ignoring invalid saved Canvas node positions.", error);
      localStorage.removeItem(nodePositionStorageKey);
    }
  }
  if (storedNodePositions && typeof storedNodePositions === "object" && !Array.isArray(storedNodePositions)) {
    const validStoredPositions = new Map(
      Object.entries(storedNodePositions).filter(([, position]) =>
        position && Number.isFinite(position.left) && Number.isFinite(position.top)),
    );
    if (validStoredPositions.size) applyNodePositions(validStoredPositions);
  }
  window.storeNodePositions = () => {
    const changedPositions = Object.fromEntries(
      [...zoomCanvas.querySelectorAll(".node[data-node-id]")].flatMap((node) => {
        const id = node.getAttribute("data-node-id");
        const original = originalNodePositions.get(id);
        if (!id || !original) return [];
        const position = {
          left: Number(node.getAttribute("data-canvas-left")),
          top: Number(node.getAttribute("data-canvas-top")),
        };
        if (!Number.isFinite(position.left) || !Number.isFinite(position.top)) return [];
        return position.left === original.left && position.top === original.top
          ? []
          : [[id, position]];
      }),
    );
    if (Object.keys(changedPositions).length) {
      localStorage.setItem(nodePositionStorageKey, JSON.stringify(changedPositions));
    } else {
      localStorage.removeItem(nodePositionStorageKey);
    }
  };
  window.resetNodePositions = () => {
    applyNodePositions(originalNodePositions);
    localStorage.removeItem(nodePositionStorageKey);
  };
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
    const minScale = Math.min(0.19, fitScale * 0.95);
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
  const heightFitScale = (bounds = boundsForVisibleNodes()) =>
    Math.min(1, Math.max(100, zoomViewport.clientHeight - 64) / bounds.height);
  let fitToViewport = true;
  zoomCanvas.style.transform = `scale(${targetScale})`;
  zoomCanvas.querySelectorAll(".node[data-node-id]").forEach((node) => {
    const title = node.querySelector(".md-card-title")?.textContent?.trim();
    if (title) node.setAttribute("data-overview-title", title);
  });
  const viewportContentSize = () => {
    const style = getComputedStyle(zoomViewport);
    return {
      width: Math.max(0, zoomViewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)),
      height: Math.max(0, zoomViewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)),
      left: parseFloat(style.paddingLeft),
      top: parseFloat(style.paddingTop),
    };
  };
  const viewportContentCenter = () => {
    const rect = zoomViewport.getBoundingClientRect();
    const size = viewportContentSize();
    return {
      x: rect.left + zoomViewport.clientLeft + size.left + size.width / 2,
      y: rect.top + zoomViewport.clientTop + size.top + size.height / 2,
    };
  };
  const updateCanvasExtent = (scale = targetScale) => {
    const content = viewportContentSize();
    const scaledWidth = zoomCanvas.offsetWidth * scale;
    const scaledHeight = zoomCanvas.offsetHeight * scale;
    const gutterX = content.width;
    const gutterY = content.height;
    const bounds = boundsForVisibleNodes();
    canvasExtent.style.width = `${Math.max(scaledWidth, content.width) + gutterX * 2}px`;
    canvasExtent.style.height = `${Math.max(scaledHeight, content.height) + gutterY * 2}px`;
    zoomCanvas.style.left = `${gutterX + (scaledWidth < content.width
      ? content.width / 2 - (bounds.left + bounds.width / 2) * scale
      : 0)}px`;
    zoomCanvas.style.top = `${gutterY + (scaledHeight < content.height
      ? content.height / 2 - (bounds.top + bounds.height / 2) * scale
      : 0)}px`;
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
  let lastDetailScale = 0;
  const setRenderedScale = (scale) => {
    targetScale = scale;
    const zoomPercentage = `${Math.round(scale * 100)}%`;
    zoomLevelIndicator.value = zoomPercentage;
    zoomLevelIndicator.textContent = zoomPercentage;
    zoomLevelIndicator.setAttribute("aria-label", `Current zoom level ${zoomPercentage}`);
    zoomCanvas.style.transform = `scale(${scale})`;
    zoomCanvas.style.setProperty("--canvas-scale", String(scale));
    const overviewProgress = Math.round(Math.max(0, Math.min(1, (0.25 - scale) / 0.05)) * 100) / 100;
    const isNight = document.body.classList.contains("theme-night");
    const fillStrength = `${isNight ? 44 + overviewProgress * 48 : overviewProgress * 84}%`;
    if (zoomCanvas.style.getPropertyValue("--group-fill-strength") !== fillStrength) {
      zoomCanvas.style.setProperty("--group-fill-strength", fillStrength);
    }
    const detailsChanged = !lastDetailScale || Math.abs(scale - lastDetailScale) / lastDetailScale > 0.02;
    if (detailsChanged) lastDetailScale = scale;
    if (detailsChanged) zoomCanvas.style.setProperty("--canvas-title-size", `${12 + 6 * Math.min(scale, 1)}px`);
    if (detailsChanged) for (const node of zoomCanvas.querySelectorAll(".node[data-overview-title]")) {
      const title = node.getAttribute("data-overview-title") || "";
      const screenWidth = node.offsetWidth * scale;
      const screenHeight = node.offsetHeight * scale;
      const widthFit = (screenWidth - 8) / Math.max(1, title.length * 0.56);
      const labelSize = Math.max(5, Math.min(13, screenHeight * 0.62, widthFit));
      node.style.setProperty("--overview-label-size", `${labelSize}px`);
    }
    if (detailsChanged) for (const title of zoomCanvas.querySelectorAll(".group-title[data-group-title-node-id]")) {
      const node = zoomCanvas.querySelector(`#node-${CSS.escape(title.dataset.groupTitleNodeId)}`);
      const text = title.querySelector(".group-title-text")?.textContent?.trim() || "";
      const availableWidth = Number(node?.dataset.canvasWidth || 0) * scale;
      const widthFit = availableWidth / Math.max(1, text.length * 0.58);
      const titleSize = Math.max(9, Math.min(12 + 6 * Math.min(scale, 1), widthFit));
      title.style.setProperty("--group-title-size", `${titleSize}px`);
    }
    const edgeLabelScale = Math.min(3.75, 1.25 / Math.sqrt(Math.max(scale, 0.01)));
    for (const label of zoomCanvas.querySelectorAll(".edge-label")) {
      const x = Number(label.getAttribute("x"));
      const y = Number(label.getAttribute("y"));
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const background = label.previousElementSibling;
      let centerX = x;
      let centerY = y;
      if (background?.classList.contains("edge-label-background")) {
        const backgroundX = Number(background.getAttribute("x"));
        const backgroundY = Number(background.getAttribute("y"));
        const backgroundWidth = Number(background.getAttribute("width"));
        const backgroundHeight = Number(background.getAttribute("height"));
        if (
          Number.isFinite(backgroundX)
          && Number.isFinite(backgroundY)
          && Number.isFinite(backgroundWidth)
          && Number.isFinite(backgroundHeight)
        ) {
          centerX = backgroundX + backgroundWidth / 2;
          centerY = backgroundY + backgroundHeight / 2;
        }
      }
      const transform = `translate(${centerX} ${centerY}) scale(${edgeLabelScale}) translate(${-centerX} ${-centerY})`;
      label.setAttribute("transform", transform);
      if (background?.classList.contains("edge-label-background")) {
        background.setAttribute("transform", transform);
      }
    }
    const overview = scale <= 0.2;
    if (document.body.classList.contains("canvas-overview") !== overview) {
      document.body.classList.toggle("canvas-overview", overview);
    }
    updateCanvasExtent(scale);
  };
  setRenderedScale(targetScale);
  new MutationObserver(() => setRenderedScale(targetScale)).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  document.addEventListener("dblclick", (event) => {
    if (!(event.target instanceof Element)) return;
    const title = event.target.closest(".group-title-text");
    if (!title || !zoomCanvas.contains(title)) return;
    const groupTitle = title.closest(".group-title[data-group-title-node-id]");
    const groupNode = groupTitle
      ? zoomCanvas.querySelector(`#node-${CSS.escape(groupTitle.dataset.groupTitleNodeId)}`)
      : null;
    if (!groupNode?.classList.contains("group")) return;
    event.preventDefault();
    event.stopPropagation();
    document.body.classList.toggle("groups-flipped");
  }, true);

  const setScaleAtWorldPoint = (nextScale, worldPoint, anchor, immediate = false) => {
    cancelZoomAnimation();
    const previousTargetScale = targetScale;
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
      const canvasRect = zoomCanvas.getBoundingClientRect();
      zoomViewport.scrollLeft = Math.max(0, Math.min(
        zoomViewport.scrollWidth - zoomViewport.clientWidth,
        zoomViewport.scrollLeft + canvasRect.left + worldPoint.x * scale - anchor.x,
      ));
      zoomViewport.scrollTop = Math.max(0, Math.min(
        zoomViewport.scrollHeight - zoomViewport.clientHeight,
        zoomViewport.scrollTop + canvasRect.top + worldPoint.y * scale - anchor.y,
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

    const viewportCenter = viewportContentCenter();
    const centerAtOverviewLimit = factor < 1 && nextScale <= limits.minScale + 0.0001;
    const pointX = centerAtOverviewLimit ? viewportCenter.x : anchor?.x ?? viewportCenter.x;
    const pointY = centerAtOverviewLimit ? viewportCenter.y : anchor?.y ?? viewportCenter.y;
    const bounds = centerAtOverviewLimit ? boundsForVisibleNodes() : null;
    const anchorWorld = bounds
      ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
      : { x: (pointX - rect.left) / visualScale, y: (pointY - rect.top) / visualScale };
    setScaleAtWorldPoint(nextScale, anchorWorld, { x: pointX, y: pointY }, immediate);
    if (centerAtOverviewLimit) {
      if (immediate) {
        window.requestAnimationFrame(() => {
          if (targetScale <= limits.minScale + 0.0001) centerMapInViewport();
        });
      } else {
        window.setTimeout(() => {
          if (targetScale <= limits.minScale + 0.0001) centerMapInViewport();
        }, 160);
      }
    }
  };
  const centerMapInViewport = () => {
    const bounds = boundsForVisibleNodes();
    const scale = readCanvasScale();
    updateCanvasExtent(scale);
    const canvasRect = zoomCanvas.getBoundingClientRect();
    const center = viewportContentCenter();
    zoomViewport.scrollLeft = Math.max(0, Math.min(
      zoomViewport.scrollWidth - zoomViewport.clientWidth,
      zoomViewport.scrollLeft + canvasRect.left + (bounds.left + bounds.width / 2) * scale - center.x,
    ));
    zoomViewport.scrollTop = Math.max(0, Math.min(
      zoomViewport.scrollHeight - zoomViewport.clientHeight,
      zoomViewport.scrollTop + canvasRect.top + (bounds.top + bounds.height / 2) * scale - center.y,
    ));
  };
  let activeCanvasPinch = null;
  const pendingPinch = { factor: 1, anchor: null, frame: 0 };
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
    pendingPinch.anchor = touchMidpoint(event.touches);
    if (activeCanvasPinch && activeCanvasPinch.distance > 0 && distance > 0) {
      pendingPinch.factor *= distance / activeCanvasPinch.distance;
      if (!pendingPinch.frame) {
        pendingPinch.frame = requestAnimationFrame(() => {
          const { factor, anchor } = pendingPinch;
          pendingPinch.frame = 0;
          pendingPinch.factor = 1;
          window.zoomBy(factor, anchor, true);
        });
      }
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
  const nodeForPageLink = (link) => {
    let path;
    try {
      path = new URL(link.href, window.location.href).pathname;
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
  if (contentsNavigation) {
    const dim = (node, key) => Number(node.dataset[key]);
    const areaOf = (node) => dim(node, "canvasWidth") * dim(node, "canvasHeight");
    const byPosition = (a, b) => dim(a.node, "canvasTop") - dim(b.node, "canvasTop")
      || dim(a.node, "canvasLeft") - dim(b.node, "canvasLeft");
    const groups = [...zoomCanvas.querySelectorAll(".node.group[data-node-id]")].map((node) => ({
      node,
      title: zoomCanvas.querySelector(
        `.group-title[data-group-title-node-id="${CSS.escape(node.dataset.nodeId)}"] .group-title-text`,
      )?.textContent?.trim() || node.querySelector(".md-card-title")?.textContent?.trim() || "Group",
      entries: [],
      children: [],
      parent: null,
    }));
    const smallest = (list) => list.sort((a, b) => areaOf(a.node) - areaOf(b.node))[0] || null;
    for (const group of groups) {
      const left = dim(group.node, "canvasLeft");
      const top = dim(group.node, "canvasTop");
      const right = left + dim(group.node, "canvasWidth");
      const bottom = top + dim(group.node, "canvasHeight");
      group.parent = smallest(groups.filter((other) => other !== group
        && areaOf(other.node) > areaOf(group.node)
        && dim(other.node, "canvasLeft") <= left && dim(other.node, "canvasTop") <= top
        && dim(other.node, "canvasLeft") + dim(other.node, "canvasWidth") >= right
        && dim(other.node, "canvasTop") + dim(other.node, "canvasHeight") >= bottom));
      group.parent?.children.push(group);
    }
    const entries = [];
    for (const node of zoomCanvas.querySelectorAll(".node[data-node-id]:not(.group):not(.model-preview-node)")) {
      const titleLink = node.querySelector(".md-card-title-link[href]");
      const label = node.querySelector(".md-card-title")?.textContent?.trim()
        || node.querySelector(".node-content :is(h1, h2, h3, h4, h5, h6)")?.textContent?.trim();
      if (!label) continue;
      const centerX = dim(node, "canvasLeft") + dim(node, "canvasWidth") / 2;
      const centerY = dim(node, "canvasTop") + dim(node, "canvasHeight") / 2;
      const group = smallest(groups.filter(({ node: g }) =>
        centerX >= dim(g, "canvasLeft") && centerX <= dim(g, "canvasLeft") + dim(g, "canvasWidth")
        && centerY >= dim(g, "canvasTop") && centerY <= dim(g, "canvasTop") + dim(g, "canvasHeight")));
      const entry = { node, label, href: titleLink?.href || null, group };
      group?.entries.push(entry);
      entries.push(entry);
    }
    const makeItem = (label, node, href) => {
      const item = document.createElement("li");
      item.className = "contents-item";
      const link = document.createElement("a");
      link.className = href ? "contents-link contents-page-link" : "contents-link contents-plain-link";
      link.href = href || "#";
      link.textContent = label;
      if (!href) {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          zoomToNode(node);
        });
      }
      item.append(link);
      return item;
    };
    const appendGroup = (group, parentList) => {
      const item = makeItem(group.title, group.node, null);
      item.classList.add("contents-group-item");
      const children = document.createElement("ul");
      children.className = "contents-list contents-group-children";
      group.entries.sort(byPosition).forEach((entry) => children.append(makeItem(entry.label, entry.node, entry.href)));
      group.children.sort(byPosition).forEach((child) => appendGroup(child, children));
      if (children.childElementCount) item.append(children);
      parentList.append(item);
    };
    const list = document.createElement("ul");
    list.className = "contents-list";
    const mainEntry = entries.find((entry) => entry.node === mainMapNode);
    if (mainEntry) list.append(makeItem(mainEntry.label, mainEntry.node, mainEntry.href));
    groups.filter(({ parent }) => !parent).sort(byPosition).forEach((group) => appendGroup(group, list));
    entries
      .filter((entry) => !entry.group && entry !== mainEntry)
      .sort(byPosition)
      .forEach((entry) => list.append(makeItem(entry.label, entry.node, entry.href)));
    contentsNavigation.append(list);
  }
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

  const wheelScroll = { el: null, time: 0 };
  const wheelPan = { time: 0 };
  // Trackpad pinch arrives as ctrl+wheel without a real Control key press.
  const heldKeys = { ctrl: false };
  window.addEventListener("keydown", (e) => { if (e.key === "Control") heldKeys.ctrl = true; });
  window.addEventListener("keyup", (e) => { if (e.key === "Control") heldKeys.ctrl = false; });
  window.addEventListener("blur", () => { heldKeys.ctrl = false; });
  zoomViewport.addEventListener("wheel", (event) => {
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? zoomViewport.clientHeight : 1;
    const deltaX = event.deltaX * unit;
    const deltaY = event.deltaY * unit;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const keyHeld = event.metaKey || heldKeys.ctrl;
      const zoomDelta = keyHeld ? Math.max(-60, Math.min(60, deltaY)) * 0.012 : deltaY * 0.037;
      window.zoomBy(Math.exp(-zoomDelta), { x: event.clientX, y: event.clientY }, true);
      return;
    }
    const now = performance.now();
    const gestureGap = 300;
    if (event.target instanceof Element && event.target.closest(".node-content")) {
      const horizontal = Math.abs(deltaX) > Math.abs(deltaY) || event.shiftKey;
      if (!horizontal) {
        let scroller = event.target.closest(".node-content");
        while (scroller && scroller !== zoomViewport) {
          const canScroll = scroller.scrollHeight > scroller.clientHeight + 1
            && /(auto|scroll)/.test(getComputedStyle(scroller).overflowY);
          const atEdge = deltaY < 0 ? scroller.scrollTop <= 0 : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
          if (canScroll && now - wheelPan.time > gestureGap) {
            if (!atEdge) {
              wheelScroll.el = scroller;
              wheelScroll.time = now;
              return;
            }
            if (wheelScroll.el === scroller && now - wheelScroll.time <= gestureGap) {
              wheelScroll.time = now;
              event.preventDefault();
              return;
            }
          }
          scroller = scroller.parentElement;
        }
      }
    }
    if (!deltaX && !deltaY) return;
    wheelPan.time = now;
    event.preventDefault();
    if (event.shiftKey) {
      const horizontalDelta = deltaX || deltaY;
      zoomViewport.scrollLeft = Math.max(
        0,
        Math.min(zoomViewport.scrollWidth - zoomViewport.clientWidth, zoomViewport.scrollLeft + horizontalDelta),
      );
      return;
    }
    zoomViewport.scrollLeft = Math.max(
      0,
      Math.min(zoomViewport.scrollWidth - zoomViewport.clientWidth, zoomViewport.scrollLeft + deltaX),
    );
    zoomViewport.scrollTop = Math.max(
      0,
      Math.min(zoomViewport.scrollHeight - zoomViewport.clientHeight, zoomViewport.scrollTop + deltaY),
    );
  }, { passive: false, capture: true });

  let activeDragZoom = null;
  let suppressDragZoomClick = false;
  const modifierDragZoom = (event) => event.shiftKey || event.metaKey || event.ctrlKey;
  window.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "mouse"
      || event.button !== 0
      || !modifierDragZoom(event)
      || !(event.target instanceof Element)
      || !zoomViewport.contains(event.target)
      || event.target.closest("a, button, input, select, textarea, iframe, audio, video, [contenteditable='true'], .toolbar, .minimap")
    ) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activeDragZoom = {
      pointerId: event.pointerId,
      lastY: event.clientY,
      anchor: { x: event.clientX, y: event.clientY },
      moved: false,
    };
    zoomViewport.classList.add("is-drag-zooming");
    try {
      zoomViewport.setPointerCapture(event.pointerId);
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
    }
  }, true);
  window.addEventListener("pointermove", (event) => {
    if (!activeDragZoom || event.pointerId !== activeDragZoom.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const deltaY = activeDragZoom.lastY - event.clientY;
    activeDragZoom.lastY = event.clientY;
    if (Math.abs(deltaY) < 0.01) return;
    activeDragZoom.moved ||= Math.abs(event.clientY - activeDragZoom.anchor.y) > 3;
    window.zoomBy(Math.exp(deltaY * 0.007), activeDragZoom.anchor, true);
  }, { passive: false, capture: true });
  const finishDragZoom = (event) => {
    if (!activeDragZoom || event.pointerId !== activeDragZoom.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressDragZoomClick = activeDragZoom.moved;
    activeDragZoom = null;
    zoomViewport.classList.remove("is-drag-zooming");
  };
  window.addEventListener("pointerup", finishDragZoom, true);
  window.addEventListener("pointercancel", finishDragZoom, true);
  document.addEventListener("click", (event) => {
    if (!suppressDragZoomClick) return;
    suppressDragZoomClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

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
  const updateFades = () => {
    for (const content of zoomCanvas.querySelectorAll(".node-content")) {
      content.classList.toggle(
        "has-more",
        content.scrollTop + content.clientHeight < content.scrollHeight - 2,
      );
    }
  };
  zoomCanvas.addEventListener("scroll", (event) => {
    const content = event.target;
    if (!(content instanceof Element) || !content.classList.contains("node-content")) return;
    content.classList.toggle("has-more", content.scrollTop + content.clientHeight < content.scrollHeight - 2);
  }, true);
  let userInteracted = false;
  for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    window.addEventListener(type, () => { userInteracted = true; }, { capture: true, once: true, passive: true });
  }
  const applyInitialState = () => {
    updateFades();
    if (userInteracted) return;
    frameCanvas(true);
    window.closeContents?.();
    window.closeSearch?.();
    if (!externalLinksPanel.hidden) {
      externalLinksPanel.hidden = true;
      syncExternalLinksState();
    }
    if (minimapPanel?.hidden) window.toggleMinimap?.();
  };
  requestAnimationFrame(() => requestAnimationFrame(applyInitialState));
  window.addEventListener("load", () => window.setTimeout(applyInitialState, 250), { once: true });

  const startCenter = (bounds) => {
    if (!mainMapNode) return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    return {
      x: Number(mainMapNode.dataset.canvasLeft) + Number(mainMapNode.dataset.canvasWidth) / 2,
      y: Number(mainMapNode.dataset.canvasTop) + Number(mainMapNode.dataset.canvasHeight) / 2,
    };
  };
  const frameCanvas = (immediate = false) => {
    fitToViewport = true;
    focusedNodeScale = 0;
    focusedNode = null;
    const bounds = boundsForVisibleNodes();
    const scale = Math.max(zoomLimits().minScale, heightFitScale(bounds));
    const anchor = viewportContentCenter();
    setScaleAtWorldPoint(scale, startCenter(bounds), anchor, immediate);
  };
  window.reframeCanvas = () => frameCanvas();
  window.addEventListener("keydown", (event) => {
    if (
      event.code !== "Space"
      || event.repeat
      || event.altKey
      || event.ctrlKey
      || event.metaKey
      || (event.target instanceof Element
        && event.target.closest("a, button, input, select, textarea, iframe, audio, video, [contenteditable='true']"))
    ) return;
    event.preventDefault();
    frameCanvas();
  }, true);
  if (typeof originalResetZoom === "function") {
    window.resetZoom = () => {
      window.resetNodePositions();
      frameCanvas();
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
        viewportContentCenter(),
        true,
      );
      return;
    }
    const limits = zoomLimits();
    if (fitToViewport) {
      const bounds = boundsForVisibleNodes();
      const fitScale = Math.max(limits.minScale, Math.min(limits.maxScale, heightFitScale(bounds)));
      setScaleAtWorldPoint(
        fitScale,
        startCenter(bounds),
        viewportContentCenter(),
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
