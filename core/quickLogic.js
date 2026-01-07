// core/quickLogic.js
// Builds a step-by-step trace of Quick Sort using Lomuto partition. [web:114][web:131]

export function buildQuickSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  function record(type, details) {
    steps.push({
      type,
      ...details,
      array: arr.slice()
    });
  }

  function partition(low, high, depth) {
    const pivot = arr[high];

    record("partition-start", {
      low,
      high,
      pivotIndex: high,
      pivot,
      depth,
      message: `Starting partition from index ${low} to ${high} with pivot = ${pivot} at index ${high}.`
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      record("compare", {
        low,
        high,
        i,
        j,
        pivotIndex: high,
        pivot,
        depth,
        message: `Compare element at index ${j} (${arr[j]}) with pivot ${pivot}.`
      });

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          record("swap", {
            low,
            high,
            i,
            j,
            pivotIndex: high,
            pivot,
            depth,
            message: `Swap elements at indices ${i} and ${j} to keep values ≤ pivot on the left.`
          });
        } else {
          record("keep-in-place", {
            low,
            high,
            i,
            j,
            pivotIndex: high,
            pivot,
            depth,
            message: `Element at index ${j} is ≤ pivot and already in the left region.`
          });
        }
      }
    }

    const pivotNewIndex = i + 1;
    const temp = arr[pivotNewIndex];
    arr[pivotNewIndex] = arr[high];
    arr[high] = temp;

    record("pivot-swap", {
      low,
      high,
      pivotOldIndex: high,
      pivotNewIndex,
      pivot: arr[pivotNewIndex],
      depth,
      message: `Move pivot to index ${pivotNewIndex}; all elements left are ≤ pivot, all right are > pivot.`
    });

    record("pivot-fixed", {
      low,
      high,
      pivotIndex: pivotNewIndex,
      pivot: arr[pivotNewIndex],
      depth,
      message: `Pivot at index ${pivotNewIndex} is now in its final sorted position.`
    });

    return pivotNewIndex;
  }

  function quickSort(low, high, depth) {
    if (low < high) {
      const p = partition(low, high, depth);

      quickSort(low, p - 1, depth + 1);
      quickSort(p + 1, high, depth + 1);
    } else if (low === high) {
      steps.push({
        type: "single-element",
        low,
        high,
        index: low,
        depth,
        array: arr.slice(),
        message: `Single element at index ${low} is already sorted.`
      });
    }
  }

  quickSort(0, arr.length - 1, 0);

  steps.push({
    type: "done",
    array: arr.slice(),
    message: "Quick Sort completed. All elements are sorted."
  });

  return steps;
}
