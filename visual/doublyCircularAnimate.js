// visual/doublyCircularAnimate.js
// Renders doubly circular list nodes around a circle and plays step animations
// with bidirectional (prev/next) arrows between nodes.

(function () {
  const container = document.getElementById("dcll-circle-container");
  const explBox = document.getElementById("dcll-explanation-box");
  const complexityInfo = document.getElementById("dcll-complexity-info");
  const lengthLabel = document.getElementById("dcll-length-label");
  const headLabel = document.getElementById("dcll-head-label");

  if (!container) return; // not on this page

  function renderState(state) {
    container.innerHTML = "";
    if (!state) return;

    const n = state.length || 0;
    if (lengthLabel) {
      lengthLabel.textContent = n
        ? `Current length: ${n} (one full loop returns to head/tail)`
        : "Current length: 0 (empty circular list)";
    }

    if (!state.nodes || state.nodes.length === 0) {
      const span = document.createElement("span");
      span.className = "small-note";
      span.textContent = "Doubly circular list is empty (no nodes in the ring).";
      container.appendChild(span);
      return;
    }

    const radius = 120;
    const centerX = 150;
    const centerY = 150;
    container.style.position = "relative";

    // Precompute positions for each node id
    const posById = {};

    state.nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / state.nodes.length - Math.PI / 2; // start at top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      posById[node.id] = { x, y, node };

      const nodeEl = document.createElement("div");
      nodeEl.className = "dcll-node";
      nodeEl.textContent = node.value;

      if (state.activeId === node.id) {
        nodeEl.classList.add("dcll-node-active");
      }
      if (state.targetId === node.id) {
        nodeEl.classList.add("dcll-node-target");
      }
      if (state.pointerIds && state.pointerIds.includes(node.id)) {
        nodeEl.classList.add("dcll-node-pointer-change");
      }

      nodeEl.style.position = "absolute";
      nodeEl.style.left = `${x}px`;
      nodeEl.style.top = `${y}px`;
      nodeEl.style.transform = "translate(-50%, -50%)";

      container.appendChild(nodeEl);
    });

    // Draw bidirectional arrows between each node and its next
    state.nodes.forEach((node) => {
      const from = posById[node.id];
      const to = posById[node.nextId];
      if (!from || !to) return;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

      const arrow = document.createElement("div");
      arrow.className = "dcll-arrow-bidirectional";
      arrow.style.width = `${Math.max(length - 40, 10)}px`; // shorter than center-to-center
      arrow.style.left = `${from.x}px`;
      arrow.style.top = `${from.y}px`;
      arrow.style.transformOrigin = "0 50%";
      arrow.style.transform = `translate(0, -1px) rotate(${angleDeg}deg)`;

      container.appendChild(arrow);
    });

    if (headLabel) {
      headLabel.textContent = "head";
    }
  }

  // Animate steps sequentially (same pattern as other visualizers)
  function playSteps(steps) {
    if (!steps || steps.length === 0) return;

    let i = 0;
    const delay = 600; // ms

    function showNext() {
      const step = steps[i];
      renderState(step.state);
      if (explBox) explBox.textContent = step.explanation || "";
      if (complexityInfo) complexityInfo.textContent = step.complexity || "";

      i += 1;
      if (i < steps.length) {
        setTimeout(showNext, delay);
      }
    }

    showNext();
  }

  window.DCLLAnimator = {
    renderState,
    playSteps
  };
})();
