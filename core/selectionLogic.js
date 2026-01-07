// core/selectionLogic.js

export function parseSelectionInput(sizeInputValue, elementsInputValue) {
  const size = parseInt(sizeInputValue, 10);
  if (Number.isNaN(size) || size < 2 || size > 30) {
    return { error: "Size must be a number between 2 and 30." };
  }

  if (!elementsInputValue || elementsInputValue.trim().length === 0) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 99) + 1);
    }
    return { array: arr };
  }

  const parts = elementsInputValue.split(",").map((p) => p.trim());
  if (parts.length !== size) {
    return { error: `You entered ${parts.length} elements but size is ${size}.` };
  }

  const arr = [];
  for (let p of parts) {
    if (p.length === 0) {
      return { error: "Empty values are not allowed in the list." };
    }
    const num = Number(p);
    if (!Number.isFinite(num)) {
      return { error: `Invalid number: "${p}".` };
    }
    arr.push(num);
  }

  return { array: arr };
}

// Build selection sort steps: comparisons, min updates, and swaps.
export function buildSelectionSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    steps.push({
      type: "pass-start",
      i,
      minIndex,
      array: arr.slice(),
      message: `Starting pass ${i + 1}: assume position ${i} is the minimum.`,
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        type: "compare",
        i,
        j,
        minIndex,
        array: arr.slice(),
        message: `Compare element at index ${j} with current minimum at index ${minIndex}.`,
      });

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
        steps.push({
          type: "new-min",
          i,
          j,
          minIndex,
          array: arr.slice(),
          message: `Found new minimum at index ${minIndex}.`,
        });
      }
    }

    if (minIndex !== i) {
      steps.push({
        type: "swap",
        i,
        minIndex,
        array: arr.slice(),
        message: `Swap element at index ${i} with minimum element at index ${minIndex}.`,
      });

      const temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    } else {
      steps.push({
        type: "no-swap",
        i,
        minIndex,
        array: arr.slice(),
        message: `Position ${i} already holds the minimum; no swap needed.`,
      });
    }

    steps.push({
      type: "position-fixed",
      i,
      array: arr.slice(),
      message: `Element at index ${i} is now in its final sorted position.`,
    });
  }

  steps.push({
    type: "done",
    array: arr.slice(),
    message: "Selection Sort completed. All elements are in sorted order.",
  });

  return steps;
}
