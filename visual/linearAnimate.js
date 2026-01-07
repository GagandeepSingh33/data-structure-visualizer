// visual/linearAnimate.js
// Renders the array and highlights the current index and found element. [web:235][web:259]

let currentArray = [];
let currentStep = null;

export function setLinearBaseArray(array) {
  currentArray = array.slice();
}

export function getLinearBaseArray() {
  return currentArray.slice();
}

/**
 * step:
 * - type: "init" | "check" | "found" | "not-found"
 * - array
 * - index (for check/found)
 * - target
 */
export function renderLinearState(containerEl, step) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[i];

    let isActive = false;
    let isFound = false;

    if (step.type === "check" && i === step.index) {
      isActive = true;
    }
    if (step.type === "found" && i === step.index) {
      isFound = true;
    }

    if (isActive) {
      cell.classList.add("cell-active");
    }
    if (isFound) {
      cell.classList.add("cell-sorted"); // reuse green style for “found”
    }

    containerEl.appendChild(cell);
  }
}
