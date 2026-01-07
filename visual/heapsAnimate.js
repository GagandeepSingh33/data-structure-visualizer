// visual/heapAnimate.js
// Renders heap array, tree (circles + lines), and sorted array,
// with playback controls (prev / next / pause, speed).

const HeapAnimation = (function () {
  const state = {
    model: null,
    heapArrayContainer: null,
    heapTreeContainer: null,
    heapSortArrayContainer: null,
    explanationBox: null,
    capacityInfo: null,

    steps: [],
    currentIndex: 0,
    baseDelayMs: 550,
    speedFactor: 1,
    timerId: null,
    isPaused: false
  };

  function effectiveDelay() {
    const factor = state.speedFactor || 1;
    return state.baseDelayMs / factor;
  }

  function init(opts) {
    state.model = opts.model;
    state.heapArrayContainer = opts.heapArrayContainer;
    state.heapTreeContainer = opts.heapTreeContainer;
    state.heapSortArrayContainer = opts.heapSortArrayContainer;
    state.explanationBox = opts.explanationBox;
    state.capacityInfo = opts.capacityInfo;

    state.steps = [];
    state.currentIndex = 0;
    state.isPaused = false;

    renderAll(state.model.snapshot(), null, "");
  }

  function isRunning() {
    return state.steps.length > 0 && state.currentIndex < state.steps.length;
  }

  // ----- array view -----
  function renderHeapArray(snapshot, highlight) {
    if (!state.heapArrayContainer || !snapshot) return;

    const { storage, size, capacity } = snapshot;
    state.heapArrayContainer.innerHTML = "";

    for (let i = 0; i < capacity; i++) {
      const cell = document.createElement("div");
      cell.classList.add("array-cell");
      if (i >= size || storage[i] === null) {
        cell.classList.add("empty");
      }

      const indexDiv = document.createElement("div");
      indexDiv.classList.add("array-cell-index");
      indexDiv.textContent = `Index ${i}`;

      const valueDiv = document.createElement("div");
      valueDiv.classList.add("array-cell-value");
      valueDiv.textContent =
        i < size && storage[i] !== null ? storage[i] : "—";

      cell.appendChild(indexDiv);
      cell.appendChild(valueDiv);

      if (highlight) {
        if (highlight.active && highlight.active.includes(i)) {
          cell.classList.add("active");
        }
        if (highlight.shifted && highlight.shifted.includes(i)) {
          cell.classList.add("shifted");
        }
        if (highlight.invalid && highlight.invalid.includes(i)) {
          cell.classList.add("invalid");
        }
      }

      state.heapArrayContainer.appendChild(cell);
    }

    if (state.capacityInfo) {
      state.capacityInfo.textContent =
        `Heap size: ${size} / Capacity: ${capacity}`;
    }
  }

  // ----- sorted array -----
  function renderSortedArray(sortedSnapshot, highlight) {
    if (!state.heapSortArrayContainer) return;

    state.heapSortArrayContainer.innerHTML = "";
    if (!sortedSnapshot) return;

    const { storage, capacity } = sortedSnapshot;

    for (let i = 0; i < capacity; i++) {
      const cell = document.createElement("div");
      cell.classList.add("array-cell");
      if (storage[i] === null || storage[i] === undefined) {
        cell.classList.add("empty");
      }

      const indexDiv = document.createElement("div");
      indexDiv.classList.add("array-cell-index");
      indexDiv.textContent = `Index ${i}`;

      const valueDiv = document.createElement("div");
      valueDiv.classList.add("array-cell-value");
      valueDiv.textContent =
        storage[i] !== null && storage[i] !== undefined ? storage[i] : "—";

      cell.appendChild(indexDiv);
      cell.appendChild(valueDiv);

      if (highlight && highlight.activeSorted && highlight.activeSorted.includes(i)) {
        cell.classList.add("active");
      }

      state.heapSortArrayContainer.appendChild(cell);
    }
  }

  // ----- tree view -----
  function renderHeapTree(snapshot, highlight) {
    if (!state.heapTreeContainer || !snapshot) return;

    const { storage, size } = snapshot;
    const container = state.heapTreeContainer;
    container.innerHTML = "";
    if (size === 0) return;

    const width = container.clientWidth || 600;
    const levels = Math.floor(Math.log2(size)) + 1;
    const levelHeight = 80;
    const height = levels * levelHeight + 40;
    container.style.height = `${height}px`;

    const positions = {};
    for (let i = 0; i < size; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const levelStart = Math.pow(2, level) - 1;
      const offset = i - levelStart;
      const nodesInLevel = Math.pow(2, level);

      const y = (level + 1) * levelHeight;
      const segmentWidth = width / nodesInLevel;
      const x = segmentWidth * (offset + 0.5);

      positions[i] = { x, y };
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "heap-tree-edges");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    for (let i = 0; i < size; i++) {
      const parentPos = positions[i];
      if (!parentPos) continue;

      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size && positions[left]) {
        const child = positions[left];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentPos.x);
        line.setAttribute("y1", parentPos.y + 20);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - 20);
        line.setAttribute("class", "heap-tree-edge");
        svg.appendChild(line);
      }

      if (right < size && positions[right]) {
        const child = positions[right];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentPos.x);
        line.setAttribute("y1", parentPos.y + 20);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - 20);
        line.setAttribute("class", "heap-tree-edge");
        svg.appendChild(line);
      }
    }

    container.appendChild(svg);

    for (let i = 0; i < size; i++) {
      const pos = positions[i];
      const node = document.createElement("div");
      node.classList.add("heap-tree-node");
      node.textContent = storage[i];

      if (highlight) {
        if (highlight.active && highlight.active.includes(i)) {
          node.classList.add("active");
        }
        if (highlight.shifted && highlight.shifted.includes(i)) {
          node.classList.add("shifted");
        }
        if (highlight.invalid && highlight.invalid.includes(i)) {
          node.classList.add("invalid");
        }
      }

      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      container.appendChild(node);
    }
  }

  // ----- single step -----
  function renderStep(step) {
    const heapSnap = step.stateHeap ||
      (state.model ? state.model.snapshot() : null);
    const sortedSnap = step.stateSorted || null;

    const highlight = {
      active: [],
      shifted: [],
      invalid: [],
      activeSorted: []
    };

    if (
      step.type === "highlight" ||
      step.type === "addNode" ||
      step.type === "connect"
    ) {
      highlight.active = step.indices || [];
    } else if (
      step.type === "swap" ||
      step.type === "heapSortSwap" ||
      step.type === "heapSortHeapify"
    ) {
      highlight.shifted = step.indices || [];
    } else if (step.type === "error") {
      highlight.invalid = step.indices || [];
    }

    if (step.type === "heapSortSwap" && step.indices && step.indices.length > 1) {
      highlight.activeSorted = [step.indices[1]];
    }

    renderHeapArray(heapSnap, highlight);
    renderHeapTree(heapSnap, highlight);
    renderSortedArray(sortedSnap, { activeSorted: highlight.activeSorted });

    if (state.explanationBox && step.explanation != null) {
      state.explanationBox.textContent = step.explanation;
    }
  }

  // ----- playback helpers -----
  function clearTimer() {
    if (state.timerId != null) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
  }

  function scheduleNext(onDone) {
    clearTimer();
    if (state.isPaused) return;
    if (state.currentIndex >= state.steps.length) {
      if (onDone) onDone();
      return;
    }
    const delay = effectiveDelay();
    state.timerId = setTimeout(() => {
      stepForwardInternal(onDone, true);
    }, delay);
  }

  function stepForwardInternal(onDone, autoAdvance) {
    if (state.currentIndex >= state.steps.length) {
      clearTimer();
      if (onDone) onDone();
      return;
    }
    const step = state.steps[state.currentIndex];
    renderStep(step);
    state.currentIndex += 1;
    if (autoAdvance) scheduleNext(onDone);
  }

  function playSteps(steps, onDone) {
    clearTimer();
    state.steps = steps || [];
    state.currentIndex = 0;
    state.isPaused = false;

    if (!state.steps.length) {
      if (onDone) onDone();
      return;
    }
    scheduleNext(onDone);
  }

  function stepForward() {
    state.isPaused = true;
    clearTimer();
    if (!state.steps.length) return;
    if (state.currentIndex >= state.steps.length) return;
    const step = state.steps[state.currentIndex];
    renderStep(step);
    state.currentIndex += 1;
  }

  function stepBackward() {
    state.isPaused = true;
    clearTimer();
    if (!state.steps.length) return;
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    if (state.currentIndex === 0) {
      renderHeapArray(state.model.snapshot(), {});
      renderHeapTree(state.model.snapshot(), {});
      renderSortedArray(null, {});
      return;
    }
    const step = state.steps[state.currentIndex - 1];
    renderStep(step);
  }

  function togglePause(onDone) {
    if (!state.steps.length) return;
    state.isPaused = !state.isPaused;
    if (!state.isPaused) {
      scheduleNext(onDone);
    } else {
      clearTimer();
    }
    return state.isPaused;
  }

  function setSpeed(factor) {
    const num = Number(factor);
    if (!Number.isFinite(num) || num <= 0) return;
    state.speedFactor = num;
    if (!state.isPaused && isRunning()) {
      scheduleNext();
    }
  }

  function renderAll(heapSnapshot, sortedSnapshot, explanation, highlight = {}) {
    renderHeapArray(heapSnapshot, {
      active: highlight.active || [],
      shifted: highlight.shifted || [],
      invalid: highlight.invalid || []
    });
    renderHeapTree(heapSnapshot, {
      active: highlight.active || [],
      shifted: highlight.shifted || [],
      invalid: highlight.invalid || []
    });
    renderSortedArray(sortedSnapshot, {
      activeSorted: highlight.activeSorted || []
    });
    if (state.explanationBox && explanation != null) {
      state.explanationBox.textContent = explanation;
    }
  }

  return {
    init,
    playSteps,
    isRunning,
    stepForward,
    stepBackward,
    togglePause,
    setSpeed
  };
})();

window.HeapAnimation = HeapAnimation;
