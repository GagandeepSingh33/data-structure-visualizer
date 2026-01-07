// visual/bubbleAnimate.js
// Handles DOM rendering and textual explanation of steps. [web:220][web:218]

/**
 * Renders the current array state into the given container.
 * Expects CSS classes:
 *  .array-cell, .cell-active, .cell-swap, .cell-sorted
 */
export function renderBubbleArray(container, array, options = {}) {
  const {
    activeIndices = [],
    swapIndices = [],
    sortedIndices = []
  } = options;

  container.innerHTML = "";

  array.forEach((value, index) => {
    const cell = document.createElement("div");
    cell.classList.add("array-cell");
    cell.textContent = value;

    if (activeIndices.includes(index)) {
      cell.classList.add("cell-active");
    }
    if (swapIndices.includes(index)) {
      cell.classList.add("cell-swap");
    }
    if (sortedIndices.includes(index)) {
      cell.classList.add("cell-sorted");
    }

    container.appendChild(cell);
  });
}

/**
 * Returns the text for a given step (used for both live explanation and log).
 */
export function getStepText(step) {
  if (!step) return "Initialize the array to start Bubble Sort.";

  switch (step.type) {
    case "compare":
      return `Comparing elements at index ${step.i} and ${step.j}.`;
    case "swap":
      return `Swapping elements at index ${step.i} and ${step.j} because the left one is greater.`;
    case "markSorted":
      return `Element at index ${step.index} is now in its final sorted position.`;
    case "done":
      return "No more swaps are needed; the array is fully sorted.";
    default:
      return "Continuing Bubble Sort.";
  }
}

/**
 * Writes a human-readable explanation for just the current step.
 */
export function explainStep(step, explanationBox) {
  const text = getStepText(step);
  explanationBox.textContent = text;
}
