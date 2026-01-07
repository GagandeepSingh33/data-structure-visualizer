// core/doublyCircularLogic.js
// Pure data + algorithm layer for Doubly Circular Linked List (no DOM).

class DCLLNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
    this._id = `dcll-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

class DoublyCircularLinkedListModel {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  // Ensure circular links when non-empty
  _fixCircle() {
    if (!this.head || !this.tail) return;
    this.head.prev = this.tail;
    this.tail.next = this.head;
  }

  // Snapshot for visualization (limit to length nodes to avoid infinite loops)
  snapshot(activeId = null, targetId = null, pointerIds = []) {
    const nodes = [];
    if (!this.head) {
      return { nodes, length: 0, activeId, targetId, pointerIds };
    }

    let curr = this.head;
    let count = 0;
    do {
      nodes.push({
        id: curr._id,
        value: curr.value,
        prevId: curr.prev ? curr.prev._id : null,
        nextId: curr.next ? curr.next._id : null
      });
      curr = curr.next;
      count++;
    } while (curr && curr !== this.head && count < this.length);

    return {
      nodes,
      length: this.length,
      activeId,
      targetId,
      pointerIds
    };
  }

  // Initialize from array
  initFromArray(values) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    const steps = [];

    steps.push({
      state: this.snapshot(),
      explanation:
        "Starting with an empty doubly circular list (head and tail are null).",
      complexity:
        "Initialization: O(1) to clear, then O(n) to insert each node."
    });

    values.forEach((val, index) => {
      const node = new DCLLNode(val);
      if (!this.head) {
        this.head = this.tail = node;
        node.next = node;
        node.prev = node;
      } else {
        node.prev = this.tail;
        node.next = this.head;
        this.tail.next = node;
        this.head.prev = node;
        this.tail = node;
      }
      this.length++;

      steps.push({
        state: this.snapshot(node._id),
        explanation: `Created node ${val} and linked it ${
          index === 0
            ? "as head and tail (node points to itself in both directions)"
            : "at the tail of the circular list, updating head.prev and tail.next pointers"
        }.`,
        complexity:
          "Each append is O(1) because head and tail are tracked; overall init is O(n)."
      });
    });

    if (this.length === 0) {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Initialization left the list empty because no values were provided.",
        complexity: "O(1)."
      });
    } else {
      steps.push({
        state: this.snapshot(),
        explanation:
          "Initialization complete. The list forms a doubly linked ring: following next or prev from any node eventually returns to head.",
        complexity: `Overall complexity: O(n) for n = ${this.length} nodes.`
      });
    }

    return steps;
  }

  // Helper: traverse forward from head to index
  _traverseFromHeadToIndex(index) {
    const steps = [];

    if (index < 0 || index >= this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Index ${index} is out of bounds for list of length ${this.length}.`,
        complexity: "Index check: O(1)."
      });
      return { ok: false, steps, curr: null, prev: null };
    }

    let curr = this.head;
    let prev = this.tail;
    let i = 0;
    while (i < index) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing forward around the circle: moving from node ${i} to node ${i + 1} using next pointer.`,
        complexity: "Traversal so far: O(i); worst case O(n)."
      });
      prev = curr;
      curr = curr.next;
      i++;
    }

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Reached index ${index} by sequential traversal from head around the circle.`,
      complexity: "Traversal: O(n) in the worst case."
    });

    return { ok: true, steps, curr, prev };
  }

  // INSERTIONS

  insertHead(value) {
    const steps = [];
    const node = new DCLLNode(value);

    steps.push({
      state: this.snapshot(this.head ? this.head._id : null),
      explanation:
        "To insert at head in a doubly circular list, adjust new head.prev, new head.next, old head.prev, and tail.next to keep the ring intact.",
      complexity: "Pointer rewiring is O(1)."
    });

    if (this.isEmpty()) {
      this.head = this.tail = node;
      node.next = node;
      node.prev = node;
      this.length = 1;
    } else {
      node.next = this.head;
      node.prev = this.tail;
      this.head.prev = node;
      this.tail.next = node;
      this.head = node;
      this.length++;
    }

    steps.push({
      state: this.snapshot(node._id),
      explanation:
        "Inserted new node at head. head.prev points to tail and tail.next points to head, preserving the circular structure.",
      complexity: "Insert at head: O(1)."
    });

    return { ok: true, steps };
  }

  insertTail(value) {
    const steps = [];
    const node = new DCLLNode(value);

    if (this.isEmpty()) {
      this.head = this.tail = node;
      node.next = node;
      node.prev = node;
      this.length = 1;
      steps.push({
        state: this.snapshot(node._id),
        explanation:
          "List was empty, so inserting at end is the same as inserting at head. The single node points to itself in both directions.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(this.tail ? this.tail._id : null),
      explanation:
        "To insert at tail, place the new node after the current tail and before head, then update tail and surrounding prev/next pointers.",
      complexity: "Using tail pointer: O(1) access to last node."
    });

    node.prev = this.tail;
    node.next = this.head;
    this.tail.next = node;
    this.head.prev = node;
    this.tail = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, this.head._id, [node._id, this.tail.prev._id]),
      explanation:
        "Inserted new node at tail. Following next from the new tail leads to head, and following prev from head leads to the new tail.",
      complexity: "Insert at tail: O(1)."
    });

    return { ok: true, steps };
  }

  insertAtIndex(index, value) {
    const steps = [];

    if (index < 0 || index > this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Cannot insert at index ${index}. Valid indices are 0 through ${this.length}.`,
        complexity: "Bounds check: O(1)."
      });
      return { ok: false, steps };
    }

    if (index === 0) {
      const res = this.insertHead(value);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }
    if (index === this.length) {
      const res = this.insertTail(value);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    const trav = this._traverseFromHeadToIndex(index);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const curr = trav.curr; // node currently at index
    const prev = curr.prev;
    const node = new DCLLNode(value);

    node.prev = prev;
    node.next = curr;
    prev.next = node;
    curr.prev = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [prev._id, node._id, curr._id]),
      explanation: `Inserted ${value} at index ${index} by updating prev.next, newNode.prev/next, and curr.prev pointers inside the circular ring.`,
      complexity: "Traversal O(n) + O(1) pointer updates."
    });

    return { ok: true, steps };
  }

  insertBeforeValue(targetVal, newVal) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot insert before a value in an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (this.head.value === targetVal) {
      const res = this.insertHead(newVal);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    let curr = this.head.next;
    let index = 1;

    while (curr !== this.head && curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing around the ring: node at index ${index} has value ${curr.value}, not ${targetVal}.`,
        complexity: "Traversal: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (curr === this.head) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found in the circular list, so cannot insert before it.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    const prev = curr.prev;
    const node = new DCLLNode(newVal);

    node.prev = prev;
    node.next = curr;
    prev.next = node;
    curr.prev = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [prev._id, node._id, curr._id]),
      explanation: `Inserted ${newVal} before the first occurrence of ${targetVal} while preserving the circular prev/next links.`,
      complexity: "Search + insert: O(n) traversal, O(1) pointer updates."
    });

    return { ok: true, steps };
  }

  insertAfterValue(targetVal, newVal) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot insert after a value in an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    let curr = this.head;
    let index = 0;

    do {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not ${targetVal}.`,
        complexity: "Traversal: O(n) in worst case."
      });

      if (curr.value === targetVal) break;
      curr = curr.next;
      index++;
    } while (curr !== this.head);

    if (curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found in the circular list, so cannot insert after it.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    const node = new DCLLNode(newVal);
    const next = curr.next;

    node.prev = curr;
    node.next = next;
    curr.next = node;
    next.prev = node;
    if (curr === this.tail) this.tail = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [curr._id, node._id, next._id]),
      explanation: `Inserted ${newVal} after the first occurrence of ${targetVal}. If the target was tail, tail moves to the new node.`,
      complexity: "Search + insert: O(n) traversal, O(1) pointer updates."
    });

    return { ok: true, steps };
  }

  // DELETIONS

  deleteHead() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete head of an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    const removed = this.head;

    steps.push({
      state: this.snapshot(removed._id),
      explanation:
        "Deleting head: head will move to the next node and both head.prev and tail.next must be updated to preserve the ring.",
      complexity: "O(1)."
    });

    if (this.head === this.tail) {
      this.head = this.tail = null;
      this.length = 0;
    } else {
      this.head = this.head.next;
      this.head.prev = this.tail;
      this.tail.next = this.head;
      this.length--;
    }

    steps.push({
      state: this.snapshot(null, removed._id),
      explanation: `Removed head node with value ${removed.value}. The new head is the next node in the circle.`,
      complexity: "Delete head: O(1)."
    });

    if (this.length === 0) {
      steps.push({
        state: this.snapshot(),
        explanation: "List is now empty; head and tail are null.",
        complexity: "O(1)."
      });
    }

    return { ok: true, steps };
  }

  deleteTail() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete tail of an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    const removed = this.tail;

    if (this.head === this.tail) {
      this.head = this.tail = null;
      this.length = 0;
      steps.push({
        state: this.snapshot(null, removed._id),
        explanation: `Deleted the only node (${removed.value}); list is now empty and has no circle.`,
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    // find node before tail (can use prev)
    const prev = this.tail.prev;

    steps.push({
      state: this.snapshot(this.tail._id),
      explanation:
        "Deleting tail: tail will move to tail.prev and both tail.next and head.prev must be updated to preserve circular links.",
      complexity: "O(1) – thanks to prev pointer, no traversal from head is needed."
    });

    prev.next = this.head;
    this.head.prev = prev;
    this.tail = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, removed._id, [prev._id]),
      explanation: `Deleted tail node with value ${removed.value}. Now prev becomes the new tail, still linked back to head.`,
      complexity: "Delete tail: O(1) in a doubly circular list."
    });

    return { ok: true, steps };
  }

  deleteAtIndex(index) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete from an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (index < 0 || index >= this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Index ${index} is out of bounds for delete (0 to ${this.length - 1}).`,
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (index === 0) {
      const res = this.deleteHead();
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    if (index === this.length - 1) {
      const res = this.deleteTail();
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    const trav = this._traverseFromHeadToIndex(index);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const target = trav.curr;
    const prev = target.prev;
    const next = target.next;

    prev.next = next;
    next.prev = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, target._id, [prev._id, next._id]),
      explanation: `Deleted node at index ${index} by linking prev.next to next and next.prev to prev inside the circular list.`,
      complexity: "Delete at index: O(n) due to traversal; pointer updates are O(1)."
    });

    return { ok: true, steps };
  }

  deleteByValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete by value from an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (this.head.value === value) {
      const res = this.deleteHead();
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    let curr = this.head.next;
    let index = 1;

    while (curr !== this.head && curr.value !== value) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not target ${value}.`,
        complexity: "Search by value: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (curr === this.head) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the circular list.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    const prev = curr.prev;
    const next = curr.next;

    prev.next = next;
    next.prev = prev;
    if (curr === this.tail) this.tail = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, curr._id, [prev._id, next._id]),
      explanation: `Deleted first node with value ${value} by reconnecting its prev and next neighbors around it.`,
      complexity: "Delete by value: O(n) due to traversal."
    });

    return { ok: true, steps };
  }

  // SEARCH & TRAVERSAL

  searchByValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "List is empty; search fails immediately.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    let curr = this.head;
    let index = 0;

    do {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Checking node at index ${index} (value ${curr.value}) against target ${value}.`,
        complexity: "Sequential search around the circle: O(n) in worst case."
      });

      if (curr.value === value) {
        steps.push({
          state: this.snapshot(curr._id),
          explanation: `Found value ${value} at index ${index} before returning to head.`,
          complexity: "Search successful: still O(n) worst case."
        });
        return { ok: true, steps };
      }

      curr = curr.next;
      index++;
    } while (curr !== this.head);

    steps.push({
      state: this.snapshot(),
      explanation: `Value ${value} not found after one full loop around the circle.`,
      complexity: "Search: O(n)."
    });

    return { ok: false, steps };
  }

  searchByIndex(index) {
    const trav = this._traverseFromHeadToIndex(index);
    const steps = [...trav.steps];
    if (!trav.ok) return { ok: false, steps };

    steps.push({
      state: this.snapshot(trav.curr._id),
      explanation: `Node at index ${index} has value ${trav.curr.value}.`,
      complexity:
        "Access by index in a circular list is O(n) because traversal from head is required."
    });

    return { ok: true, steps };
  }

  traverseForwardOnceFromHead() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Traversal on empty doubly circular list visits no nodes.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    let curr = this.head;
    let index = 0;

    do {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Visiting node at index ${index} while traversing forward from head using next pointers.`,
        complexity: "Full forward traversal around the circle: O(n)."
      });
      curr = curr.next;
      index++;
    } while (curr !== this.head);

    steps.push({
      state: this.snapshot(),
      explanation:
        "Forward traversal finished when we returned to head, marking one full loop around the ring.",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }

  traverseBackwardOnceFromTail() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Traversal on empty doubly circular list visits no nodes.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    let curr = this.tail;
    let index = this.length - 1;

    do {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Visiting node at index ${index} while traversing backward from tail using prev pointers.`,
        complexity: "Full backward traversal around the circle: O(n)."
      });
      curr = curr.prev;
      index--;
    } while (curr !== this.tail);

    steps.push({
      state: this.snapshot(),
      explanation:
        "Backward traversal finished when we returned to tail, marking one full loop around the ring.",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }
}

// Expose
window.DoublyCircularLinkedListModel = DoublyCircularLinkedListModel;
window.DCLLNode = DCLLNode;
