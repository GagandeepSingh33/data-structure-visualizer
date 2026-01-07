// visual/stackAnimate.js
// Handles DOM drawing + step-by-step animations for the stack.

(function () {
  const container = document.getElementById("stack-container");
  const explBox = document.getElementById("stack-explanation-box");
  const complexityInfo = document.getElementById("stack-complexity-info");
  const sizeLabel = document.getElementById("stack-size-label");

  if (!container) return; // not on this page

  function renderState(state) {
    container.innerHTML = "";
    if (!state) return;

    const n = state.items ? state.items.length : 0;
    if (sizeLabel) {
      sizeLabel.textContent = `Current size: ${n}`;
    }

    if (!state.items || state.items.length === 0) {
      const span = document.createElement("span");
      span.className = "small-note";
      span.textContent = "Stack is empty (no elements on the top).";
      container.appendChild(span);
      return;
    }

    container.style.display = "flex";
    container.style.flexDirection = "column-reverse"; // bottom is first item
    container.style.alignItems = "stretch";
    container.style.justifyContent = "flex-start";
    container.style.gap = "4px";

    state.items.forEach((value, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "stack-item";
      itemEl.textContent = value;

      if (state.topIndex === index) {
        itemEl.classList.add("stack-item-top");
      }
      if (state.activeIndex === index) {
        itemEl.classList.add("stack-item-active");
      }
      if (state.targetIndex === index) {
        itemEl.classList.add("stack-item-target");
      }

      container.appendChild(itemEl);
    });
  }

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

  window.StackAnimator = {
    renderState,
    playSteps
  };
})();
