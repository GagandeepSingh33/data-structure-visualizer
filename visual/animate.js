// visual/animate.js
// Animation and rendering logic: consumes steps, updates DOM.

const ArrayAnimation = (function () {
  const state = {
    model: null,
    arrayContainer: null,
    newArrayContainer: null,
    explanationBox: null,
    capacityInfo: null,
    delayMs: 550,
    running: false,
    lastNewSnapshot: null
  };

  function init(opts) {
    state.model = opts.model;
    state.arrayContainer = opts.arrayContainer;
    state.newArrayContainer = opts.newArrayContainer;
    state.explanationBox = opts.explanationBox;
    state.capacityInfo = opts.capacityInfo;
    renderArrays(state.model.snapshot(), null);
  }

  function isRunning() {
    return state.running;
  }

  function renderArray(container, snapshot, highlightInfo) {
    if (!container || !snapshot) return;

    const { storage, length, capacity } = snapshot;
    container.innerHTML = "";

    for (let i = 0; i < capacity; i++) {
      const cell = document.createElement("div");
      cell.classList.add("array-cell");
      if (i >= length || storage[i] === null) {
        cell.classList.add("empty");
      }

      const indexDiv = document.createElement("div");
      indexDiv.classList.add("array-cell-index");
      indexDiv.textContent = `Index ${i}`;

      const valueDiv = document.createElement("div");
      valueDiv.classList.add("array-cell-value");
      valueDiv.textContent =
        i < length && storage[i] !== null ? storage[i] : "—";

      cell.appendChild(indexDiv);
      cell.appendChild(valueDiv);

      if (highlightInfo) {
        if (highlightInfo.active && highlightInfo.active.includes(i)) {
          cell.classList.add("active");
        }
        if (highlightInfo.shifted && highlightInfo.shifted.includes(i)) {
          cell.classList.add("shifted");
        }
        if (highlightInfo.invalid && highlightInfo.invalid.includes(i)) {
          cell.classList.add("invalid");
        }
        if (highlightInfo.resize && highlightInfo.resize.includes(i)) {
          cell.classList.add("resize");
        }
      }

      container.appendChild(cell);
    }
  }

  function renderArrays(oldSnapshot, newSnapshot, highlightOld, highlightNew) {
    renderArray(state.arrayContainer, oldSnapshot, highlightOld);
    if (newSnapshot) {
      renderArray(state.newArrayContainer, newSnapshot, highlightNew);
    } else if (state.newArrayContainer) {
      state.newArrayContainer.innerHTML = "";
    }

    if (state.capacityInfo && oldSnapshot) {
      state.capacityInfo.textContent =
        `Logical length: ${oldSnapshot.length} / Capacity: ${oldSnapshot.capacity}`;
    }
  }

  function playSteps(steps, onDone) {
    if (!steps || steps.length === 0) {
      if (onDone) onDone();
      return;
    }

    state.running = true;
    let i = 0;

    function next() {
      if (i >= steps.length) {
        state.running = false;
        if (onDone) onDone();
        return;
      }

      const step = steps[i];
      let highlightOld = { active: [], shifted: [], invalid: [] };
      let highlightNew = { active: [], shifted: [], invalid: [], resize: [] };

      const oldSnapshot = step.stateOld || (state.model && state.model.snapshot());
      const newSnapshot = step.stateNew || state.lastNewSnapshot;

      if (step.type === "highlight") {
        if (step.target === "old") {
          highlightOld.active = step.indices || [];
        } else if (step.target === "new") {
          highlightNew.active = step.indices || [];
        }
      } else if (step.type === "shiftRight" || step.type === "shiftLeft") {
        if (step.target === "old") {
          highlightOld.shifted = step.indices || [];
        } else if (step.target === "new") {
          highlightNew.shifted = step.indices || [];
        }
      } else if (step.type === "invalidIndex" || step.type === "error") {
        if (step.target === "old") {
          highlightOld.invalid = step.indices || [];
        } else if (step.target === "new") {
          highlightNew.invalid = step.indices || [];
        }
      } else if (step.type === "copy") {
        if (step.indices) {
          highlightOld.active = step.indices;
          highlightNew.resize = step.indices;
        }
      } else if (step.type === "allocate") {
        if (step.target === "new" && newSnapshot) {
          highlightNew.resize = Array.from(
            { length: newSnapshot.capacity },
            (_, idx) => idx
          );
        }
      }

      if (step.stateNew) {
        state.lastNewSnapshot = step.stateNew;
      }

      if (step.type === "reassign") {
        // After reassign, show only the new as the main array container
        renderArrays(step.stateOld, step.stateNew, highlightOld, highlightNew);
        // clear second row on next step
      } else {
        renderArrays(oldSnapshot, newSnapshot, highlightOld, highlightNew);
      }

      if (state.explanationBox && step.explanation) {
        state.explanationBox.textContent = step.explanation;
      }

      i += 1;
      setTimeout(next, state.delayMs);
    }

    next();
  }

  return {
    init,
    playSteps,
    isRunning
  };
})();

window.ArrayAnimation = ArrayAnimation;
