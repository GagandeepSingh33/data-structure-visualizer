// core/bubbleLogic.js
// Generates a list of steps describing Bubble Sort for visualization. [web:239][web:232]

/**
 * Step shape:
 *  - compare: { type: 'compare', i, j, arraySnapshot, pass }
 *  - swap: { type: 'swap', i, j, arraySnapshot, pass }
 *  - markSorted: { type: 'markSorted', index, arraySnapshot, pass }
 *  - done: { type: 'done', arraySnapshot, pass }
 */
export function generateBubbleSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];
  const n = arr.length;

  let pass = 0;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      // Compare
      steps.push({
        type: "compare",
        i: j,
        j: j + 1,
        arraySnapshot: arr.slice(),
        pass
      });

      if (arr[j] > arr[j + 1]) {
        // Swap in underlying array
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swapped = true;

        // Swap step
        steps.push({
          type: "swap",
          i: j,
          j: j + 1,
          arraySnapshot: arr.slice(),
          pass
        });
      }
    }

    // Mark last element of this pass as sorted
    steps.push({
      type: "markSorted",
      index: n - 1 - i,
      arraySnapshot: arr.slice(),
      pass
    });

    pass++;

    // Early exit: no swaps in this pass
    if (!swapped) {
      break;
    }
  }

  // Done
  steps.push({
    type: "done",
    arraySnapshot: arr.slice(),
    pass
  });

  return steps;
}
