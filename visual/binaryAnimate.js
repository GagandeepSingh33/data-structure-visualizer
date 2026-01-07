// visual/binaryAnimate.js
// Renders the array and highlights low, mid, and high for Binary Search. [web:270][web:273]

let currentArray = [];
let currentStep = null;

export function setBinaryBaseArray(array) {
  currentArray = array.slice();
}

export function getBinaryBaseArray() {
  return currentArray.slice();
}

/**
 * step:
 * - type: "init" | "check-mid" | "move-left" | "move-right" | "found" | "not-found"
 * - array
 * - low, mid, high, target, value
 */
export function renderBinaryState(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[i];

    const withinRange =
      step.low != null &&
      step.high != null &&
      i >= step.low &&
      i <= step.high;

    let isMid = false;
    let isFound = false;

    if (step.mid != null && i === step.mid && step.type !== "not-found") {
      isMid = true;
    }

    if (step.type === "found" && i === step.mid) {
      isFound = true;
    }

    if (withinRange) {
      cell.classList.add("cell-range"); // subtle border for active search window
    }
    if (isMid) {
      cell.classList.add("cell-active"); // current middle being compared
    }
    if (isFound) {
      cell.classList.add("cell-sorted"); // reuse green for "found"
    }

    containerEl.appendChild(cell);
  }
}
