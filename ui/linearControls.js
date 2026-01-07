// ui/linearControls.js
import { buildLinearSteps } from "../core/linearLogic.js";
import { setLinearBaseArray, renderLinearState } from "../visual/linearAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  const elementsInput = document.getElementById("linear-elements-input");
  const targetInput = document.getElementById("linear-target-input");
  const initBtn = document.getElementById("linear-init-btn");
  const initError = document.getElementById("linear-init-error");

  const arrayContainer = document.getElementById("linear-array-container");
  const statusText = document.getElementById("linear-status-text");

  const prevBtn = document.getElementById("linear-prev-step-btn");
  const nextBtn = document.getElementById("linear-next-step-btn");
  const playBtn = document.getElementById("linear-play-btn");
  const resetBtn = document.getElementById("linear-reset-btn");
  const opError = document.getElementById("linear-op-error");
  const explanationBox = document.getElementById("linear-explanation-box");

  let steps = [];
  let currentIndex = -1;
  let isPlaying = false;
  let playTimer = null;

  function parseLinearArrayAndTarget() {
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

      arr = nums;
    } else {
      // Generate a small random array when user leaves it empty
      const len = 8;
      arr = Array.from({ length: len }, () =>
        Math.floor(Math.random() * 50) + 1
      );
    }

    return { arr, target };
  }

  function showStep(index) {
    if (!steps || steps.length === 0) return;
    if (index < 0) index = 0;
    if (index >= steps.length) index = steps.length - 1;

    currentIndex = index;
    const step = steps[currentIndex];

    renderLinearState(arrayContainer, step);
    explanationBox.innerText = step.message;

    if (step.type === "init") {
      statusText.innerText = `Searching for target ${step.target} from index 0.`;
    } else if (step.type === "check") {
      statusText.innerText = `Checking index ${step.index} (value ${step.value}) against target ${step.target}.`;
    } else if (step.type === "found") {
      statusText.innerText = `Target ${step.target} found at index ${step.index}.`;
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
      "Enter elements and a target (or leave elements empty for a random array), then start the linear search steps.";
  }

  function handleInit() {
    stopPlaying();
    opError.innerText = "";
    initError.textContent = "";
    statusText.innerText = "";

    const parsed = parseLinearArrayAndTarget();
    if (!parsed) return;

    const { arr, target } = parsed;

    setLinearBaseArray(arr);
    steps = buildLinearSteps(arr, target);
    currentIndex = -1;
    explanationBox.innerText =
      "Array and target set. Click Next Step or Play to run linear search.";
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
    "Enter elements and a target (or leave elements empty for a random array), then click Create Array to visualize linear search.";
});
