// visual/queueCircularAnimate.js
// Draw circular queue as ring with colored front (orange) and rear (green).

(function () {
  const ring = document.getElementById("circular-queue-ring");
  const explBox = document.getElementById("queue-explanation-box");
  const complexityInfo = document.getElementById("queue-complexity-info");
  const sizeLabel = document.getElementById("queue-size-label");
  const legendInline = document.getElementById("queue-legend-inline");

  if (!ring) return;

  function updateInlineLegend() {
    if (!legendInline) return;
    legendInline.innerHTML =
      '<span class="queue-item queue-item-front legend-chip"></span>' +
      '<span> Front (orange)</span>' +
      ' &nbsp; ' +
      '<span class="queue-item queue-item-rear legend-chip"></span>' +
      '<span> Rear (green)</span>';
  }

  function renderState(state) {
    ring.innerHTML = "";
    if (!state) return;

    const n = state.items ? state.items.length : 0;
    if (sizeLabel) sizeLabel.textContent = `Current size: ${n}`;
    updateInlineLegend();

    if (!state.items || n === 0) {
      const span = document.createElement("span");
      span.className = "small-note";
      span.textContent =
        "Queue is empty (no elements in the circular buffer).";
      ring.appendChild(span);
      return;
    }

    const radius = 110;
    const centerX = 130;
    const centerY = 130;

    state.items.forEach((value, index) => {
      const angle = (2 * Math.PI * index) / n;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const slot = document.createElement("div");
      slot.className = "circular-slot queue-item";
      slot.style.left = x - 26 + "px";
      slot.style.top = y - 26 + "px";
      slot.textContent = value;

      if (index === state.frontIndex) {
        slot.classList.add("queue-item-front", "front");
      }
      if (index === state.rearIndex) {
        slot.classList.add("queue-item-rear", "rear");
      }
      if (state.activeIndex === index) {
        slot.classList.add("queue-item-active");
      }
      if (state.targetIndex === index) {
        slot.classList.add("queue-item-target");
      }

      ring.appendChild(slot);
    });
  }

  function playSteps(steps) {
    if (!steps || steps.length === 0) return;

    let i = 0;
    const delay = 600;

    function showNext() {
      const step = steps[i];
      renderState(step.state);
      if (explBox) explBox.textContent = step.explanation || "";
      if (complexityInfo) complexityInfo.textContent = step.complexity || "";

      i += 1;
      if (i < steps.length) setTimeout(showNext, delay);
    }

    showNext();
  }

  window.QueueAnimatorCircular = { renderState, playSteps };
})();
