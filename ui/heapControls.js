// ui/heapSortControls.js
// Wires the Heap Sort page UI to HeapSortCore + HeapSortVisual.

(function () {
  const sizeInput = document.getElementById("heap-size-input");
  const elementsInput = document.getElementById("heap-elements-input");
  const maxBtn = document.getElementById("heap-max-btn");
  const minBtn = document.getElementById("heap-min-btn");
  const initBtn = document.getElementById("heap-init-btn");
  const initError = document.getElementById("heap-init-error");

  const arrayContainer = document.getElementById("heap-array-container");
  const treeContainer = document.getElementById("heap-tree-container");
  const passInfo = document.getElementById("heap-pass-info");

  const prevBtn = document.getElementById("heap-prev-step-btn");
  const nextBtn = document.getElementById("heap-next-step-btn");
  const playBtn = document.getElementById("heap-play-btn");
  const resetBtn = document.getElementById("heap-reset-btn");
  const opError = document.getElementById("heap-op-error");
  const explanationBox = document.getElementById("heap-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;
  let currentHeapType = "max";

  function parseHeapArray() {
    initError.textContent = "";
    opError.textContent = "";

    const sizeVal = sizeInput.value ? parseInt(sizeInput.value, 10) : null;
    let arr;

    const raw = elementsInput.value.trim();
    if (raw.length > 0) {
      const parts = raw
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const nums = parts.map(Number);
      if (nums.some((x) => Number.isNaN(x))) {
        initError.textContent = "All elements must be numeric.";
        return null;
      }

      if (sizeVal && nums.length > sizeVal) {
        initError.textContent =
          `Array size (${sizeVal}) is lower than number of elements entered (${nums.length}).`;
        return null;
      }

      arr = nums;
    } else if (sizeVal) {
      arr = Array.from({ length: sizeVal }, () =>
        Math.floor(Math.random() * 99) + 1
      );
    } else {
      initError.textContent =
        "Provide either a size (for a random array) or a comma-separated list of elements.";
      return null;
    }

    if (arr.length < 2) {
      initError.textContent = "Need at least 2 elements to sort.";
      return null;
    }

    return arr;
  }

  function showStep(index) {
    if (!steps || steps.length === 0) return;
    if (index < 0) index = 0;
    if (index >= steps.length) index = steps.length - 1;

    currentIndex = index;
    const step = steps[currentIndex];

    window.HeapSortVisual.renderHeapState(arrayContainer, treeContainer, step);
    explanationBox.innerText = step.message;

    if (step.type === "build-heap-start") {
      passInfo.innerText =
        currentHeapType === "max"
          ? "Building max-heap from the array."
          : "Building min-heap from the array.";
    } else if (
      step.type === "heapify-start" ||
      step.type === "heapify-compare-left" ||
      step.type === "heapify-compare-right" ||
      step.type === "heapify-swap" ||
      step.type === "heapify-done"
    ) {
      passInfo.innerText = `Heapifying around index ${step.index} for heap size ${step.heapSize}.`;
    } else if (step.type === "build-heap-done") {
      passInfo.innerText =
        currentHeapType === "max"
          ? "Max-heap built; starting extraction of maximum elements."
          : "Min-heap built; starting extraction of minimum elements.";
    } else if (step.type === "extract-swap-root") {
      passInfo.innerText =
        currentHeapType === "max"
          ? `Move current max to index ${step.sortedIndex}; that index is now sorted.`
          : "Processing min element at root; sorted prefix grows from the left.";
    } else if (step.type === "extract-heapified") {
      passInfo.innerText = `Heap restored for reduced heap size ${step.heapSize}.`;
    } else if (step.type === "heap-done") {
      passInfo.innerText = "Heap Sort complete; array is fully sorted.";
    } else if (step.type === "array-insert") {
      passInfo.innerText = `Filling array position ${step.index}.`;
    } else if (step.type === "tree-connect") {
      passInfo.innerText =
        `Connecting node ${step.index} to its parent ${step.parentIndex} in the tree.`;
    } else {
      passInfo.innerText = "";
    }
  }

  function stopPlaying() {
    isPlaying = false;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    playBtn.textContent = "Play";
  }

  function handlePlayPause() {
    if (!steps || steps.length === 0) {
      opError.innerText = "Initialize the array first.";
      return;
    }
    opError.innerText = "";

    if (isPlaying) {
      stopPlaying();
      return;
    }

    isPlaying = true;
    playBtn.textContent = "Pause";

    playTimer = setInterval(() => {
      if (currentIndex >= steps.length - 1) {
        stopPlaying();
        return;
      }
      showStep(currentIndex + 1);
    }, 600);
  }

  function handleReset() {
    stopPlaying();
    steps = [];
    currentIndex = -1;
    passInfo.innerText = "";
    opError.innerText = "";
    arrayContainer.innerHTML = "";
    treeContainer.innerHTML = "";
    explanationBox.innerText =
      "Initialize the array, then start the Heap Sort steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.innerText = "";
    passInfo.innerText = "";

    const arr = parseHeapArray();
    if (!arr) return;

    window.HeapSortVisual.setHeapBaseArray(arr);
    steps = window.HeapSortCore.buildHeapSteps(arr, currentHeapType);
    currentIndex = -1;
    explanationBox.innerText =
      `Array created. Click Next Step or Play to start Heap Sort (${currentHeapType}-heap).`;
    showStep(0);
  }

  function handleNext() {
    if (!steps || steps.length === 0) {
      opError.innerText = "Initialize the array first.";
      return;
    }
    opError.innerText = "";

    if (currentIndex >= steps.length - 1) {
      currentIndex = steps.length - 1;
      showStep(currentIndex);
      return;
    }
    showStep(currentIndex + 1);
  }

  function handlePrev() {
    if (!steps || steps.length === 0) {
      opError.innerText = "Initialize the array first.";
      return;
    }
    opError.innerText = "";

    if (currentIndex <= 0) {
      currentIndex = 0;
      showStep(currentIndex);
      return;
    }
    showStep(currentIndex - 1);
  }

  // Heap type toggle buttons
  maxBtn.addEventListener("click", () => {
    currentHeapType = "max";
    maxBtn.classList.add("heap-type-btn-active");
    minBtn.classList.remove("heap-type-btn-active");
  });

  minBtn.addEventListener("click", () => {
    currentHeapType = "min";
    minBtn.classList.add("heap-type-btn-active");
    maxBtn.classList.remove("heap-type-btn-active");
  });

  initBtn.addEventListener("click", handleInit);
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  playBtn.addEventListener("click", handlePlayPause);
  resetBtn.addEventListener("click", handleReset);

  explanationBox.innerText =
    "Set size (optional), choose Max/Min heap, and/or type numbers, then click Create Array to visualize Heap Sort.";
})();
