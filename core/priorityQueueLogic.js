// core/priorityQueueLogic.js
// Array-based priority queue storing { value, priority } and producing
// snapshots compatible with the queue animators. [web:118][web:113]

class PriorityQueueModel {
  constructor() {
    this.items = []; // each: { value, priority }
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  // Compare according to global priorityMode ("higher" or "lower")
  _compare(a, b) {
    const mode =
      typeof window.priorityMode === "string" ? window.priorityMode : "higher";
    if (mode === "lower") {
      // Lower number = higher priority
      return a.priority - b.priority;
    }
    // Higher number = higher priority
    return b.priority - a.priority;
  }

  // Resort existing items when mode changes
  resortByMode() {
    if (this.items.length <= 1) return;
    this.items.sort((a, b) => this._compare(a, b));
  }

  // Snapshot: items as display strings for the animator
  snapshot(activeIndex = null, targetIndex = null) {
    const visible = this.items.map((it) => {
      // If value equals numeric priority, show just the value (e.g., "10")
      if (it.value === String(it.priority)) {
        return it.value;
      }
      // Otherwise show value:priority (e.g., "A:3")
      return `${it.value}:${it.priority}`;
    });

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

  // Accepts either "value:priority" OR plain number "10"
  _parsePair(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    if (trimmed.includes(":")) {
      const parts = trimmed.split(":");
      if (parts.length !== 2) return null;
      const value = parts[0].trim();
      const pr = Number(parts[1].trim());
      if (!Number.isFinite(pr)) return null;
      return { value, priority: pr };
    }

    // Plain number: treat as value = priority = that number
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return null;
    return { value: trimmed, priority: num };
  }

  initFromArray(textTokens) {
    this.items = [];

    const steps = [];
    steps.push({
      state: this.snapshot(),
      explanation: "Starting with an empty priority queue.",
      complexity:
        "Initialization: O(1) to clear, then O(n log n) including sorting."
    });

    textTokens.forEach((t) => {
      const pair = this._parsePair(t);
      if (!pair) return;
      this.items.push(pair);
      this.items.sort((a, b) => this._compare(a, b));

      steps.push({
        state: this.snapshot(0, this.size() - 1),
        explanation: `Inserted ${pair.value} with priority ${pair.priority} into the priority queue.`,
        complexity:
          "Each insertion and reorder takes up to O(n) in this array-based demo."
      });
    });

    steps.push({
      state: this.snapshot(),
      explanation:
        "Initialization complete. The element with highest priority now appears at the front of the queue.",
      complexity: `Overall complexity: approximately O(n log n) for n items.`
    });

    return steps;
  }

  enqueue(text) {
    const steps = [];

    const pair = this._parsePair(text);
    if (!pair) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Use plain numbers like 10 or value:priority format, for example A:3.",
        complexity: "Validation: O(1)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(null, this.size() - 1),
      explanation:
        "To insert into a priority queue, add the new element and then reorder so the highest-priority element is at the front.",
      complexity: "Insertion: O(n) in this array-based implementation."
    });

    this.items.push(pair);
    this.items.sort((a, b) => this._compare(a, b));

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Inserted ${pair.value} with priority ${pair.priority}. The element with highest priority is now at the front.`,
      complexity: "Insertion + reorder: O(n) here."
    });

    return { ok: true, steps };
  }

  dequeue() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot remove from an empty priority queue.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const top = this.items[0];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `The highest-priority element ${top.value} (priority ${top.priority}) is about to be removed from the queue.`,
      complexity: "Accessing the top element is O(1)."
    });

    this.items.shift();

    steps.push({
      state: this.snapshot(),
      explanation:
        `Removed ${top.value}. The next highest-priority element, if any, becomes the new front.`,
      complexity: "Removal from the front of an array is O(n)."
    });

    return { ok: true, steps, value: top };
  }

  frontPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot peek because the priority queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const top = this.items[0];

    steps.push({
      state: this.snapshot(0, 0),
      explanation: `Peek shows the element ${top.value} with priority ${top.priority} that would be removed next.`,
      complexity: "Peek: O(1)."
    });

    return { ok: true, steps, value: `${top.value}:${top.priority}` };
  }

  rearPeek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the lowest-priority element because the priority queue is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const idx = this.size() - 1;
    const low = this.items[idx];

    steps.push({
      state: this.snapshot(idx, idx),
      explanation: `Rear peek shows ${low.value} with priority ${low.priority}, which has the lowest priority in the queue.`,
      complexity: "Peek: O(1)."
    });

    return { ok: true, steps, value: `${low.value}:${low.priority}` };
  }

  isEmptyCheck() {
    const steps = [];
    const empty = this.isEmpty();

    steps.push({
      state: this.snapshot(),
      explanation: empty
        ? "The priority queue is empty; it contains no elements with priorities."
        : "The priority queue is not empty because it stores at least one element.",
      complexity: "isEmpty: O(1)."
    });

    return { ok: true, steps, value: empty };
  }

  sizeCheck() {
    const steps = [];
    const s = this.size();

    steps.push({
      state: this.snapshot(),
      explanation: `The priority queue currently contains ${s} element${s === 1 ? "" : "s"}.`,
      complexity: "Size: O(1)."
    });

    return { ok: true, steps, value: s };
  }

  searchValue(text) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Search ends immediately because the priority queue is empty.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    const value = text.trim();
    let foundIndex = -1;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      steps.push({
        state: this.snapshot(i),
        explanation: `Checking position ${i} with element ${item.value}:${item.priority} against target value ${value}.`,
        complexity: "Sequential search: O(n) in the worst case."
      });

      if (item.value === value) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({
        state: this.snapshot(),
        explanation: `No element with value ${value} was found in the priority queue.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(foundIndex, foundIndex),
      explanation: `Found value ${value} at position ${foundIndex} counting from the highest-priority element.`,
      complexity: "Search: O(n) overall."
    });

    return { ok: true, steps, index: foundIndex };
  }

  clearAll() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Priority queue is already empty; nothing to clear.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(0, this.size() - 1),
      explanation:
        "Clearing the priority queue removes all stored value–priority pairs.",
      complexity: "With a reset of the internal array, clear is O(1) here."
    });

    this.items = [];

    steps.push({
      state: this.snapshot(),
      explanation:
        "Priority queue cleared. No elements with priorities remain.",
      complexity: "Clear: O(1)."
    });

    return { ok: true, steps };
  }
}

window.PriorityQueueModel = PriorityQueueModel;
