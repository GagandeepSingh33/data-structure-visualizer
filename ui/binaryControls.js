// ui/binaryControls.js
import { buildBinarySteps } from "../core/binaryLogic.js";
import { setBinaryBaseArray, renderBinaryState } from "../visual/binaryAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const elementsInput = document.getElementById("binary-elements-input");
  const targetInput = document.getElementById("binary-target-input");
  const initBtn = document.getElementById("binary-init-btn");
  const initError = document.getElementById("binary-init-error");

  const arrayContainer = document.getElementById("binary-array-container");
  const statusText = document.getElementById("binary-status-text");

  const prevBtn = document.getElementById("binary-prev-step-btn");
  const nextBtn = document.getElementById("binary-next-step-btn");
  const playBtn = document.getElementById("binary-play-btn");
  const resetBtn = document.getElementById("binary-reset-btn");
  const opError = document.getElementById("binary-op-error");
  const explanationBox = document.getElementById("binary-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseBinaryArrayAndTarget() {
    initError.textContent = "";
    opError.textContent = "";
    statusText.textContent = "";

    // Target is required
    const targetRaw = targetInput.value.trim();
    if (!targetRaw.length) {
      initError.textContent = "Please enter a target value.";
      return null;
    }
    const target = Number(targetRaw);
    if (Number.isNaN(target)) {
      initError.textContent = "Target must be numeric.";
      return null;
    }

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

      if (nums.length < 2) {
        initError.textContent = "Enter at least 2 elements for a meaningful search.";
        return null;
      }

      // Ensure sorted for valid binary search
      arr = nums.slice().sort((a, b) => a - b);
    } else {
      // Generate a small random sorted array when user leaves it empty
      const len = 10;
      const randomArr = Array.from({ length: len }, () =>
        Math.floor(Math.random() * 60) + 1
      );
      randomArr.sort((a, b) => a - b);
      arr = randomArr;
    }

    return { arr, target };
  }

  function showStep(index) {
    if (!steps || steps.length === 0) return;
    if (index < 0) index = 0;
    if (index >= steps.length) index = steps.length - 1;

    currentIndex = index;
    const step = steps[currentIndex];

    renderBinaryState(arrayContainer, step);
    explanationBox.innerText = step.message;

    if (step.type === "init") {
      statusText.innerText = `Searching for target ${step.target} (low = ${step.low}, high = ${step.high}).`;
    } else if (step.type === "check-mid") {
      statusText.innerText =
        `Mid index ${step.mid} has value ${step.value}; ` +
        `compare with target ${step.target}.`;
    } else if (step.type === "move-left") {
      statusText.innerText =
        `Target is smaller than ${step.array[step.mid]}; new search range is ` +
        `[${step.low}, ${step.high}].`;
    } else if (step.type === "move-right") {
      statusText.innerText =
        `Target is greater than ${step.array[step.mid]}; new search range is ` +
        `[${step.low}, ${step.high}].`;
    } else if (step.type === "found") {
      statusText.innerText = `Target ${step.target} found at index ${step.mid}.`;
    } else if (step.type === "not-found") {
      statusText.innerText = `Target ${step.target} not found in the array.`;
    } else {
      statusText.innerText = "";
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
      opError.innerText = "Initialize the array and target first.";
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
    arrayContainer.innerHTML = "";
    statusText.innerText = "";
    opError.innerText = "";
    initError.textContent = "";
    explanationBox.innerText =
      "Enter a sorted array and target (or leave elements empty for a random sorted array), then start the binary search steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.textContent = "";
    statusText.innerText = "";

    const parsed = parseBinaryArrayAndTarget();
    if (!parsed) return;

    const { arr, target } = parsed;

    setBinaryBaseArray(arr);
    steps = buildBinarySteps(arr, target);
    currentIndex = -1;
    explanationBox.innerText =
      "Array and target set. Click Next Step or Play to run binary search.";
    showStep(0);
  }

  function handleNext() {
    if (!steps || steps.length === 0) {
      opError.innerText = "Initialize the array and target first.";
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
      opError.innerText = "Initialize the array and target first.";
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
    "Enter a sorted array and target (or leave elements empty for a random sorted array), then click Create Array to visualize binary search.";
});
