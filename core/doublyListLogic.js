// core/doublyListLogic.js
// Pure data + algorithm layer for Doubly Linked List. No DOM here.

class DLLNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
    this._id = `dll-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

class DoublyLinkedListModel {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  // Snapshot current list for visualization (same structure style as SLL).
  snapshot(activeId = null, targetId = null, pointerIds = []) {
    const nodes = [];
    let curr = this.head;
    while (curr) {
      nodes.push({
        id: curr._id,
        value: curr.value,
        prevId: curr.prev ? curr.prev._id : null,
        nextId: curr.next ? curr.next._id : null
      });
      curr = curr.next;
    }
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
        "Starting with an empty doubly linked list (head and tail are null).",
      complexity:
        "Initialization: O(1) to clear, then O(n) to insert each node in order."
    });

    values.forEach((val, index) => {
      const node = new DLLNode(val);
      if (!this.head) {
        this.head = this.tail = node;
      } else {
        node.prev = this.tail;
        this.tail.next = node;
        this.tail = node;
      }
      this.length++;

      steps.push({
        state: this.snapshot(node._id),
        explanation: `Created node ${val} and linked it ${index === 0 ? "as head (also tail)" : "at the tail"} with both prev and next pointers updated.`,
        complexity:
          "Each append here is O(1) because tail is tracked; overall init is O(n)."
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
          "Initialization complete. Nodes are linked by prev/next pointers instead of contiguous indices.",
        complexity: `Overall complexity: O(n) for n = ${this.length} nodes.`
      });
    }

    return steps;
  }

  // Internal traversal from head to index
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
    let prev = null;
    let i = 0;
    while (i < index) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing forward from head: moving from node ${i} to node ${i + 1} using next pointer.`,
        complexity: "Traversal so far: O(i); worst case O(n)."
      });
      prev = curr;
      curr = curr.next;
      i++;
    }

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Reached index ${index} by sequential traversal from head.`,
      complexity: "Traversal: O(n) in the worst case."
    });

    return { ok: true, steps, curr, prev };
  }

  // INSERTIONS

  insertHead(value) {
    const steps = [];
    const node = new DLLNode(value);

    steps.push({
      state: this.snapshot(this.head ? this.head._id : null),
      explanation:
        "To insert at head in a doubly linked list, only head, the new node.next, and the old head.prev change.",
      complexity: "Pointer rewiring is O(1)."
    });

    if (!this.head) {
      this.head = this.tail = node;
      this.length = 1;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      this.length++;
    }

    steps.push({
      state: this.snapshot(node._id),
      explanation:
        "Inserted new node at head. Its next points to the old head, and the old head.prev points back to it. prev of head is null.",
      complexity: "Insert at head: O(1) regardless of list size."
    });

    return { ok: true, steps };
  }

  insertTail(value) {
    const steps = [];
    const node = new DLLNode(value);

    if (!this.tail) {
      this.head = this.tail = node;
      this.length = 1;
      steps.push({
        state: this.snapshot(node._id),
        explanation:
          "List was empty, so inserting at tail is the same as inserting at head.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    let curr = this.tail;
    const index = this.length - 1;

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Tail is already tracked, so we can insert after the node at index ${index} without extra traversal.`,
      complexity: "Using tail pointer: O(1) access to last node."
    });

    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [curr._id, node._id]),
      explanation:
        `Appended ${value} at tail by updating oldTail.next to new node and newNode.prev to old tail.`,
      complexity: "Insert at tail: O(1) due to tail pointer."
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

    const trav = this._traverseFromHeadToIndex(index - 1);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const prev = trav.curr;
    const next = prev.next;
    const node = new DLLNode(value);

    node.prev = prev;
    node.next = next;
    prev.next = node;
    if (next) next.prev = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, prev._id, [prev._id, node._id]),
      explanation: `Inserted ${value} at index ${index} by updating prev.next, newNode.prev/next, and next.prev pointers.`,
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

    while (curr && curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not ${targetVal}.`,
        complexity: "Traversal: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found, so cannot insert before it.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    const prev = curr.prev;
    const node = new DLLNode(newVal);

    node.prev = prev;
    node.next = curr;
    prev.next = node;
    curr.prev = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [prev._id, node._id, curr._id]),
      explanation: `Inserted ${newVal} before the first occurrence of ${targetVal}, adjusting both prev and next pointers of neighbors.`,
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

    while (curr && curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not ${targetVal}.`,
        complexity: "Traversal: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found, so cannot insert after it.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    if (curr === this.tail) {
      const res = this.insertTail(newVal);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    const node = new DLLNode(newVal);
    const next = curr.next;

    node.prev = curr;
    node.next = next;
    curr.next = node;
    next.prev = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [curr._id, node._id, next._id]),
      explanation: `Inserted ${newVal} after the first occurrence of ${targetVal}, updating both prev and next pointers.`,
      complexity: "Search + insert: O(n) for traversal, O(1) for pointer changes."
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
        "Deleting head: head will move to the second node, and the new head.prev becomes null.",
      complexity: "O(1)."
    });

    if (this.head === this.tail) {
      this.head = this.tail = null;
      this.length = 0;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
      this.length--;
    }

    steps.push({
      state: this.snapshot(null, removed._id),
      explanation: `Removed head node with value ${removed.value}. Remaining prev/next links stay intact.`,
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
        explanation: `Deleted the only node (${removed.value}); list is now empty.`,
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(removed._id),
      explanation:
        "Deleting tail: tail will move to tail.prev and the new tail.next becomes null.",
      complexity: "O(1) – tail pointer gives direct access to last node."
    });

    this.tail = this.tail.prev;
    this.tail.next = null;
    this.length--;

    steps.push({
      state: this.snapshot(null, removed._id),
      explanation: `Removed tail node with value ${removed.value} by clearing the new tail.next pointer.`,
      complexity: "Delete tail: O(1) when tail is tracked."
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
      explanation: `Deleted node at index ${index} by linking prev.next to next and next.prev to prev.`,
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

    while (curr && curr.value !== value) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not target ${value}.`,
        complexity: "Search by value: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the list.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    const prev = curr.prev;
    const next = curr.next;

    if (prev) prev.next = next;
    if (next) next.prev = prev;
    if (curr === this.tail) this.tail = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, curr._id, [prev ? prev._id : null, next ? next._id : null].filter(Boolean)),
      explanation: `Deleted first node with value ${value} by reconnecting its prev and next neighbors around it.`,
      complexity: "Delete by value: O(n) due to traversal."
    });

    return { ok: true, steps };
  }

  // SEARCH & TRAVERSAL

  searchByValue(value) {
    const steps = [];

    let curr = this.head;
    let index = 0;

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: "List is empty; search fails immediately.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    while (curr && curr.value !== value) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Checking node at index ${index} (value ${curr.value}) against target ${value}.`,
        complexity: "Sequential search: O(n) in worst case."
      });
      curr = curr.next;
      index++;
    }

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the list.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Found value ${value} at index ${index}.`,
      complexity: "Search successful: still O(n) worst case."
    });

    return { ok: true, steps };
  }

  searchByIndex(index) {
    const trav = this._traverseFromHeadToIndex(index);
    const steps = [...trav.steps];
    if (!trav.ok) return { ok: false, steps };

    steps.push({
      state: this.snapshot(trav.curr._id),
      explanation: `Node at index ${index} has value ${trav.curr.value}.`,
      complexity:
        "Access by index in a linked list is O(n) because traversal from head is required."
    });

    return { ok: true, steps };
  }

  traverseForward() {
    const steps = [];
    let curr = this.head;
    let index = 0;

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: "Traversal on empty list visits no nodes.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    while (curr) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Visiting node at index ${index} while traversing forward from head using next pointers.`,
        complexity: "Full forward traversal: O(n)."
      });
      curr = curr.next;
      index++;
    }

    steps.push({
      state: this.snapshot(),
      explanation: "Forward traversal finished at null (after the tail).",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }

  traverseBackward() {
    const steps = [];
    let curr = this.tail;
    let index = this.length - 1;

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: "Traversal on empty list visits no nodes.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    while (curr) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Visiting node at index ${index} while traversing backward from tail using prev pointers.`,
        complexity: "Full backward traversal: O(n)."
      });
      curr = curr.prev;
      index--;
    }

    steps.push({
      state: this.snapshot(),
      explanation: "Backward traversal finished at null (before the head).",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }
}

// Expose
window.DoublyLinkedListModel = DoublyLinkedListModel;
window.DLLNode = DLLNode;
