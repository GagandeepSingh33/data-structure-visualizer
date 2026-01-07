// visual/shellAnimate.js
// Renders the array for Shell Sort steps and highlights gap comparisons and shifts. [web:95][web:102]

let currentArray = [];
let currentStep = null;

export function setShellBaseArray(array) {
  currentArray = array.slice();
}

export function getShellBaseArray() {
  return currentArray.slice();
}

/**
 * step fields used:
 * - type: "gap-start", "gap-key-select", "gap-compare", "gap-shift", "gap-insert", "gap-position-fixed", "done"
 * - gap: current gap size
 * - i: outer index being processed
 * - j, compareIndex, fromIndex, toIndex, insertIndex: indices for highlighting
 * - array: snapshot array at this step
 */
export function renderShellArray(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let index = 0; index < n; index++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[index];

    // Treat it like "gap-sorted" highlighting:
    // Once type is gap-position-fixed or done, you can mark up to i as partially sorted for this gap.
    if (step.type === "gap-position-fixed") {
      if (index <= step.i) {
        cell.classList.add("cell-sorted");
      }
    } else if (step.type === "done") {
      cell.classList.add("cell-sorted");
    }

    // Highlight key element (the one being gap-inserted).
    if (
      step.type === "gap-key-select" ||
      step.type === "gap-compare" ||
      step.type === "gap-shift" ||
      step.type === "gap-insert"
    ) {
      if (step.type === "gap-insert") {
        if (index === step.insertIndex) {
          cell.classList.add("cell-active");
        }
      } else {
        if (index === step.i) {
          cell.classList.add("cell-active");
        }
      }
    }

    // Highlight comparison and shift indices as "shifted" using swap style. [web:95][web:106]
    if (step.type === "gap-compare") {
      if (index === step.compareIndex || index === step.j) {
        cell.classList.add("cell-swap");
      }
    }

    if (step.type === "gap-shift") {
      if (index === step.fromIndex || index === step.toIndex) {
        cell.classList.add("cell-swap");
      }
    }

    // For gap-start, lightly highlight every gap-th element as a visual hint (optional)
    if (step.type === "gap-start") {
      if (step.gap > 0 && index % step.gap === 0) {
        cell.classList.add("cell-active");
      }
    }

    containerEl.appendChild(cell);
  }
}
