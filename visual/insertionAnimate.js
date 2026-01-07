// visual/insertionAnimate.js

let currentArray = [];
let currentStep = null;

export function setInsertionBaseArray(array) {
  currentArray = array.slice();
}

export function getInsertionBaseArray() {
  return currentArray.slice();
}

// Render the array and highlight sorted prefix, key, and shifted elements.
export function renderInsertionArray(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let index = 0; index < n; index++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[index];

    // Sorted prefix: indexes < i are sorted after each iteration
    if (step.type === "position-fixed" || step.type === "done") {
      if (step.type === "position-fixed") {
        if (index <= step.i) {
          cell.classList.add("cell-sorted");
        }
      } else if (step.type === "done") {
        cell.classList.add("cell-sorted");
      }
    } else if (typeof step.i === "number" && step.i > 0) {
      if (index < step.i) {
        cell.classList.add("cell-sorted");
      }
    }

    // Highlight key element
    if (
      step.type === "key-select" ||
      step.type === "compare-shift" ||
      step.type === "shifted" ||
      step.type === "insert"
    ) {
      // Key is conceptually at "i" until inserted; after insertion steps, use insertIndex
      if (step.type === "insert") {
        if (index === step.insertIndex) {
          cell.classList.add("cell-active");
        }
      } else {
        if (index === step.i) {
          cell.classList.add("cell-active");
        }
      }
    }

    // Highlight element being compared / shifted
    if (step.type === "compare-shift" || step.type === "shifted") {
      if (index === step.j || index === step.j + 1) {
        cell.classList.add("cell-swap"); // reuse "shifted" style
      }
    }

    containerEl.appendChild(cell);
  }
}
