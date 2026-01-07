// ui/shellControls.js
import { buildShellSteps } from "../core/shellLogic.js";
import { setShellBaseArray, renderShellArray } from "../visual/shellAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const sizeInput = document.getElementById("shell-size-input");
  const elementsInput = document.getElementById("shell-elements-input");
  const initBtn = document.getElementById("shell-init-btn");
  const initError = document.getElementById("shell-init-error");

  const container = document.getElementById("shell-array-container");
  const passInfo = document.getElementById("shell-pass-info");

  const prevBtn = document.getElementById("shell-prev-step-btn");
  const nextBtn = document.getElementById("shell-next-step-btn");
  const playBtn = document.getElementById("shell-play-btn");
  const resetBtn = document.getElementById("shell-reset-btn");
  const opError = document.getElementById("shell-op-error");
  const explanationBox = document.getElementById("shell-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseShellArray() {
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

    renderShellArray(container, step);
    explanationBox.innerText = step.message;

    if (step.type === "gap-start") {
      passInfo.innerText = `Starting pass with gap = ${step.gap}.`;
    } else if (step.type === "done") {
      passInfo.innerText = "All passes complete; gap has reached 1 and the array is sorted.";
    } else if (typeof step.gap === "number") {
      passInfo.innerText = `Current gap: ${step.gap}.`;
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
    explanationBox.innerText = "Initialize the array, then start the Shell Sort steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.innerText = "";
    passInfo.innerText = "";

    const arr = parseShellArray();
    if (!arr) return;

    setShellBaseArray(arr);
    steps = buildShellSteps(arr);
    currentIndex = -1;
    explanationBox.innerText = "Array created. Click Next Step or Play to start Shell Sort.";
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
    "Set size (optional) and/or type numbers, then click Create Array to visualize Shell Sort.";
});
