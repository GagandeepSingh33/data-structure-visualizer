// visual/avlAnimate.js
// Renders AVL tree with steps including rotations.

const AVLAnimation = (function () {
  const state = {
    model: null,
    treeContainer: null,
    explanationBox: null,
    inlineBox: null,

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
    clearTimer();

    state.model = opts.model || null;
    state.treeContainer = opts.treeContainer || null;
    state.explanationBox = opts.explanationBox || null;
    state.inlineBox = opts.inlineBox || null;

    state.steps = [];
    state.currentIndex = 0;
    state.isPaused = false;

    if (state.model) {
      renderAll(state.model.snapshot(), "");
    } else if (state.treeContainer) {
      state.treeContainer.innerHTML = "";
    }
    if (state.inlineBox) state.inlineBox.textContent = "";
  }

  function isRunning() {
    return state.steps.length > 0 && state.currentIndex < state.steps.length;
  }

  // drawing
  function renderTree(snapshot, highlight) {
    if (!state.treeContainer || !snapshot) return;

    const { storage, size } = snapshot;
    const container = state.treeContainer;
    container.innerHTML = "";
    if (size === 0) return;

    const width = container.clientWidth || 600;
    const levels = Math.floor(Math.log2(size)) + 1;
    const levelHeight = 80;
    const height = levels * levelHeight + 40;
    container.style.height = `${height}px`;

    const positions = {};
    for (let i = 0; i < size; i++) {
      if (storage[i] == null) continue;
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
      if (storage[i] == null) continue;
      const parentPos = positions[i];
      if (!parentPos) continue;

      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size && storage[left] != null && positions[left]) {
        const child = positions[left];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentPos.x);
        line.setAttribute("y1", parentPos.y + 20);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - 20);
        line.setAttribute("class", "heap-tree-edge");
        svg.appendChild(line);
      }

      if (right < size && storage[right] != null && positions[right]) {
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
      if (storage[i] == null) continue;
      const pos = positions[i];
      if (!pos) continue;
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

  function renderStep(step) {
    const snap = step.stateTree || (state.model ? state.model.snapshot() : null);

    const highlight = { active: [], shifted: [], invalid: [] };

    if (
      step.type === "highlight" ||
      step.type === "addNode" ||
      step.type === "connect" ||
      step.type === "visit"
    ) {
      highlight.active = step.indices || [];
    } else if (step.type === "rotateLeft" || step.type === "rotateRight") {
      highlight.shifted = step.indices || [];
    } else if (step.type === "error") {
      highlight.invalid = step.indices || [];
    }

    renderTree(snap, highlight);

    if (step.explanation != null) {
      if (state.explanationBox) state.explanationBox.textContent = step.explanation;
      if (state.inlineBox) state.inlineBox.textContent = step.explanation;
    }
  }

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
      if (state.model) renderTree(state.model.snapshot(), {});
      if (state.inlineBox) state.inlineBox.textContent = "";
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

  function renderAll(snapshot, explanation) {
    renderTree(snapshot, { active: [], shifted: [], invalid: [] });
    if (explanation != null) {
      if (state.explanationBox) state.explanationBox.textContent = explanation;
      if (state.inlineBox) state.inlineBox.textContent = explanation;
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

window.AVLAnimation = AVLAnimation;
