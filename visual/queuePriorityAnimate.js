// visual/queuePriorityAnimate.js
// Priority queue: horizontal row ordered by priority.

(function () {
  const container = document.getElementById("queue-container");
  const explBox = document.getElementById("queue-explanation-box");
  const complexityInfo = document.getElementById("queue-complexity-info");
  const sizeLabel = document.getElementById("queue-size-label");
  const legendInline = document.getElementById("queue-legend-inline");

  if (!container) return;

  function updateInlineLegend() {
    if (!legendInline) return;
    legendInline.innerHTML =
      '<span class="queue-item queue-item-front legend-chip"></span>' +
      '<span> Highest priority</span>' +
      ' &nbsp; ' +
      '<span class="queue-item queue-item-rear legend-chip"></span>' +
      '<span> Lowest priority</span>';
  }

  function renderState(state) {
    container.innerHTML = "";
    if (!state) return;

    const n = state.items ? state.items.length : 0;
    if (sizeLabel) sizeLabel.textContent = `Current size: ${n}`;
    updateInlineLegend();

    if (!state.items || n === 0) {
      const span = document.createElement("span");
      span.className = "small-note";
      span.textContent =
        "Priority queue is empty (no elements with assigned priorities).";
      container.appendChild(span);
      return;
    }

    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "flex-start";
    container.style.gap = "6px";

    state.items.forEach((label, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "queue-item";
      itemEl.textContent = label; // "10:10" or "A:3"

      if (index === state.frontIndex) {
        itemEl.classList.add("queue-item-front");
      }
      if (index === state.rearIndex) {
        itemEl.classList.add("queue-item-rear");
      }
      if (state.activeIndex === index) {
        itemEl.classList.add("queue-item-active");
      }
      if (state.targetIndex === index) {
        itemEl.classList.add("queue-item-target");
      }

      container.appendChild(itemEl);
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

  window.QueueAnimatorPriority = { renderState, playSteps };
})();
