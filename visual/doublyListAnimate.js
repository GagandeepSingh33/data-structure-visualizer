// visual/doublyListAnimate.js
// Handles DOM drawing + simple step-by-step animations using the step objects,
// mirroring the Singly Linked List animator but with prev and next arrows.

(function () {
  const container = document.getElementById("dll-list-container");
  const explBox = document.getElementById("dll-explanation-box");
  const complexityInfo = document.getElementById("dll-complexity-info");
  const lengthInfo = document.getElementById("dll-length-info");

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
      span.textContent = "List is empty (head → null, tail → null).";
      container.appendChild(span);
      return;
    }

    state.nodes.forEach((node) => {
      // main node box (similar to sll-node)
      const nodeEl = document.createElement("div");
      nodeEl.className = "dll-node";
      nodeEl.textContent = node.value;

      if (state.activeId === node.id) {
        nodeEl.classList.add("dll-node-active");
      }
      if (state.targetId === node.id) {
        nodeEl.classList.add("dll-node-target");
      }
      if (state.pointerIds && state.pointerIds.includes(node.id)) {
        nodeEl.classList.add("dll-node-pointer-change");
      }

      // wrapper for prev | node | next (horizontal row)
      const wrapper = document.createElement("div");
      wrapper.className = "dll-node-wrapper";

      // prev arrow/label
      const prev = document.createElement("div");
      if (node.prevId) {
        prev.className = "dll-arrow dll-arrow-prev";
        prev.innerHTML = "&larr; prev";
      } else {
        prev.className = "dll-arrow-null";
        prev.textContent = "null";
      }

      // next arrow/label
      const next = document.createElement("div");
      if (node.nextId) {
        next.className = "dll-arrow dll-arrow-next";
        next.innerHTML = "next &rarr;";
      } else {
        next.className = "dll-arrow-null";
        next.textContent = "null";
      }

      // order: prev | [value] | next
      wrapper.appendChild(prev);
      wrapper.appendChild(nodeEl);
      wrapper.appendChild(next);

      container.appendChild(wrapper);
    });
  }

  // Animate steps sequentially with small delay (same as SLL)
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

  // expose
  window.DLLAnimator = {
    renderState,
    playSteps
  };
})();
