// ui/mergeControls.js
import { buildMergeSteps } from "../core/mergeLogic.js";
import { setMergeBaseArray, renderMergeArray } from "../visual/mergeAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const sizeInput = document.getElementById("merge-size-input");
  const elementsInput = document.getElementById("merge-elements-input");
  const initBtn = document.getElementById("merge-init-btn");
  const initError = document.getElementById("merge-init-error");

  const container = document.getElementById("merge-array-container");
  const passInfo = document.getElementById("merge-pass-info");

  const prevBtn = document.getElementById("merge-prev-step-btn");
  const nextBtn = document.getElementById("merge-next-step-btn");
  const playBtn = document.getElementById("merge-play-btn");
  const resetBtn = document.getElementById("merge-reset-btn");
  const opError = document.getElementById("merge-op-error");
  const explanationBox = document.getElementById("merge-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseMergeArray() {
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

      if (sizeVal) {
        if (nums.length > sizeVal) {
          initError.textContent =
            `You entered ${nums.length} elements but size is ${sizeVal}. ` +
            "Size is a maximum; please enter fewer elements.";
          return null;
        }
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

    renderMergeArray(container, step);
    explanationBox.innerText = step.message;

    if (step.type === "split") {
      passInfo.innerText = `Splitting range [${step.left}, ${step.right}] into halves.`;
    } else if (
      step.type === "merge-start" ||
      step.type === "merge-compare" ||
      step.type === "merge-place-left" ||
      step.type === "merge-place-right" ||
      step.type === "merge-copy-left-rest" ||
      step.type === "merge-copy-right-rest"
    ) {
      passInfo.innerText = `Merging range [${step.left}, ${step.right}].`;
    } else if (step.type === "merge-finished") {
      passInfo.innerText = `Finished merging range [${step.left}, ${step.right}].`;
    } else if (step.type === "single-element") {
      passInfo.innerText = `Single element at index ${step.index} is already sorted.`;
    } else if (step.type === "done") {
      passInfo.innerText = "Merge Sort complete; array is fully sorted.";
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
    container.innerHTML = "";
    explanationBox.innerText = "Initialize the array, then start the Merge Sort steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.innerText = "";
    passInfo.innerText = "";

    const arr = parseMergeArray();
    if (!arr) return;

    setMergeBaseArray(arr);
    steps = buildMergeSteps(arr);
    currentIndex = -1;
    explanationBox.innerText = "Array created. Click Next Step or Play to start Merge Sort.";
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

  initBtn.addEventListener("click", handleInit);
  nextBtn.addEventListener("click", handleNext);
  prevBtn.addEventListener("click", handlePrev);
  playBtn.addEventListener("click", handlePlayPause);
  resetBtn.addEventListener("click", handleReset);

  explanationBox.innerText =
    "Set size (optional) and/or type numbers, then click Create Array to visualize Merge Sort.";
});
