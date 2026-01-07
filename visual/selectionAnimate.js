// visual/selectionAnimate.js

let currentArray = [];
let currentStep = null;

export function setSelectionBaseArray(array) {
  currentArray = array.slice();
}

export function getSelectionBaseArray() {
  return currentArray.slice();
}

export function renderSelectionArray(containerEl, step, fixedCount) {
  currentStep = step;
  containerEl.innerHTML = "";

  const arr = step.array || currentArray;
  const n = arr.length;

  for (let index = 0; index < n; index++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[index];

    let isSorted = false;
    if (step.type === "position-fixed" || step.type === "done") {
      if (step.type === "position-fixed") {
        if (index <= step.i) isSorted = true;
      } else if (step.type === "done") {
        isSorted = true;
      }
    } else if (typeof fixedCount === "number") {
      if (index < fixedCount) isSorted = true;
    }

    if (isSorted) {
      cell.classList.add("cell-sorted");
    }

    if (step.type === "compare" || step.type === "new-min") {
      if (index === step.j) {
        cell.classList.add("cell-active");
      }
      if (index === step.minIndex) {
        cell.classList.add("cell-swap");
      }
    }

    if (step.type === "swap" || step.type === "no-swap") {
      if (index === step.i || index === step.minIndex) {
        cell.classList.add("cell-swap");
      }
    }

    if (step.type === "pass-start") {
      if (index === step.minIndex) {
        cell.classList.add("cell-active");
      }
    }

    containerEl.appendChild(cell);
  }
}
