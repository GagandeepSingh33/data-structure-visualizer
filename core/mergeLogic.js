// core/mergeLogic.js
// Builds a step-by-step trace for Merge Sort: recursive splits and merges. [web:173][web:177]

export function buildMergeSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  function record(type, details) {
    steps.push({
      type,
      ...details,
      array: arr.slice()
    });
  }

  function merge(left, mid, right, depth) {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    record("merge-start", {
      left,
      mid,
      right,
      depth,
      leftArray: L.slice(),
      rightArray: R.slice(),
      message: `Merging two sorted halves: [${left}, ${mid}] and [${mid + 1}, ${right}].`,
    });

    let i = 0;
    let j = 0;
    let k = left;

    while (i < n1 && j < n2) {
      record("merge-compare", {
        left,
        mid,
        right,
        depth,
        i,
        j,
        k,
        leftValue: L[i],
        rightValue: R[j],
        message: `Compare left value ${L[i]} and right value ${R[j]}.`,
      });

      if (L[i] <= R[j]) {
        arr[k] = L[i];
        record("merge-place-left", {
          left,
          mid,
          right,
          depth,
          i,
          j,
          k,
          value: L[i],
          message: `Place ${L[i]} from left temporary array at index ${k}.`,
        });
        i++;
      } else {
        arr[k] = R[j];
        record("merge-place-right", {
          left,
          mid,
          right,
          depth,
          i,
          j,
          k,
          value: R[j],
          message: `Place ${R[j]} from right temporary array at index ${k}.`,
        });
        j++;
      }
      k++;
    }

    while (i < n1) {
      arr[k] = L[i];
      record("merge-copy-left-rest", {
        left,
        mid,
        right,
        depth,
        i,
        k,
        value: L[i],
        message: `Copy remaining left value ${L[i]} to index ${k}.`,
      });
      i++;
      k++;
    }

    while (j < n2) {
      arr[k] = R[j];
      record("merge-copy-right-rest", {
        left,
        mid,
        right,
        depth,
        j,
        k,
        value: R[j],
        message: `Copy remaining right value ${R[j]} to index ${k}.`,
      });
      j++;
      k++;
    }

    record("merge-finished", {
      left,
      mid,
      right,
      depth,
      message: `Finished merging range [${left}, ${right}].`,
    });
  }

  function mergeSort(left, right, depth) {
    if (left >= right) {
      if (left === right) {
        steps.push({
          type: "single-element",
          left,
          right,
          index: left,
          depth,
          array: arr.slice(),
          message: `Single element at index ${left} is already sorted.`,
        });
      }
      return;
    }

    const mid = Math.floor((left + right) / 2);

    steps.push({
      type: "split",
      left,
      mid,
      right,
      depth,
      array: arr.slice(),
      message: `Split range [${left}, ${right}] into [${left}, ${mid}] and [${mid + 1}, ${right}].`,
    });

    mergeSort(left, mid, depth + 1);
    mergeSort(mid + 1, right, depth + 1);
    merge(left, mid, right, depth);
  }

  mergeSort(0, arr.length - 1, 0);

  steps.push({
    type: "done",
    array: arr.slice(),
    message: "Merge Sort completed. All elements are sorted.",
  });

  return steps;
}
