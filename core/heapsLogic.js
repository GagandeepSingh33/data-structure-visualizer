// core/heapLogic.js
// Heap operations (min/max), array creation, heapify, and heap sort.

class HeapModel {
  constructor(capacity, heapType = "min") {
    this.capacity = capacity;
    this.storage = new Array(capacity).fill(null);
    this.size = 0;
    this.heapType = heapType; // "min" | "max"
  }

  snapshot() {
    return {
      storage: [...this.storage],
      size: this.size,
      capacity: this.capacity,
      heapType: this.heapType
    };
  }

  _compare(a, b) {
    return this.heapType === "min" ? a < b : a > b;
  }

  _parent(i) {
    if (i === 0) return -1;
    return Math.floor((i - 1) / 2);
  }

  _left(i) {
    return 2 * i + 1;
  }

  _right(i) {
    return 2 * i + 2;
  }

  setHeapType(type) {
    if (type !== "min" && type !== "max") return [];
    this.heapType = type;
    return this.buildHeapSteps(false);
  }

  // Phase 1: create array only
  initWithValues(values) {
    const steps = [];

    steps.push({
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation:
        `Allocating heap array with capacity ${this.capacity}. Values will be placed into the array, but not heapified yet.`
    });

    const count = Math.min(values.length, this.capacity);
    for (let i = 0; i < count; i++) {
      this.storage[i] = values[i];
      this.size = i + 1;

      steps.push({
        type: "addNode",
        indices: [i],
        stateHeap: this.snapshot(),
        explanation:
          `Placed value ${values[i]} at array index ${i}. In the tree this becomes a new node at the next available position.`
      });

      const parent = this._parent(i);
      if (parent >= 0) {
        steps.push({
          type: "connect",
          indices: [parent, i],
          stateHeap: this.snapshot(),
          explanation:
            `Connecting node at index ${parent} to its child at index ${i}, preserving the complete binary tree shape.`
        });
      }
    }

    if (count < values.length) {
      steps.push({
        type: "info",
        indices: [],
        stateHeap: this.snapshot(),
        explanation:
          `Only the first ${count} value(s) fit into the array because capacity is ${this.capacity}.`
      });
    }

    return steps;
  }

  // Phase 2: bottom-up heapify
  buildHeapSteps(initial = false) {
    const steps = [];

    if (this.size === 0) {
      steps.push({
        type: "info",
        indices: [],
        stateHeap: this.snapshot(),
        explanation: "Array is empty, nothing to heapify."
      });
      return steps;
    }

    steps.push({
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation:
        initial
          ? `Now heapify bottom-up to build a ${this.heapType}-heap from the array.`
          : `Rebuilding the array into a ${this.heapType}-heap using bottom-up heapify.`
    });

    for (let i = Math.floor(this.size / 2) - 1; i >= 0; i--) {
      const localSteps = this._heapifyDown(i, true);
      steps.push(...localSteps);
    }

    steps.push({
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation:
        "Heapify finished. Building a heap bottom-up runs in O(n) time."
    });

    return steps;
  }

  _heapifyDown(index, fromBuild) {
    const steps = [];

    while (true) {
      const left = this._left(index);
      const right = this._right(index);
      let best = index;

      const snap = this.snapshot();

      if (left < this.size) {
        steps.push({
          type: "highlight",
          indices: [index, left],
          stateHeap: snap,
          explanation:
            `Compare node at index ${index} (value ${snap.storage[index]}) with left child at index ${left} (value ${snap.storage[left]}).`
        });
        if (this._compare(snap.storage[left], snap.storage[best])) {
          best = left;
        }
      }

      if (right < this.size) {
        const snap2 = this.snapshot();
        steps.push({
          type: "highlight",
          indices: [index, right],
          stateHeap: snap2,
          explanation:
            `Compare node at index ${index} (value ${snap2.storage[index]}) with right child at index ${right} (value ${snap2.storage[right]}).`
        });
        if (this._compare(this.storage[right], this.storage[best])) {
          best = right;
        }
      }

      if (best === index) {
        steps.push({
          type: "info",
          indices: [index],
          stateHeap: this.snapshot(),
          explanation:
            fromBuild
              ? `Node at index ${index} already satisfies the ${this.heapType}-heap property with its children.`
              : `Node at index ${index} is in correct position; bubble-down is done here.`
        });
        break;
      }

      const tmp = this.storage[index];
      this.storage[index] = this.storage[best];
      this.storage[best] = tmp;

      steps.push({
        type: "swap",
        indices: [index, best],
        stateHeap: this.snapshot(),
        explanation:
          `Swapped indices ${index} and ${best} so the ${this.heapType === "min" ? "smaller" : "larger"} value moves closer to the root.`
      });

      index = best;
    }

    return steps;
  }

  _bubbleUp(index, steps) {
    while (index > 0) {
      const parent = this._parent(index);
      const snap = this.snapshot();

      steps.push({
        type: "highlight",
        indices: [index, parent],
        stateHeap: snap,
        explanation:
          `Comparing child at index ${index} (value ${snap.storage[index]}) with parent at index ${parent} (value ${snap.storage[parent]}).`
      });

      if (!this._compare(this.storage[index], this.storage[parent])) {
        steps.push({
          type: "info",
          indices: [index, parent],
          stateHeap: this.snapshot(),
          explanation:
            `Child does not violate the ${this.heapType}-heap property. Bubble-up stops.`
        });
        break;
      }

      const tmp = this.storage[index];
      this.storage[index] = this.storage[parent];
      this.storage[parent] = tmp;

      steps.push({
        type: "swap",
        indices: [index, parent],
        stateHeap: this.snapshot(),
        explanation:
          `Swapped child and parent so the ${this.heapType === "min" ? "smaller" : "larger"} value moves upward in the tree.`
      });

      index = parent;
    }
  }

  insert(value) {
    const steps = [];

    if (this.size === this.capacity) {
      steps.push({
        type: "error",
        indices: [],
        stateHeap: this.snapshot(),
        explanation:
          `Cannot insert: array is full (capacity ${this.capacity}).`
      });
      return { ok: false, steps };
    }

    const idx = this.size;
    this.storage[idx] = value;
    this.size += 1;

    steps.push({
      type: "addNode",
      indices: [idx],
      stateHeap: this.snapshot(),
      explanation:
        `Inserted value ${value} at index ${idx} as a new leaf in the tree.`
    });

    const parent = this._parent(idx);
    if (parent >= 0) {
      steps.push({
        type: "connect",
        indices: [parent, idx],
        stateHeap: this.snapshot(),
        explanation:
          `Connecting new node at index ${idx} to its parent at index ${parent}. Now bubble up if needed.`
      });
    }

    this._bubbleUp(idx, steps);

    steps.push({
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation:
        "Insertion finished. Bubble-up path length is O(log n), so insert runs in O(log n)."
    });

    return { ok: true, steps };
  }

  deleteRoot() {
    const steps = [];

    if (this.size === 0) {
      steps.push({
        type: "error",
        indices: [],
        stateHeap: this.snapshot(),
        explanation: "Cannot delete: heap is empty."
      });
      return { ok: false, steps };
    }

    const rootVal = this.storage[0];
    const lastIndex = this.size - 1;
    const lastVal = this.storage[lastIndex];

    steps.push({
      type: "highlight",
      indices: [0],
      stateHeap: this.snapshot(),
      explanation:
        `Deleting root at index 0 with value ${rootVal}.`
    });

    this.storage[0] = lastVal;
    this.storage[lastIndex] = null;
    this.size -= 1;

    steps.push({
      type: "swap",
      indices: [0, lastIndex],
      stateHeap: this.snapshot(),
      explanation:
        `Moved last element ${lastVal} from index ${lastIndex} to root. Now bubble down to restore the ${this.heapType}-heap property.`
    });

    const local = this._heapifyDown(0, false);
    steps.push(...local);

    steps.push({
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation:
        "Delete-root finished. Bubble-down is O(log n)."
    });

    return { ok: true, steps };
  }

  clear() {
    this.storage.fill(null);
    this.size = 0;
    return [{
      type: "info",
      indices: [],
      stateHeap: this.snapshot(),
      explanation: "Heap cleared. Size is now 0."
    }];
  }

  // Phase 3: heap sort (max-heap on a copy)
  heapSortSteps() {
    const steps = [];
    if (this.size === 0) {
      steps.push({
        type: "error",
        indices: [],
        stateHeap: this.snapshot(),
        explanation: "Cannot run heap sort: array is empty."
      });
      return steps;
    }

    const original = this.snapshot();
    const workArr = original.storage.slice(0, original.size);
    const n = workArr.length;

    const maxCompare = (a, b) => a > b;

    const heapifyDownLocal = (arr, size, index) => {
      while (true) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let largest = index;
        if (left < size && maxCompare(arr[left], arr[largest])) largest = left;
        if (right < size && maxCompare(arr[right], arr[largest])) largest = right;
        if (largest === index) break;
        const tmp = arr[index];
        arr[index] = arr[largest];
        arr[largest] = tmp;
        index = largest;
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapifyDownLocal(workArr, n, i);
    }

    let sortedArr = new Array(n).fill(null);

    steps.push({
      type: "info",
      indices: [],
      stateHeap: { ...original, storage: [...workArr], size: n },
      stateSorted: { storage: [...sortedArr], size: n, capacity: n },
      explanation:
        "Converted the working array into a max-heap. Now repeatedly move the root to the end to build the sorted array."
    });

    let heapSize = n;
    for (let i = n - 1; i >= 0; i--) {
      const tmp = workArr[0];
      workArr[0] = workArr[heapSize - 1];
      workArr[heapSize - 1] = tmp;

      sortedArr[i] = workArr[heapSize - 1];
      heapSize -= 1;

      steps.push({
        type: "heapSortSwap",
        indices: [0, i],
        stateHeap: { ...original, storage: [...workArr], size: heapSize },
        stateSorted: { storage: [...sortedArr], size: n, capacity: n },
        explanation:
          `Moved current maximum ${sortedArr[i]} from the heap root into sorted position ${i}.`
      });

      heapifyDownLocal(workArr, heapSize, 0);

      steps.push({
        type: "heapSortHeapify",
        indices: [0],
        stateHeap: { ...original, storage: [...workArr], size: heapSize },
        stateSorted: { storage: [...sortedArr], size: n, capacity: n },
        explanation:
          "Heapified the remaining prefix so the next maximum element moves to the root."
      });
    }

    steps.push({
      type: "info",
      indices: [],
      stateHeap: { ...original, storage: [...workArr], size: 0 },
      stateSorted: { storage: [...sortedArr], size: n, capacity: n },
      explanation:
        "Heap sort completed. The separate array now holds all elements in sorted order."
    });

    return steps;
  }
}

window.HeapCore = { HeapModel };
