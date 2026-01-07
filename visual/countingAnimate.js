// visual/countingAnimate.js
// Renders the input array and the count array for Counting Sort steps. [web:146][web:151]

let currentArray = [];
let currentStep = null;

export function setCountingBaseArray(array) {
  currentArray = array.slice();
}

export function getCountingBaseArray() {
  return currentArray.slice();
}

/**
 * step fields:
 * - array: current main array snapshot
 * - count: current count array snapshot
 * - output: current output array snapshot
 * - type, index, value, countIndex, pos, etc.
 */
export function renderCountingState(arrayContainer, countContainer, step) {
  currentStep = step;

  const arr = step.array || currentArray;
  const countArr = step.count || [];
  arrayContainer.innerHTML = "";
  countContainer.innerHTML = "";

  // Render main array
  for (let i = 0; i < arr.length; i++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[i];

    let isActive = false;
    let isSorted = false;

    if (
      step.type === "count-read" ||
      step.type === "count-update" ||
      step.type === "place-read" ||
      step.type === "place-write"
    ) {
      if (i === step.index) isActive = true;
    }

    if (step.type === "copy-back" || step.type === "done") {
      if (i <= step.index || step.type === "done") {
        isSorted = true;
      }
    }

    if (isActive) {
      cell.classList.add("cell-active");
    }
    if (isSorted) {
      cell.classList.add("cell-sorted");
    }

    arrayContainer.appendChild(cell);
  }

  // Render count array
  for (let value = 0; value < countArr.length; value++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = `${value}:${countArr[value]}`;

    let isShift = false;

    if (
      step.type === "count-update" &&
      step.value === value
    ) {
      isShift = true;
    }

    if (
      step.type === "prefix-update" &&
      step.countIndex === value
    ) {
      isShift = true;
    }

    if (
      step.type === "place-write" &&
      step.value === value
    ) {
      isShift = true;
    }

    if (isShift) {
      cell.classList.add("cell-swap"); // reuse "shifted" style
    }

    countContainer.appendChild(cell);
  }
}
