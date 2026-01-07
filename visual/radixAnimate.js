// visual/radixAnimate.js
// Renders the array and 10 buckets (0–9) for Radix Sort digit passes. [web:159][web:162]

let currentArray = [];
let currentStep = null;

export function setRadixBaseArray(array) {
  currentArray = array.slice();
}

export function getRadixBaseArray() {
  return currentArray.slice();
}

/**
 * Renders:
 * - arrayContainer: current main array state
 * - bucketContainer: buckets 0–9 with highlights for the current digit
 *
 * step fields:
 * - array, count, output
 * - type: "digit-pass-start", "digit-read", "digit-count-update",
 *         "digit-prefix-start", "digit-prefix-update",
 *         "digit-build-output-start", "digit-place-read", "digit-place-write",
 *         "digit-copy-back-start", "digit-copy-back", "radix-init", "radix-done"
 * - exp, base, index, value, digit, pos
 */
export function renderRadixState(arrayContainer, bucketContainer, step) {
  currentStep = step;

  const arr = step.array || currentArray;
  arrayContainer.innerHTML = "";
  bucketContainer.innerHTML = "";

  const base = step.base || 10;

  // Render main array
  for (let i = 0; i < arr.length; i++) {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = arr[i];

    let isActive = false;
    let isSorted = false;

    if (
      step.type === "digit-read" ||
      step.type === "digit-count-update" ||
      step.type === "digit-place-read" ||
      step.type === "digit-place-write" ||
      step.type === "digit-copy-back"
    ) {
      if (i === step.index) {
        isActive = true;
      }
    }

    if (step.type === "radix-done") {
      isSorted = true;
    }

    if (isActive) {
      cell.classList.add("cell-active");
    }
    if (isSorted) {
      cell.classList.add("cell-sorted");
    }

    arrayContainer.appendChild(cell);
  }

  // Render buckets 0–9 for current digit
  const bucketWrapper = document.createElement("div");
  bucketWrapper.className = "radix-buckets";

  for (let d = 0; d < base; d++) {
    const bucket = document.createElement("div");
    bucket.className = "radix-bucket";

    const label = document.createElement("div");
    label.className = "radix-bucket-label";
    label.textContent = d;

    const values = document.createElement("div");
    values.className = "radix-bucket-values";

    let highlightBucket = false;
    if (
      (step.type === "digit-count-update" || step.type === "digit-read") &&
      step.digit === d
    ) {
      highlightBucket = true;
    }
    if (
      (step.type === "digit-place-read" || step.type === "digit-place-write") &&
      step.digit === d
    ) {
      highlightBucket = true;
    }

    if (highlightBucket) {
      bucket.classList.add("cell-swap"); // reuse shifted style for bucket highlight
    }

    bucket.appendChild(label);
    bucket.appendChild(values);
    bucketWrapper.appendChild(bucket);
  }

  bucketContainer.appendChild(bucketWrapper);
}
