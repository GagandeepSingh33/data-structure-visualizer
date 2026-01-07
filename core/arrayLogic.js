// core/arrayLogic.js
// Pure array operations + step generation. No DOM code.

/*
Step structure examples:
{
  type: "allocate",
  target: "old" | "new",
  stateOld: snapshotOld,
  stateNew: snapshotNew,
  explanation: "..."
}
*/

class ArrayModel {
  constructor(capacity) {
    this.capacity = capacity;
    this.storage = new Array(capacity).fill(null);
    this.length = 0;
  }

  snapshot() {
    return {
      storage: [...this.storage],
      length: this.length,
      capacity: this.capacity
    };
  }

  // Initialization with step-by-step creation
  initWithValues(values) {
    const steps = [];

    steps.push({
      type: "allocate",
      target: "old",
      stateOld: this.snapshot(),
      explanation: `Allocating a fixed-size array of capacity ${this.capacity}.`
    });

    const count = Math.min(values.length, this.capacity);
    for (let i = 0; i < count; i++) {
      steps.push({
        type: "highlight",
        target: "old",
        indices: [i],
        stateOld: this.snapshot(),
        explanation: `Preparing to place value ${values[i]} at index ${i}.`
      });

      this.storage[i] = values[i];
      this.length = i + 1;

      steps.push({
        type: "write",
        target: "old",
        indices: [i],
        stateOld: this.snapshot(),
        explanation: `Stored value ${values[i]} at index ${i}. Now length is ${this.length}.`
      });
    }

    if (count < values.length) {
      steps.push({
        type: "info",
        target: "old",
        stateOld: this.snapshot(),
        explanation: `Only the first ${count} values fit; the array capacity is ${this.capacity}.`
      });
    }

    return steps;
  }

  // Helper: linear search by value (for access/delete-by-value)
  searchByValue(value) {
    const steps = [];
    for (let i = 0; i < this.length; i++) {
      steps.push({
        type: "highlight",
        target: "old",
        indices: [i],
        stateOld: this.snapshot(),
        explanation: `Checking index ${i}: is ${this.storage[i]} equal to ${value}?`
      });
      if (this.storage[i] === value) {
        const visited = i + 1;
        steps.push({
          type: "info",
          target: "old",
          indices: [i],
          stateOld: this.snapshot(),
          explanation: `Found ${value} at index ${i} after checking ${visited} position(s). This is linear search: O(n) in the worst case.`
        });
        return { index: i, steps, found: true };
      }
    }
    steps.push({
      type: "invalidIndex",
      target: "old",
      indices: [],
      stateOld: this.snapshot(),
      explanation: `Value ${value} not found after scanning all ${this.length} element(s). This is O(n).`
    });
    return { index: -1, steps, found: false };
  }

  // Access by index or value
  access({ index, value }) {
    const steps = [];

    // Access by index
    if (index != null) {
      if (!Number.isInteger(index) || index < 0 || index >= this.length) {
        steps.push({
          type: "invalidIndex",
          target: "old",
          indices: [index],
          stateOld: this.snapshot(),
          explanation: `Index ${index} is out of bounds for current length ${this.length}.`
        });
        return { ok: false, steps, result: null };
      }

      steps.push({
        type: "highlight",
        target: "old",
        indices: [index],
        stateOld: this.snapshot(),
        explanation: `Accessing element at index ${index} using direct index-based addressing (O(1)).`
      });

      const val = this.storage[index];
      steps.push({
        type: "info",
        target: "old",
        indices: [index],
        stateOld: this.snapshot(),
        explanation: `Value at index ${index} is ${val}. Direct index access is constant time: O(1).`
      });

      return { ok: true, steps, result: val };
    }

    // Access by value
    if (value != null) {
      const searchResult = this.searchByValue(value);
      steps.push(...searchResult.steps);
      if (!searchResult.found) {
        return { ok: false, steps, result: null };
      }
      const idx = searchResult.index;
      const val = this.storage[idx];
      steps.push({
        type: "info",
        target: "old",
        indices: [idx],
        stateOld: this.snapshot(),
        explanation: `Access by value returns the first match at index ${idx}. Searching by value is O(n) in general.`
      });
      return { ok: true, steps, result: val };
    }

    steps.push({
      type: "error",
      target: "old",
      indices: [],
      stateOld: this.snapshot(),
      explanation: "Provide either an index or a value to access."
    });
    return { ok: false, steps, result: null };
  }

  // Insert: supports normal insert, or resize+insert demo if full and both index+value given
  insert({ index, value, allowResizeDemo }) {
    const steps = [];

    if (value == null) {
      steps.push({
        type: "error",
        target: "old",
        indices: [],
        stateOld: this.snapshot(),
        explanation: "Insert needs a value."
      });
      return { ok: false, steps };
    }

    // If index not provided, append at end (if space)
    if (index == null) {
      index = this.length;
    }

    if (!Number.isInteger(index) || index < 0 || index > this.length) {
      steps.push({
        type: "invalidIndex",
        target: "old",
        indices: [index],
        stateOld: this.snapshot(),
        explanation: `Cannot insert at index ${index}: valid range is 0 to ${this.length}.`
      });
      return { ok: false, steps };
    }

    // If full and resize demo is allowed, show new array creation + copy
    if (this.length === this.capacity && allowResizeDemo) {
      const result = this.resizeAndInsert(index, value);
      return result;
    }

    // Normal fixed-array behavior: just fail if full
    if (this.length === this.capacity) {
      steps.push({
        type: "error",
        target: "old",
        indices: [],
        stateOld: this.snapshot(),
        explanation: `Cannot insert: array is full (capacity ${this.capacity}).`
      });
      return { ok: false, steps };
    }

    // Standard insert with shifting
    const oldLength = this.length;

    steps.push({
      type: "highlight",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Preparing to insert value ${value} at index ${index}.`
    });

    for (let i = this.length - 1; i >= index; i--) {
      steps.push({
        type: "shiftRight",
        target: "old",
        indices: [i, i + 1],
        stateOld: this.snapshot(),
        explanation: `Shifting element from index ${i} to index ${i + 1}.`
      });
      this.storage[i + 1] = this.storage[i];
    }

    this.storage[index] = value;
    this.length += 1;

    steps.push({
      type: "write",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Inserted value ${value} at index ${index}. Now length is ${this.length}.`
    });

    // Complexity explanation based on actual shifts
    const shifted = oldLength - index;
    const complexityMsg =
      shifted === 0
        ? "Insertion here behaves like O(1) because no elements needed to be shifted (append into free slot)."
        : `Insertion is O(n) in this case because ${shifted} element(s) after index ${index} were shifted to the right.`;

    steps.push({
      type: "info",
      target: "old",
      indices: [],
      stateOld: this.snapshot(),
      explanation: complexityMsg
    });

    return { ok: true, steps };
  }

  // Resize+Insert: demonstrates dynamic array behavior on top of static array
  resizeAndInsert(index, value) {
    const steps = [];

    const oldSnapshotBefore = this.snapshot();

    steps.push({
      type: "info",
      target: "old",
      stateOld: oldSnapshotBefore,
      explanation:
        `The array is full (capacity ${this.capacity}). A static array cannot grow; we must allocate a new, larger array and copy all elements.`
    });

    const newCapacity = this.capacity * 2;
    const newStorage = new Array(newCapacity).fill(null);

    let stateNew = {
      storage: [...newStorage],
      length: 0,
      capacity: newCapacity
    };

    steps.push({
      type: "allocate",
      target: "new",
      stateOld: oldSnapshotBefore,
      stateNew,
      explanation: `Allocating a new array with capacity ${newCapacity}.`
    });

    // Copy old elements into new array one by one
    for (let i = 0; i < this.length; i++) {
      steps.push({
        type: "copy",
        target: "both",
        indices: [i],
        stateOld: this.snapshot(),
        stateNew,
        explanation: `Copying value ${this.storage[i]} from old index ${i} to new index ${i}.`
      });
      newStorage[i] = this.storage[i];
      stateNew = {
        storage: [...newStorage],
        length: i + 1,
        capacity: newCapacity
      };
    }

    steps.push({
      type: "info",
      target: "new",
      stateOld: this.snapshot(),
      stateNew,
      explanation: `Copying ${this.length} element(s) into the new array is O(n) in the number of elements.`
    });

    // Insert in new array (with shifting if needed)
    const oldNewLength = stateNew.length;

    steps.push({
      type: "highlight",
      target: "new",
      indices: [index],
      stateOld: this.snapshot(),
      stateNew,
      explanation: `Now insert value ${value} at index ${index} in the new array.`
    });

    for (let i = stateNew.length - 1; i >= index; i--) {
      steps.push({
        type: "shiftRight",
        target: "new",
        indices: [i, i + 1],
        stateOld: this.snapshot(),
        stateNew,
        explanation: `In new array: shifting element from index ${i} to index ${i + 1}.`
      });
      newStorage[i + 1] = newStorage[i];
      stateNew = {
        storage: [...newStorage],
        length: stateNew.length,
        capacity: newCapacity
      };
    }

    newStorage[index] = value;
    const finalNewLength = stateNew.length + 1;
    stateNew = {
      storage: [...newStorage],
      length: finalNewLength,
      capacity: newCapacity
    };

    steps.push({
      type: "write",
      target: "new",
      indices: [index],
      stateOld: this.snapshot(),
      stateNew,
      explanation: `Placed value ${value} at index ${index} in the new array.`
    });

    // Complexity for the insert inside new array
    const shiftedNew = oldNewLength - index;
    const insertComplexityMsg =
      shiftedNew === 0
        ? "Inserting into the new array here behaves like O(1) because we appended at the end."
        : `Within the new array, insertion is O(n) because ${shiftedNew} element(s) were shifted to the right.`;

    steps.push({
      type: "info",
      target: "new",
      stateOld: this.snapshot(),
      stateNew,
      explanation: insertComplexityMsg
    });

    // Now "reassign" the variable: old reference → new array
    this.storage = newStorage;
    this.capacity = newCapacity;
    this.length = finalNewLength;

    steps.push({
      type: "reassign",
      target: "both",
      stateOld: this.snapshot(),
      stateNew,
      explanation:
        "The variable now points to the new array. The old array can be discarded. Growing a dynamic array is O(n) when resizing happens, but individual appends are often O(1) in between resizes."
    });

    return { ok: true, steps };
  }

  // Delete by index or value
  delete({ index, value }) {
    const steps = [];

    if (this.length === 0) {
      steps.push({
        type: "error",
        target: "old",
        indices: [],
        stateOld: this.snapshot(),
        explanation: "Cannot delete: array is empty."
      });
      return { ok: false, steps };
    }

    // Delete by value: find index first
    if (index == null && value != null) {
      const searchResult = this.searchByValue(value);
      steps.push(...searchResult.steps);
      if (!searchResult.found) {
        return { ok: false, steps };
      }
      index = searchResult.index;
    }

    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      steps.push({
        type: "invalidIndex",
        target: "old",
        indices: [index],
        stateOld: this.snapshot(),
        explanation: `Cannot delete at index ${index}: valid range is 0 to ${this.length - 1}.`
      });
      return { ok: false, steps };
    }

    const oldLength = this.length;

    steps.push({
      type: "highlight",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Deleting element at index ${index}.`
    });

    const removed = this.storage[index];

    for (let i = index; i < this.length - 1; i++) {
      steps.push({
        type: "shiftLeft",
        target: "old",
        indices: [i + 1, i],
        stateOld: this.snapshot(),
        explanation: `Shifting element from index ${i + 1} to index ${i}.`
      });
      this.storage[i] = this.storage[i + 1];
    }

    this.storage[this.length - 1] = null;
    this.length -= 1;

    steps.push({
      type: "write",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Deleted value ${removed}. New length is ${this.length}.`
    });

    // Complexity explanation based on shifts
    const shifted = oldLength - 1 - index;
    const complexityMsg =
      shifted === 0
        ? "Deletion here is O(1) because the last element was removed without shifting."
        : `Deletion is O(n) in this case because ${shifted} element(s) after index ${index} were shifted left.`;

    steps.push({
      type: "info",
      target: "old",
      indices: [],
      stateOld: this.snapshot(),
      explanation: complexityMsg
    });

    return { ok: true, steps };
  }

  // Update by index (value = new content)
  update({ index, value }) {
    const steps = [];

    if (value == null) {
      steps.push({
        type: "error",
        target: "old",
        indices: [],
        stateOld: this.snapshot(),
        explanation: "Update needs a new value."
      });
      return { ok: false, steps };
    }

    if (index == null) {
      steps.push({
        type: "error",
        target: "old",
        indices: [],
        stateOld: this.snapshot(),
        explanation: "For this demo, update requires an index (value is the new content)."
      });
      return { ok: false, steps };
    }

    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      steps.push({
        type: "invalidIndex",
        target: "old",
        indices: [index],
        stateOld: this.snapshot(),
        explanation: `Cannot update index ${index}: valid range is 0 to ${this.length - 1}.`
      });
      return { ok: false, steps };
    }

    steps.push({
      type: "highlight",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Updating element at index ${index}.`
    });

    this.storage[index] = value;

    steps.push({
      type: "write",
      target: "old",
      indices: [index],
      stateOld: this.snapshot(),
      explanation: `Set value at index ${index} to ${value}.`
    });

    steps.push({
      type: "info",
      target: "old",
      indices: [],
      stateOld: this.snapshot(),
      explanation:
        "Update finished in O(1) time because it directly overwrites a single array cell using its index."
    });

    return { ok: true, steps };
  }
}

window.ArrayCore = {
  ArrayModel
};
