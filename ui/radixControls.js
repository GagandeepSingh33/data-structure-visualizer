// ui/radixControls.js
import { buildRadixSteps } from "../core/radixLogic.js";
import { setRadixBaseArray, renderRadixState } from "../visual/radixAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const sizeInput = document.getElementById("radix-size-input");
  const elementsInput = document.getElementById("radix-elements-input");
  const initBtn = document.getElementById("radix-init-btn");
  const initError = document.getElementById("radix-init-error");

  const arrayContainer = document.getElementById("radix-array-container");
  const bucketContainer = document.getElementById("radix-bucket-container");
  const passInfo = document.getElementById("radix-pass-info");

  const prevBtn = document.getElementById("radix-prev-step-btn");
  const nextBtn = document.getElementById("radix-next-step-btn");
  const playBtn = document.getElementById("radix-play-btn");
  const resetBtn = document.getElementById("radix-reset-btn");
  const opError = document.getElementById("radix-op-error");
  const explanationBox = document.getElementById("radix-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseRadixArray() {
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
        initError.textContent = "Radix Sort here requires non-negative integers.";
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
      // Generate random non-negative integers with up to 3 digits to keep visualization clear
      arr = Array.from({ length: sizeVal }, () =>
        Math.floor(Math.random() * 900) + 10
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

    renderRadixState(arrayContainer, bucketContainer, step);
    explanationBox.innerText = step.message;

    if (
      step.type === "digit-pass-start" ||
      step.type === "digit-read" ||
      step.type === "digit-count-update" ||
      step.type === "digit-prefix-start" ||
      step.type === "digit-prefix-update" ||
      step.type === "digit-build-output-start" ||
      step.type === "digit-place-read" ||
      step.type === "digit-place-write" ||
      step.type === "digit-copy-back-start" ||
      step.type === "digit-copy-back"
    ) {
      const exp = step.exp || 1;
      passInfo.innerText = `Processing digit at exponent ${exp} (1 = units, 10 = tens, 100 = hundreds, ...).`;
    } else if (step.type === "radix-init") {
      passInfo.innerText = "Preparing for Radix Sort digit passes.";
    } else if (step.type === "radix-done") {
      passInfo.innerText = "Radix Sort complete; array is fully sorted.";
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
    bucketContainer.innerHTML = "";
    explanationBox.innerText = "Initialize the array, then start the Radix Sort steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.innerText = "";
    passInfo.innerText = "";

    const arr = parseRadixArray();
    if (!arr) return;

    setRadixBaseArray(arr);
    steps = buildRadixSteps(arr);
    currentIndex = -1;
    explanationBox.innerText = "Array created. Click Next Step or Play to start Radix Sort.";
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
    "Set size (optional) and/or type non-negative integers, then click Create Array to visualize Radix Sort.";
});
