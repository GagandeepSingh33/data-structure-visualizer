// visual/mergeAnimate.js
// Renders the array and highlights current subarray and merged positions. [web:179][web:182]

let currentArray = [];
let currentStep = null;

export function setMergeBaseArray(array) {
  currentArray = array.slice();
}

export function getMergeBaseArray() {
  return currentArray.slice();
}

/**
 * step fields:
 * - array
 * - type: "split", "merge-start", "merge-compare", "merge-place-left",
 *         "merge-place-right", "merge-copy-left-rest", "merge-copy-right-rest",
 *         "merge-finished", "single-element", "done"
 * - left, mid, right, i, j, k
 */
export function renderMergeArray(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let index = 0; index < n; index++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[index];

    const inRange =
      step.left != null &&
      step.right != null &&
      index >= step.left &&
      index <= step.right;

    let isActive = false;
    let isSorted = false;

    if (
      step.type === "merge-place-left" ||
      step.type === "merge-place-right" ||
      step.type === "merge-copy-left-rest" ||
      step.type === "merge-copy-right-rest" ||
      step.type === "merge-compare"
    ) {
      if (index === step.k) {
        isActive = true;
      }
    }

    if (step.type === "merge-finished" || step.type === "done") {
      if (step.type === "merge-finished") {
        if (index >= step.left && index <= step.right) {
          isSorted = true;
        }
      } else if (step.type === "done") {
        isSorted = true;
      }
    }

    if (inRange) {
      cell.classList.add("cell-range");
    }
    if (isActive) {
      cell.classList.add("cell-swap");
    }
    if (isSorted) {
      cell.classList.add("cell-sorted");
    }

    containerEl.appendChild(cell);
  }
}
