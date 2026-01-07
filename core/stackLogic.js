// core/stackLogic.js
// Pure data + algorithm layer for Stack. No DOM here.

class StackModel {
  constructor() {
    this.items = [];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  // Snapshot current stack for visualization
  snapshot(activeIndex = null, targetIndex = null) {
    return {
      items: [...this.items],
      topIndex: this.items.length - 1,
      activeIndex,
      targetIndex
    };
  }

  // Initialize from array (bottom = first element, top = last element)
  initFromArray(values) {
    this.items = [];
    const steps = [];

    steps.push({
      state: this.snapshot(),
      explanation: "Starting with an empty stack.",
      complexity: "Initialization: O(1) to clear, then O(n) to push each element."
    });

    values.forEach((val, index) => {
      this.items.push(val);
      steps.push({
        state: this.snapshot(this.items.length - 1),
        explanation: `Pushed ${val} onto the stack. It is now at position ${this.items.length - 1} (top moves up).`,
        complexity: "Each push is O(1); overall initialization is O(n)."
      });
    });

    steps.push({
      state: this.snapshot(),
      explanation:
        "Initialization complete. The bottom element is the first value, and the top is the last value you entered.",
      complexity: `Total complexity: O(n) for n = ${this.items.length} items.`
    });

    return steps;
  }

  push(value) {
    const steps = [];

    steps.push({
      state: this.snapshot(),
      explanation:
        "To push, place the new value above the current top without disturbing the elements below.",
      complexity: "Push: O(1) because it only appends at the end."
    });

    this.items.push(value);

    steps.push({
      state: this.snapshot(this.items.length - 1),
      explanation: `Pushed ${value} onto the stack. This new element becomes the top.`,
      complexity: "Push: O(1)."
    });

    return { ok: true, steps };
  }

  pop() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot pop from an empty stack. This situation is called stack underflow.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const topIndex = this.items.length - 1;
    const value = this.items[topIndex];

    steps.push({
      state: this.snapshot(topIndex, topIndex),
      explanation: `Top element ${value} is about to be removed from the stack.`,
      complexity: "Accessing the top element is O(1)."
    });

    this.items.pop();

    steps.push({
      state: this.snapshot(),
      explanation: `Popped ${value} from the stack. The new top is the element just below it, if any.`,
      complexity: "Pop: O(1) because it removes from the end."
    });

    return { ok: true, steps, value };
  }

  peek() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Cannot peek the top element because the stack is empty.",
        complexity: "Underflow check: O(1)."
      });
      return { ok: false, steps };
    }

    const topIndex = this.items.length - 1;
    const value = this.items[topIndex];

    steps.push({
      state: this.snapshot(topIndex, topIndex),
      explanation: `Peek reveals the top element ${value} without removing it.`,
      complexity:
        "Peek: O(1) because it only reads the top position without modifying the stack."
    });

    return { ok: true, steps, value };
  }

  isEmptyCheck() {
    const steps = [];
    const empty = this.isEmpty();

    steps.push({
      state: this.snapshot(),
      explanation: empty
        ? "The stack is empty because it contains no elements."
        : "The stack is not empty because it has at least one element.",
      complexity: "isEmpty: O(1) because it only checks the length."
    });

    return { ok: true, steps, value: empty };
  }

  sizeCheck() {
    const steps = [];
    const s = this.size();

    steps.push({
      state: this.snapshot(),
      explanation: `The stack currently contains ${s} element${s === 1 ? "" : "s"}.`,
      complexity: "Size: O(1) because it reads a stored length."
    });

    return { ok: true, steps, value: s };
  }

  searchValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Search fails immediately because the stack is empty.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    let foundIndex = -1;
    // Search from top down to show real stack behavior
    for (let i = this.items.length - 1; i >= 0; i--) {
      steps.push({
        state: this.snapshot(i),
        explanation: `Checking position ${i} with value ${this.items[i]} against target ${value}.`,
        complexity: "Sequential search: O(n) in worst case."
      });

      if (this.items[i] === value) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the stack.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(foundIndex, foundIndex),
      explanation: `Found value ${value} at position ${foundIndex} counting from the bottom of the stack.`,
      complexity: "Search: O(n) overall."
    });

    return { ok: true, steps, index: foundIndex };
  }

  clearAll() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Stack is already empty; nothing to clear.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(this.items.length - 1),
      explanation:
        "Clearing the stack removes all elements at once, leaving an empty stack.",
      complexity: "Clear operation: O(n) if implemented by popping each element, O(1) if we reset the array reference."
    });

    this.items = [];

    steps.push({
      state: this.snapshot(),
      explanation: "Stack cleared. No elements remain and the top position is now undefined.",
      complexity: "Using array reset here makes the clear step effectively O(1)."
    });

    return { ok: true, steps };
  }
}

// Expose
window.StackModel = StackModel;
