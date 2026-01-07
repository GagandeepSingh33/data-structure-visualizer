// core/linearQueueLogic.js
// Linear queue logic (same as old QueueModel).

class LinearQueueModel {
  constructor() {
    this.items = [];
    this.front = 0;
    this.rear = 0;
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.rear - this.front;
  }

  _maybeCompact() {
    if (this.front > 0 && this.front * 2 >= this.rear) {
      this.items = this.items.slice(this.front, this.rear);
      this.rear = this.size();
      this.front = 0;
    }
  }

  snapshot(activeIndex = null, targetIndex = null) {
    const visible = this.items.slice(this.front, this.rear);
    const logicalFront = visible.length === 0 ? -1 : 0;
    const logicalRear = visible.length === 0 ? -1 : visible.length - 1;

    return {
      items: visible,
      frontIndex: logicalFront,
      rearIndex: logicalRear,
      activeIndex,
      targetIndex
    };
  }

  initFromArray(values) {
    this.items = [];
    this.front = 0;
    this.rear = 0;

    const steps = [];
    steps.push({
      state: this.snapshot(),
      explanation: "Starting with an empty queue.",
      complexity:
        "Initialization: O(1) to clear, then O(n) to enqueue each element."
    });

    values.forEach((val) => {
      this.items[this.rear] = val;
      this.rear += 1;

      steps.push({
        state: this.snapshot(0, this.size() - 1),
        explanation: `Enqueued ${val}. It joins at the rear while the existing front stays the same.`,
        complexity: "Each enqueue is O(1); overall initialization is O(n)."
      });
    });

    steps.push({
      state: this.snapshot(),
      explanation:
        "Initialization complete. The first value is at the front and will be dequeued first.",
      complexity: `Total complexity: O(n) for n = ${this.size()} items.`
    });

    return steps;
  }

  enqueue(value) {
    const steps = [];

    steps.push({
      state: this.snapshot(null, this.size() - 1),
      explanation:
        "To enqueue, place the new element at the rear end of the queue without disturbing elements at the front.",
      complexity: "Enqueue: O(1) by updating rear and assigning one element."
    });

    this.items[this.rear] = value;
    this.rear += 1;

    steps.push({
      state: this.snapshot(null, this.size() - 1),
      explanation: `Enqueued ${value}. This element is now at the rear and will leave after all elements before it.`,
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
          "Cannot dequeue from an empty queue. This situation is called queue underflow.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const value = this.items[this.front];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Front element ${value} is about to be removed from the queue.`,
      complexity: "Accessing the front element is O(1)."
    });

    this.front += 1;
    this._maybeCompact();

    steps.push({
      state: this.snapshot(),
      explanation: `Dequeued ${value}. The next element, if any, becomes the new front.`,
      complexity: "Dequeue: O(1) because only the front pointer moves."
    });

    return { ok: true, steps, value };
  }

  frontPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the front element because the queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const value = this.items[this.front];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Front peek shows the element ${value} that would be dequeued next, without removing it.`,
      complexity: "Front peek: O(1) because it only reads the front position."
    });

    return { ok: true, steps, value };
  }

  rearPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the rear element because the queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const value = this.items[this.rear - 1];

    steps.push({
      state: this.snapshot(this.size() - 1, this.size() - 1),
      explanation: `Rear peek shows the most recently enqueued element ${value}, without removing it.`,
      complexity: "Rear peek: O(1) because it reads the last valid position."
    });

    return { ok: true, steps, value };
  }

  isEmptyCheck() {
    const steps = [];
    const empty = this.isEmpty();

    steps.push({
      state: this.snapshot(),
      explanation: empty
        ? "The queue is empty because there are no elements between front and rear."
        : "The queue is not empty because it contains at least one element.",
      complexity: "isEmpty: O(1) based on front and rear indices."
    });

    return { ok: true, steps, value: empty };
  }

  sizeCheck() {
    const steps = [];
    const s = this.size();

    steps.push({
      state: this.snapshot(),
      explanation: `The queue currently contains ${s} element${s === 1 ? "" : "s"}.`,
      complexity: "Size: O(1) because it uses stored indices."
    });

    return { ok: true, steps, value: s };
  }

  searchValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Search ends immediately because the queue is empty.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    let foundLogicalIndex = -1;
    const currentSize = this.size();

    for (let i = 0; i < currentSize; i++) {
      const actualIndex = this.front + i;
      const currentVal = this.items[actualIndex];

      steps.push({
        state: this.snapshot(i),
        explanation: `Checking position ${i} (from front) with value ${currentVal} against target ${value}.`,
        complexity: "Sequential search: O(n) in the worst case."
      });

      if (currentVal === value) {
        foundLogicalIndex = i;
        break;
      }
    }

    if (foundLogicalIndex === -1) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the queue.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(foundLogicalIndex, foundLogicalIndex),
      explanation: `Found value ${value} at position ${foundLogicalIndex} counting from the front of the queue.`,
      complexity: "Search: O(n) overall."
    });

    return { ok: true, steps, index: foundLogicalIndex };
  }

  clearAll() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Queue is already empty; nothing to clear.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(0, this.size() - 1),
      explanation:
        "Clearing the queue removes all elements so both front and rear point to the same empty position.",
      complexity: "If implemented by resetting indices, clear is effectively O(1)."
    });

    this.items = [];
    this.front = 0;
    this.rear = 0;

    steps.push({
      state: this.snapshot(),
      explanation:
        "Queue cleared. There are no elements between front and rear.",
      complexity: "Clear: O(1) with index reset."
    });

    return { ok: true, steps };
  }
}

window.LinearQueueModel = LinearQueueModel;
