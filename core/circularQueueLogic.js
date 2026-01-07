// core/circularQueueLogic.js
// Circular queue with wrap-around, snapshots compatible with queue animators. [web:112]

class CircularQueueModel {
  constructor(capacity = 8) {
    this.capacity = capacity;
    this.buffer = new Array(this.capacity).fill(null);
    this.front = 0;      // index of first element in buffer
    this.sizeValue = 0;  // current number of elements
  }

  isEmpty() {
    return this.sizeValue === 0;
  }

  isFull() {
    return this.sizeValue === this.capacity;
  }

  size() {
    return this.sizeValue;
  }

  _rearIndex() {
    if (this.isEmpty()) return -1;
    return (this.front + this.sizeValue - 1) % this.capacity;
  }

  // Snapshot in logical front->rear order
  snapshot(activeIndex = null, targetIndex = null) {
    const items = [];
    for (let i = 0; i < this.sizeValue; i++) {
      const idx = (this.front + i) % this.capacity;
      items.push(this.buffer[idx]);
    }

    const logicalFront = this.sizeValue === 0 ? -1 : 0;
    const logicalRear = this.sizeValue === 0 ? -1 : this.sizeValue - 1;

    return {
      items,
      frontIndex: logicalFront,
      rearIndex: logicalRear,
      activeIndex,
      targetIndex
    };
  }

  initFromArray(values) {
    this.buffer = new Array(this.capacity).fill(null);
    this.front = 0;
    this.sizeValue = 0;

    const steps = [];
    steps.push({
      state: this.snapshot(),
      explanation: "Starting with an empty circular queue.",
      complexity:
        "Initialization: O(1) to clear, then O(n) to enqueue each element."
    });

    const n = Math.min(values.length, this.capacity);
    for (let i = 0; i < n; i++) {
      const idx = (this.front + this.sizeValue) % this.capacity;
      this.buffer[idx] = values[i];
      this.sizeValue += 1;

      steps.push({
        state: this.snapshot(0, this.size() - 1),
        explanation: `Enqueued ${values[i]} at buffer index ${idx} around the circular queue.`,
        complexity: "Each enqueue is O(1); overall initialization is O(n)."
      });
    }

    steps.push({
      state: this.snapshot(),
      explanation:
        "Initialization complete. Front and rear are positioned around the circle according to the inserted elements.",
      complexity: `Total complexity: O(n) for n = ${this.size()} items.`
    });

    return steps;
  }

  enqueue(value) {
    const steps = [];

    if (this.isFull()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot enqueue into a full circular queue. This is queue overflow.",
        complexity: "Overflow check: O(1)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(null, this.size() - 1),
      explanation:
        "To enqueue in a circular queue, place the new element after the current rear, wrapping to index 0 if needed.",
      complexity: "Enqueue: O(1) by computing the next rear index."
    });

    const idx = (this.front + this.sizeValue) % this.capacity;
    this.buffer[idx] = value;
    this.sizeValue += 1;

    steps.push({
      state: this.snapshot(null, this.size() - 1),
      explanation: `Enqueued ${value}. Front stays fixed, while rear moves one step around the circle.`,
      complexity: "Enqueue: O(1)."
    });

    return { ok: true, steps };
  }

  dequeue() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot dequeue from an empty circular queue. This is queue underflow.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const value = this.buffer[this.front];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Front element ${value} is about to be removed from the circular queue.`,
      complexity: "Accessing the front element is O(1)."
    });

    this.buffer[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.sizeValue -= 1;

    steps.push({
      state: this.snapshot(),
      explanation:
        `Dequeued ${value}. The front pointer moves one step forward around the circular buffer.`,
      complexity: "Dequeue: O(1) because only the front pointer and size change."
    });

    return { ok: true, steps, value };
  }

  frontPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the front element because the circular queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const value = this.buffer[this.front];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Front peek shows ${value}, which would be dequeued next, without removing it.`,
      complexity: "Front peek: O(1)."
    });

    return { ok: true, steps, value };
  }

  rearPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the rear element because the circular queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const rearIdx = this._rearIndex();
    const value = this.buffer[rearIdx];

    steps.push({
      state: this.snapshot(this.size() - 1, this.size() - 1),
      explanation: `Rear peek shows ${value} at buffer index ${rearIdx}, the most recently enqueued element.`,
      complexity: "Rear peek: O(1)."
    });

    return { ok: true, steps, value };
  }

  isEmptyCheck() {
    const steps = [];
    const empty = this.isEmpty();

    steps.push({
      state: this.snapshot(),
      explanation: empty
        ? "The circular queue is empty because its size is 0."
        : "The circular queue is not empty because it contains at least one element.",
      complexity: "isEmpty: O(1)."
    });

    return { ok: true, steps, value: empty };
  }

  sizeCheck() {
    const steps = [];
    const s = this.size();

    steps.push({
      state: this.snapshot(),
      explanation: `The circular queue currently contains ${s} element${s === 1 ? "" : "s"}.`,
      complexity: "Size: O(1)."
    });

    return { ok: true, steps, value: s };
  }

  searchValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Search ends immediately because the circular queue is empty.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    let foundIndex = -1;
    const n = this.size();

    for (let i = 0; i < n; i++) {
      const idx = (this.front + i) % this.capacity;
      const currentVal = this.buffer[idx];

      steps.push({
        state: this.snapshot(i),
        explanation: `Checking logical position ${i} (buffer index ${idx}) with value ${currentVal} against target ${value}.`,
        complexity: "Sequential search: O(n) in the worst case."
      });

      if (currentVal === value) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the circular queue.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(foundIndex, foundIndex),
      explanation: `Found value ${value} at logical position ${foundIndex} counting from the front of the circular queue.`,
      complexity: "Search: O(n) overall."
    });

    return { ok: true, steps, index: foundIndex };
  }

  clearAll() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Circular queue is already empty; nothing to clear.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(0, this.size() - 1),
      explanation:
        "Clearing the circular queue removes all elements and resets front and size.",
      complexity: "With index and size reset, clear is effectively O(1)."
    });

    this.buffer = new Array(this.capacity).fill(null);
    this.front = 0;
    this.sizeValue = 0;

    steps.push({
      state: this.snapshot(),
      explanation: "Circular queue cleared. No elements remain in the buffer.",
      complexity: "Clear: O(1)."
    });

    return { ok: true, steps };
  }
}

window.CircularQueueModel = CircularQueueModel;
