// ui/countingControls.js
import { buildCountingSteps } from "../core/countingLogic.js";
import { setCountingBaseArray, renderCountingState } from "../visual/countingAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const sizeInput = document.getElementById("counting-size-input");
  const elementsInput = document.getElementById("counting-elements-input");
  const initBtn = document.getElementById("counting-init-btn");
  const initError = document.getElementById("counting-init-error");

  const arrayContainer = document.getElementById("counting-array-container");
  const countContainer = document.getElementById("counting-count-container");
  const passInfo = document.getElementById("counting-pass-info");

  const prevBtn = document.getElementById("counting-prev-step-btn");
  const nextBtn = document.getElementById("counting-next-step-btn");
  const playBtn = document.getElementById("counting-play-btn");
  const resetBtn = document.getElementById("counting-reset-btn");
  const opError = document.getElementById("counting-op-error");
  const explanationBox = document.getElementById("counting-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseCountingArray() {
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

      if (nums.some((x) => x < 0 || !Number.isInteger(x))) {
        initError.textContent = "Counting Sort requires non-negative integers.";
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
        Math.floor(Math.random() * 10) // keep range small for Counting Sort visualization
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

    renderCountingState(arrayContainer, countContainer, step);
    explanationBox.innerText = step.message;

    if (
      step.type === "count-read" ||
      step.type === "count-update"
    ) {
      passInfo.innerText = "Counting frequency of each value.";
    } else if (
      step.type === "prefix-start" ||
      step.type === "prefix-update"
    ) {
      passInfo.innerText = "Building prefix sums in the count array.";
    } else if (
      step.type === "build-output-start" ||
      step.type === "place-read" ||
      step.type === "place-write"
    ) {
      passInfo.innerText = "Placing elements into the output array using counts.";
    } else if (
      step.type === "copy-back-start" ||
      step.type === "copy-back"
    ) {
      passInfo.innerText = "Copying sorted output back into the original array.";
    } else if (step.type === "done") {
      passInfo.innerText = "Counting Sort complete; array is sorted.";
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
    countContainer.innerHTML = "";
    explanationBox.innerText = "Initialize the array, then start the Counting Sort steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.innerText = "";
    passInfo.innerText = "";

    const arr = parseCountingArray();
    if (!arr) return;

    setCountingBaseArray(arr);
    steps = buildCountingSteps(arr);
    currentIndex = -1;
    explanationBox.innerText = "Array created. Click Next Step or Play to start Counting Sort.";
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
    "Set size (optional) and/or type non-negative integers, then click Create Array to visualize Counting Sort.";
});
