// visual/linkedListAnimate.js
// Handles DOM drawing + simple step-by-step animations using the step objects. [web:139][web:162]

(function () {
  const container = document.getElementById("sll-list-container");
  const explBox = document.getElementById("sll-explanation-box");
  const complexityInfo = document.getElementById("sll-complexity-info");
  const lengthInfo = document.getElementById("sll-length-info");

  if (!container) return; // not on this page

  function renderState(state) {
    container.innerHTML = "";
    if (!state) return;

    // update length text
    if (typeof state.length === "number") {
      lengthInfo.textContent = `Current length: ${state.length}`;
    } else {
      lengthInfo.textContent = "";
    }

    if (!state.nodes || state.nodes.length === 0) {
      const span = document.createElement("span");
      span.className = "small-note";
      span.textContent = "List is empty (head → null).";
      container.appendChild(span);
      return;
    }

    state.nodes.forEach((node, index) => {
      const nodeEl = document.createElement("div");
      nodeEl.className = "sll-node";
      nodeEl.textContent = node.value;

      if (state.activeId === node.id) {
        nodeEl.classList.add("sll-node-active");
      }
      if (state.targetId === node.id) {
        nodeEl.classList.add("sll-node-target");
      }
      if (state.pointerIds && state.pointerIds.includes(node.id)) {
        nodeEl.classList.add("sll-node-pointer-change");
      }

      // wrapper for node + arrow
      const wrapper = document.createElement("div");
      wrapper.className = "sll-node-wrapper";
      wrapper.appendChild(nodeEl);

      // add arrow if next exists
      if (node.nextId) {
        const arrow = document.createElement("div");
        arrow.className = "sll-arrow";
        arrow.innerHTML = "&rarr; next";
        wrapper.appendChild(arrow);
      } else {
        const arrow = document.createElement("div");
        arrow.className = "sll-arrow-null";
        arrow.textContent = "null";
        wrapper.appendChild(arrow);
      }

      container.appendChild(wrapper);
    });
  }

  // Animate steps sequentially with small delay
  function playSteps(steps) {
    if (!steps || steps.length === 0) return;

    let i = 0;
    const delay = 600; // ms

    function showNext() {
      const step = steps[i];
      renderState(step.state);
      explBox.textContent = step.explanation || "";
      complexityInfo.textContent = step.complexity || "";

      i += 1;
      if (i < steps.length) {
        setTimeout(showNext, delay);
      }
    }

    showNext();
  }

  // expose
  window.SLLAnimator = {
    renderState,
    playSteps
  };
})();
