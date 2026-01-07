// visual/quickAnimate.js
// Renders the array for Quick Sort steps and highlights pivot, comparisons, and swaps. [web:119][web:122]

let currentArray = [];
let currentStep = null;

export function setQuickBaseArray(array) {
  currentArray = array.slice();
}

export function getQuickBaseArray() {
  return currentArray.slice();
}

/**
 * step fields used:
 * - type: "partition-start", "compare", "swap", "keep-in-place",
 *         "pivot-swap", "pivot-fixed", "single-element", "done"
 * - low, high, pivotIndex, pivotNewIndex, i, j, depth, etc.
 * - array: snapshot of current array
 */
export function renderQuickArray(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let index = 0; index < n; index++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[index];

    const inCurrentRange =
      step.low != null &&
      step.high != null &&
      index >= step.low &&
      index <= step.high;

    if (step.type === "pivot-fixed" || step.type === "single-element" || step.type === "done") {
      if (step.type === "pivot-fixed" && index === step.pivotIndex) {
        cell.classList.add("cell-sorted");
      } else if (step.type === "single-element" && index === step.index) {
        cell.classList.add("cell-sorted");
      } else if (step.type === "done") {
        cell.classList.add("cell-sorted");
      }
    }

    if (
      step.type === "partition-start" ||
      step.type === "compare" ||
      step.type === "swap" ||
      step.type === "keep-in-place" ||
      step.type === "pivot-swap"
    ) {
      const pivotIdx =
        step.pivotIndex != null ? step.pivotIndex : step.pivotOldIndex;

      if (index === pivotIdx) {
        cell.classList.add("cell-active");
      }
    }

    if (step.type === "compare") {
      if (index === step.j) {
        cell.classList.add("cell-swap");
      }
    }

    if (step.type === "swap" || step.type === "keep-in-place") {
      if (index === step.i || index === step.j) {
        cell.classList.add("cell-swap");
      }
    }

    if (step.type === "pivot-swap") {
      if (index === step.pivotOldIndex || index === step.pivotNewIndex) {
        cell.classList.add("cell-swap");
      }
    }

    if (inCurrentRange) {
      cell.classList.add("cell-range");
    }

    containerEl.appendChild(cell);
  }
}
