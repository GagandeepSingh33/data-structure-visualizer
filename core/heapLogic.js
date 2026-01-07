// core/heapSortLogic.js
// Builds step-by-step trace for Heap Sort using a max- or min-heap,
// including array build + tree connect phase.

(function () {
  function buildHeapSteps(initialArray, heapType) {
    // start with all nulls so we can animate filling the array
    const arr = new Array(initialArray.length).fill(null);
    const steps = [];
    const n = initialArray.length;

    // Phase 0: build array and tree shape incrementally
    for (let i = 0; i < n; i++) {
      arr[i] = initialArray[i];

      steps.push({
        type: "array-insert",
        heapType,
        index: i,
        array: arr.slice(),
        message: `Place value ${initialArray[i]} into array index ${i}.`
      });

      const parent = i === 0 ? -1 : Math.floor((i - 1) / 2);
      if (parent >= 0) {
        steps.push({
          type: "tree-connect",
          heapType,
          index: i,
          parentIndex: parent,
          array: arr.slice(),
          message: `Connect node at index ${i} as a child of index ${parent}, forming the complete binary tree.`
        });
      }
    }

    const better = heapType === "max"
      ? (a, b) => a > b
      : (a, b) => a < b;

    function record(type, details) {
      steps.push({
        type,
        heapType,
        ...details,
        array: arr.slice()
      });
    }

    function heapify(nHeapSize, i) {
      let best = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      record("heapify-start", {
        heapSize: nHeapSize,
        index: i,
        left,
        right,
        bestIndex: best,
        message: `Heapify node at index ${i} for heap size ${nHeapSize} (${heapType}-heap).`
      });

      if (left < nHeapSize) {
        record("heapify-compare-left", {
          heapSize: nHeapSize,
          index: i,
          left,
          right,
          bestIndex: best,
          message: `Compare left child at index ${left} (${arr[left]}) with current best at index ${best} (${arr[best]}).`
        });
        if (better(arr[left], arr[best])) {
          best = left;
        }
      }

      if (right < nHeapSize) {
        record("heapify-compare-right", {
          heapSize: nHeapSize,
          index: i,
          left,
          right,
          bestIndex: best,
          message: `Compare right child at index ${right} (${arr[right]}) with current best at index ${best} (${arr[best]}).`
        });
        if (better(arr[right], arr[best])) {
          best = right;
        }
      }

      if (best !== i) {
        const temp = arr[i];
        arr[i] = arr[best];
        arr[best] = temp;

        record("heapify-swap", {
          heapSize: nHeapSize,
          index: i,
          swapIndex: best,
          message: `Swap elements at indices ${i} and ${best} to maintain ${heapType}-heap property.`
        });

        heapify(nHeapSize, best);
      } else {
        record("heapify-done", {
          heapSize: nHeapSize,
          index: i,
          message: `Node at index ${i} already satisfies the ${heapType}-heap property.`
        });
      }
    }

    // Step 1: Build heap
    record("build-heap-start", {
      heapSize: n,
      message: `Start building ${heapType}-heap from the bottom non-leaf nodes.`
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    record("build-heap-done", {
      heapSize: n,
      message: `${heapType === "max" ? "Max" : "Min"}-heap built; root holds the extreme element.`
    });

    // Step 2: Extract elements
    if (heapType === "max") {
      for (let end = n - 1; end > 0; end--) {
        const temp = arr[0];
        arr[0] = arr[end];
        arr[end] = temp;

        record("extract-swap-root", {
          heapSize: end,
          sortedIndex: end,
          message: `Swap extreme element at root (index 0) with element at index ${end}; index ${end} is now in final sorted position.`
        });

        heapify(end, 0);

        record("extract-heapified", {
          heapSize: end,
          sortedIndex: end,
          message: `Heapify root for reduced heap size ${end}.`
        });
      }
    } else {
      for (let start = 0; start < n - 1; start++) {
        const temp = arr[0];
        arr[0] = arr[n - 1 - start];
        arr[n - 1 - start] = temp;

        record("extract-swap-root", {
          heapSize: n - 1 - start,
          sortedIndex: start,
          message: `Swap min at root with element at index ${n - 1 - start}; sorted prefix grows from the left.`
        });

        heapify(n - 1 - start, 0);

        record("extract-heapified", {
          heapSize: n - 1 - start,
          sortedIndex: start,
          message: `Heapify root for reduced heap size ${n - 1 - start}.`
        });
      }
    }

    steps.push({
      type: "heap-done",
      heapType,
      array: arr.slice(),
      message: "Heap Sort completed. All elements are sorted."
    });

    return steps;
  }

  window.HeapSortCore = {
    buildHeapSteps
  };
})();
