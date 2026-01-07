// ui/bubbleControls.js
// Wires inputs + buttons to logic and visualization, and builds a step log. [web:223][web:242]

import { generateBubbleSteps } from "../core/bubbleLogic.js";
import {
  renderBubbleArray,
  explainStep,
  getStepText
} from "../visual/bubbleAnimate.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inputs
  const sizeInput = document.getElementById("bubble-size-input");
  const elementsInput = document.getElementById("bubble-elements-input");
  const initBtn = document.getElementById("bubble-init-btn");
  const initError = document.getElementById("bubble-init-error");

  // Visualization elements
  const container = document.getElementById("bubble-array-container");
  const passInfo = document.getElementById("bubble-pass-info");
  const explanationBox = document.getElementById("bubble-explanation-box");
  const opError = document.getElementById("bubble-op-error");

  // Control buttons
  const prevBtn = document.getElementById("bubble-prev-step-btn");
  const nextBtn = document.getElementById("bubble-next-step-btn");
  const playBtn = document.getElementById("bubble-play-btn");
  const resetBtn = document.getElementById("bubble-reset-btn");

  // State
  let originalArray = [];
  let steps = [];
  let currentIndex = -1;
  let playTimer = null;
  let explanationLog = [];

  function clearTimers() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
      playBtn.textContent = "Play";
    }
  }

  function resetState() {
    clearTimers();
    steps = [];
    currentIndex = -1;
    passInfo.textContent = "";
    opError.textContent = "";
    explanationLog = [];
    renderBubbleArray(container, originalArray || [], {});
    explanationBox.textContent = "Initialize the array to start Bubble Sort.";
  }

  function parseArrayFromInputs() {
    initError.textContent = "";
    opError.textContent = "";

    const sizeVal = sizeInput.value ? parseInt(sizeInput.value, 10) : null;
    let arr;

    // If user typed explicit elements, always trust that list.
    if (elementsInput.value.trim().length > 0) {
      arr = elementsInput.value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);

      if (arr.some((x) => Number.isNaN(x))) {
        initError.textContent = "All elements must be numeric.";
        return null;
      }
    } else if (sizeVal) {
      // Generate random array from size
      arr = Array.from({ length: sizeVal }, () =>
        Math.floor(Math.random() * 99) + 1
      );
    } else {
      initError.textContent =
        "Provide either a size or a comma-separated list of elements.";
      return null;
    }

    if (arr.length < 2) {
      initError.textContent = "Need at least 2 elements to sort.";
      return null;
    }

    return arr;
  }

  function computeSortedIndices(step) {
    const sortedIndices = [];
    if (!step || step.pass == null) return sortedIndices;

    const arrayLength =
      (step.arraySnapshot && step.arraySnapshot.length) ||
      (originalArray && originalArray.length) ||
      0;

    const lastSorted = arrayLength - 1;
    const firstSorted = Math.max(0, arrayLength - 1 - step.pass);

    for (let i = firstSorted; i <= lastSorted; i++) {
      sortedIndices.push(i);
    }

    if (step.type === "markSorted" && !sortedIndices.includes(step.index)) {
      sortedIndices.push(step.index);
    }

    return sortedIndices;
  }

  function refreshExplanationBox(stepIndex) {
    const step = steps[stepIndex];

    // Live explanation for current step
    explainStep(step, explanationBox);

    // Push to log
    const line = getStepText(step);
    explanationLog.push(line);

    // If last step -> show full log, one step per line
    if (stepIndex === steps.length - 1) {
      explanationBox.innerHTML = explanationLog
        .map((txt) => `<div>${txt}</div>`)
        .join("");
    }
  }

  function updateViewForStep(stepIndex) {
    if (!steps.length) return;
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex >= steps.length) stepIndex = steps.length - 1;

    currentIndex = stepIndex;
    const step = steps[stepIndex];
    const array = step.arraySnapshot || originalArray.slice();

    const activeIndices = [];
    const swapIndices = [];

    if (step.type === "compare") {
      activeIndices.push(step.i, step.j);
    } else if (step.type === "swap") {
      swapIndices.push(step.i, step.j);
    }

    const sortedIndices = computeSortedIndices(step);

    renderBubbleArray(container, array, {
      activeIndices,
      swapIndices,
      sortedIndices
    });

    refreshExplanationBox(stepIndex);

    if (step.pass != null) {
      passInfo.textContent = `Current pass: ${step.pass + 1}`;
    } else {
      passInfo.textContent = "";
    }
  }

  // Event handlers
  initBtn.addEventListener("click", () => {
    const arr = parseArrayFromInputs();
    if (!arr) return;

    clearTimers();
    originalArray = arr.slice();
    steps = generateBubbleSteps(originalArray);
    currentIndex = -1;
    explanationLog = [];

    renderBubbleArray(container, originalArray, {});
    explanationBox.textContent = "Array initialized. Click Next Step or Play.";
    passInfo.textContent = "Array initialized. Click Next Step or Play.";
  });

  nextBtn.addEventListener("click", () => {
    if (!steps.length) {
      opError.textContent = "Initialize the array first.";
      return;
    }
    if (currentIndex >= steps.length - 1) return;
    updateViewForStep(currentIndex + 1);
  });

  prevBtn.addEventListener("click", () => {
    if (!steps.length) {
      opError.textContent = "Initialize the array first.";
      return;
    }

    // Going back does not rewind the log; this keeps it simple.
    if (currentIndex <= 0) {
      currentIndex = -1;
      renderBubbleArray(container, originalArray, {});
      explanationBox.textContent = "Back to initial array.";
      passInfo.textContent = "Back to initial array.";
      return;
    }
    updateViewForStep(currentIndex - 1);
  });

  playBtn.addEventListener("click", () => {
    if (!steps.length) {
      opError.textContent = "Initialize the array first.";
      return;
    }

    if (playTimer) {
      clearTimers();
      return;
    }

    playBtn.textContent = "Pause";
    playTimer = setInterval(() => {
      if (currentIndex >= steps.length - 1) {
        clearTimers();
        return;
      }
      updateViewForStep(currentIndex + 1);
    }, 700); // animation speed
  });

  resetBtn.addEventListener("click", () => {
    resetState();
  });

  // Initial render
  resetState();
});
