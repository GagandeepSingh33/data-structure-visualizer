// core/insertionLogic.js

export function parseInsertionInput(sizeInputValue, elementsInputValue) {
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

// Build insertion sort steps: key selection, comparisons/shifts, and insertion.
export function buildInsertionSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  const n = arr.length;
  // Assume arr[0] is already sorted; start from index 1
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      type: "key-select",
      i,
      j,
      key,
      array: arr.slice(),
      message: `Take element at index ${i} as the key to insert into the sorted left part.`,
    });

    // Shift elements greater than key one position ahead
    while (j >= 0 && arr[j] > key) {
      steps.push({
        type: "compare-shift",
        i,
        j,
        key,
        array: arr.slice(),
        message: `Compare key with element at index ${j}; since ${arr[j]} > ${key}, shift it right.`,
      });

      arr[j + 1] = arr[j];
      steps.push({
        type: "shifted",
        i,
        j,
        key,
        array: arr.slice(),
        message: `Element ${arr[j]} has been shifted from index ${j} to index ${j + 1}.`,
      });

      j--;
    }

    // Insert key at j+1
    steps.push({
      type: "insert",
      i,
      insertIndex: j + 1,
      key,
      array: arr.slice(),
      message: `Insert key ${key} at index ${j + 1} in the sorted part.`,
    });

    arr[j + 1] = key;

    steps.push({
      type: "position-fixed",
      i,
      array: arr.slice(),
      message: `After inserting the key, positions 0 to ${i} form a sorted prefix.`,
    });
  }

  steps.push({
    type: "done",
    array: arr.slice(),
    message: "Insertion Sort completed. All elements are in sorted order.",
  });

  return steps;
}
