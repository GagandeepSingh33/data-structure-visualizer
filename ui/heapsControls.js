// ui/heapControls.js
// Phases: Create Array -> Heapify -> Heap Sort,
// plus insert/delete/clear and playback controls.

(function () {
  let model = null;
  let createdOnce = false;
  let heapifiedOnce = false;

  const sizeInput = document.getElementById("heap-size-input");
  const elementsInput = document.getElementById("heap-elements-input");
  const heapTypeSelect = document.getElementById("heap-type-select");

  const createArrayBtn = document.getElementById("create-array-btn");
  const heapifyBtn = document.getElementById("heapify-btn");
  const heapSortBtn = document.getElementById("heap-sort-btn");

  const initError = document.getElementById("heap-init-error");

  const valueInput = document.getElementById("heap-value-input");
  const opButtons = document.querySelectorAll(".heap-op-btn");
  const opError = document.getElementById("heap-op-error");

  const heapArrayContainer = document.getElementById("heap-array-container");
  const heapTreeContainer = document.getElementById("heap-tree-container");
  const heapSortArrayContainer = document.getElementById("heap-sort-array-container");
  const explanationBox = document.getElementById("heap-explanation-box");
  const capacityInfo = document.getElementById("heap-capacity-info");

  function setPhaseButtons() {
    heapifyBtn.disabled = !createdOnce;
    heapSortBtn.disabled = !heapifiedOnce;
    opButtons.forEach((btn) => {
      btn.disabled = !heapifiedOnce;
    });
  }

  function setAllDisabled(disabled) {
    createArrayBtn.disabled = disabled;
    heapifyBtn.disabled = disabled || !createdOnce;
    heapSortBtn.disabled = disabled || !heapifiedOnce;
    opButtons.forEach((btn) => {
      btn.disabled = disabled || !heapifiedOnce;
    });
  }

  function parseInitialElements(raw, capacity) {
    if (!raw.trim()) return [];
    const parts = raw.split(",");
    const values = [];
    for (let p of parts) {
      const trimmed = p.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        throw new Error(`"${trimmed}" is not a valid number.`);
      }
      values.push(num);
      if (values.length >= capacity) break;
    }
    return values;
  }

  // Phase 1: Create array only
  function handleCreateArray() {
    opError.textContent = "";
    initError.textContent = "";

    const size = Number(sizeInput.value);
    if (!Number.isInteger(size) || size <= 0) {
      initError.textContent = "Capacity must be a positive integer.";
      return;
    }
    if (size > 30) {
      initError.textContent = "For visualization, please keep capacity ≤ 30.";
      return;
    }

    let initialValues = [];
    try {
      initialValues = parseInitialElements(elementsInput.value, size);
    } catch (e) {
      initError.textContent = e.message;
      return;
    }

    const heapType = heapTypeSelect.value === "max" ? "max" : "min";

    model = new window.HeapCore.HeapModel(size, heapType);

    window.HeapAnimation.init({
      model,
      heapArrayContainer,
      heapTreeContainer,
      heapSortArrayContainer,
      explanationBox,
      capacityInfo
    });

    const steps = model.initWithValues(initialValues);
    createdOnce = true;
    heapifiedOnce = false;
    setPhaseButtons();

    setAllDisabled(true);
    window.HeapAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setPhaseButtons();
      explanationBox.textContent =
        "Array created. Now click \"Heapify Array\" to build a min/max heap from this array.";
    });
  }

  // Phase 2: Heapify
  function handleHeapify() {
    if (!model) {
      opError.textContent = "Create the array first.";
      return;
    }
    if (window.HeapAnimation.isRunning()) return;

    opError.textContent = "";

    const newType = heapTypeSelect.value === "max" ? "max" : "min";
    model.heapType = newType;

    const steps = model.buildHeapSteps(false);
    if (!steps || steps.length === 0) {
      opError.textContent = "Heapify produced no steps.";
      return;
    }

    heapifiedOnce = true;
    setPhaseButtons();

    setAllDisabled(true);
    window.HeapAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setPhaseButtons();
      explanationBox.textContent =
        `Array heapified as a ${newType}-heap. You can now insert, delete root, or run heap sort.`;
    });
  }

  // Phase 3: Heap sort
  function handleHeapSort() {
    if (!model) {
      opError.textContent = "Create and heapify the array first.";
      return;
    }
    if (!heapifiedOnce) {
      opError.textContent = "Heapify the array before running heap sort.";
      return;
    }
    if (window.HeapAnimation.isRunning()) return;

    opError.textContent = "";

    const steps = model.heapSortSteps();
    if (!steps || steps.length === 0) {
      opError.textContent = "Heap sort produced no steps.";
      return;
    }

    setAllDisabled(true);
    window.HeapAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setPhaseButtons();
      explanationBox.textContent =
        "Heap sort finished. The separate array now contains the elements in sorted order.";
    });
  }

  // Live operations after heapify
  function handleOperationClick(event) {
    if (!model) {
      opError.textContent = "Create and heapify the array first.";
      return;
    }
    if (!heapifiedOnce) {
      opError.textContent = "Heapify the array before performing heap operations.";
      return;
    }
    if (window.HeapAnimation.isRunning()) return;

    opError.textContent = "";

    const opType = event.currentTarget.dataset.op;
    const valueRaw = valueInput.value;
    let value = null;

    if (valueRaw.trim() !== "") {
      const num = Number(valueRaw);
      if (Number.isNaN(num)) {
        opError.textContent = "Value must be numeric.";
        return;
      }
      value = num;
    }

    let steps = null;

    try {
      if (opType === "insert") {
        if (value == null) {
          opError.textContent = "Provide a value to insert.";
          return;
        }
        const res = model.insert(value);
        steps = res.steps;
      } else if (opType === "deleteRoot") {
        const res = model.deleteRoot();
        steps = res.steps;
      } else if (opType === "clear") {
        steps = model.clear();
        createdOnce = false;
        heapifiedOnce = false;
      }
    } catch (e) {
      console.error(e);
      opError.textContent = "Unexpected error during operation.";
      return;
    }

    if (!steps || steps.length === 0) {
      opError.textContent = "Operation did not produce animation steps.";
      return;
    }

    setAllDisabled(true);
    window.HeapAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setPhaseButtons();
    });
  }

  createArrayBtn.addEventListener("click", handleCreateArray);
  heapifyBtn.addEventListener("click", handleHeapify);
  heapSortBtn.addEventListener("click", handleHeapSort);
  opButtons.forEach((btn) => btn.addEventListener("click", handleOperationClick));

  // Playback controls
  const prevBtn = document.getElementById("heap-prev-step-btn");
  const nextBtn = document.getElementById("heap-next-step-btn");
  const playPauseBtn = document.getElementById("heap-play-pause-btn");
  const speedSlider = document.getElementById("heap-speed-slider");
  const speedMinus = document.getElementById("heap-speed-decrease");
  const speedPlus = document.getElementById("heap-speed-increase");

  if (prevBtn && nextBtn && playPauseBtn && speedSlider) {
    prevBtn.addEventListener("click", () => {
      window.HeapAnimation.stepBackward();
    });

    nextBtn.addEventListener("click", () => {
      window.HeapAnimation.stepForward();
    });

    playPauseBtn.addEventListener("click", () => {
      const paused = window.HeapAnimation.togglePause();
      playPauseBtn.textContent = paused ? "Play" : "Pause";
    });

    speedSlider.addEventListener("input", () => {
      window.HeapAnimation.setSpeed(speedSlider.value);
    });

    if (speedMinus) {
      speedMinus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.max(1, val - 1);
        speedSlider.value = String(val);
        window.HeapAnimation.setSpeed(val);
      });
    }

    if (speedPlus) {
      speedPlus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.min(5, val + 1);
        speedSlider.value = String(val);
        window.HeapAnimation.setSpeed(val);
      });
    }
  }
})();
