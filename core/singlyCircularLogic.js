// core/singlyCircularLogic.js
// Pure data + algorithm layer for Singly Circular Linked List (no DOM).

class CSLLNode {
  constructor(value) {
    this.value = value;
    this.next = null;
    this._id = `csll-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

class CircularSinglyLinkedListModel {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  // Ensure circular link when non-empty
  _fixCircle() {
    if (!this.head || !this.tail) return;
    this.tail.next = this.head;
  }

  // Snapshot for visualization (similar to SLL but circular awareness is in traversal logic)
  snapshot(activeId = null, targetId = null, pointerIds = []) {
    const nodes = [];
    if (!this.head) {
      return { nodes, length: 0, activeId, targetId, pointerIds };
    }

    let curr = this.head;
    let count = 0;
    // Traverse at most length nodes to avoid infinite loop
    do {
      nodes.push({
        id: curr._id,
        value: curr.value,
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

  // Create from array
  initFromArray(values) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    const steps = [];

    steps.push({
      state: this.snapshot(),
      explanation:
        "Starting with an empty circular list (head and tail are null).",
      complexity:
        "Initialization: O(1) to clear, then O(n) to insert each node."
    });

    values.forEach((val, index) => {
      const node = new CSLLNode(val);
      if (!this.head) {
        this.head = this.tail = node;
        node.next = node; // circle of one
      } else {
        node.next = this.head;
        this.tail.next = node;
        this.tail = node;
      }
      this.length++;

      steps.push({
        state: this.snapshot(node._id),
        explanation: `Created node ${val} and linked it ${
          index === 0 ? "as head (tail also points to it)" : "at the end of the circle"
        }. The tail.next pointer always points back to head.`,
        complexity:
          "Each append is O(1) because we track tail; overall init is O(n)."
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
          "Initialization complete. The list forms a circle: following next from tail leads back to head instead of null.",
        complexity: `Overall complexity: O(n) for n = ${this.length} nodes.`
      });
    }

    return steps;
  }

  // Helper: traverse to index from head in circular list
  _traverseToIndex(index) {
    const steps = [];

    if (index < 0 || index >= this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Index ${index} is out of bounds for circular list of length ${this.length}.`,
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
        explanation: `Traversing around the circle: moving from node ${i} to node ${i + 1} using next pointer.`,
        complexity: "Traversal so far: O(i); worst case O(n)."
      });
      prev = curr;
      curr = curr.next;
      i++;
    }

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Reached index ${index} by sequential traversal around the circle from head.`,
      complexity: "Traversal: O(n) in the worst case."
    });

    return { ok: true, steps, curr, prev };
  }

  // INSERTIONS

  insertHead(value) {
    const steps = [];
    const node = new CSLLNode(value);

    steps.push({
      state: this.snapshot(this.head ? this.head._id : null),
      explanation:
        "To insert at head, update the new node.next to the old head and fix tail.next so the circle still closes at head.",
      complexity: "Pointer rewiring is O(1)."
    });

    if (this.isEmpty()) {
      this.head = this.tail = node;
      node.next = node;
      this.length = 1;
    } else {
      node.next = this.head;
      this.head = node;
      this.tail.next = this.head; // maintain circle
      this.length++;
    }

    steps.push({
      state: this.snapshot(node._id),
      explanation:
        "Inserted new node at head. Following next from tail leads back to this new head, preserving the circle.",
      complexity: "Insert at head: O(1)."
    });

    return { ok: true, steps };
  }

  insertTail(value) {
    const steps = [];
    const node = new CSLLNode(value);

    if (this.isEmpty()) {
      this.head = this.tail = node;
      node.next = node;
      this.length = 1;
      steps.push({
        state: this.snapshot(node._id),
        explanation:
          "List was empty, so inserting at end is the same as inserting at head. The single node points to itself.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    steps.push({
      state: this.snapshot(this.tail ? this.tail._id : null),
      explanation:
        "To insert at tail in a circular list, link the new node after the current tail and then point its next back to head.",
      complexity: "Using tail pointer: O(1) access to last node."
    });

    node.next = this.head;
    this.tail.next = node;
    this.tail = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id),
      explanation:
        "Inserted new node at tail. tail.next still points to head, so the list remains circular.",
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

    const trav = this._traverseToIndex(index - 1);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const prev = trav.curr;
    const node = new CSLLNode(value);

    node.next = prev.next;
    prev.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, prev._id, [prev._id, node._id]),
      explanation: `Inserted ${value} at index ${index} by updating prev.next and newNode.next inside the circle.`,
      complexity: "Traversal O(n) + O(1) pointer changes."
    });

    return { ok: true, steps };
  }

  insertBeforeValue(targetVal, newVal) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot insert before a value in an empty circular list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (this.head.value === targetVal) {
      const res = this.insertHead(newVal);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    let prev = this.head;
    let curr = this.head.next;
    let index = 1;

    // Walk until back to head
    while (curr !== this.head && curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing around the circle: node at index ${index} has value ${curr.value}, not ${targetVal}.`,
        complexity: "Traversal: O(n) in worst case."
      });
      prev = curr;
      curr = curr.next;
      index++;
    }

    if (curr === this.head) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found in the circle, so cannot insert before it.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    const node = new CSLLNode(newVal);
    node.next = curr;
    prev.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [prev._id, node._id]),
      explanation: `Inserted ${newVal} before the first occurrence of ${targetVal} while maintaining the circular next links.`,
      complexity: "Search + insert: O(n) traversal, O(1) pointer updates."
    });

    return { ok: true, steps };
  }

  insertAfterValue(targetVal, newVal) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot insert after a value in an empty circular list.",
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
        explanation: `Value ${targetVal} not found in the circle, so cannot insert after it.`,
        complexity: "Search: O(n)."
      });
      return { ok: false, steps };
    }

    const node = new CSLLNode(newVal);
    node.next = curr.next;
    curr.next = node;
    if (curr === this.tail) this.tail = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [curr._id, node._id]),
      explanation: `Inserted ${newVal} after the first occurrence of ${targetVal}. If target was tail, tail moves to the new node.`,
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
        explanation: "Cannot delete head of an empty circular list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    const removed = this.head;

    steps.push({
      state: this.snapshot(removed._id),
      explanation:
        "Deleting head: head will move to the next node. Tail.next must also be updated to the new head to keep the circle.",
      complexity: "O(1)."
    });

    if (this.head === this.tail) {
      this.head = this.tail = null;
      this.length = 0;
    } else {
      this.head = this.head.next;
      this.tail.next = this.head;
      this.length--;
    }

    steps.push({
      state: this.snapshot(null, removed._id),
      explanation: `Removed head node with value ${removed.value}. The circle now starts at the new head.`,
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
        explanation: "Cannot delete tail of an empty circular list.",
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

    // find node before tail
    let prev = this.head;
    let index = 0;
    while (prev.next !== this.tail) {
      steps.push({
        state: this.snapshot(prev._id),
        explanation: `Traversing towards tail: at index ${index}.`,
        complexity: "Traversal: O(n)."
      });
      prev = prev.next;
      index++;
    }

    prev.next = this.head;
    this.tail = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, removed._id, [prev._id]),
      explanation: `Deleted tail node with value ${removed.value} by linking the previous node directly back to head.`,
      complexity: "Delete tail: O(n) due to traversal."
    });

    return { ok: true, steps };
  }

  deleteAtIndex(index) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete from an empty circular list.",
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

    const trav = this._traverseToIndex(index - 1);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const prev = trav.curr;
    const target = prev.next;

    prev.next = target.next;
    this.length--;

    steps.push({
      state: this.snapshot(null, target._id, [prev._id]),
      explanation: `Deleted node at index ${index} inside the circle by bypassing it (prev.next = target.next).`,
      complexity: "Delete at index: O(n) due to traversal."
    });

    return { ok: true, steps };
  }

  deleteByValue(value) {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Cannot delete by value from an empty circular list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (this.head.value === value) {
      const res = this.deleteHead();
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    let prev = this.head;
    let curr = this.head.next;
    let index = 1;

    while (curr !== this.head && curr.value !== value) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not target ${value}.`,
        complexity: "Search by value: O(n) in worst case."
      });
      prev = curr;
      curr = curr.next;
      index++;
    }

    if (curr === this.head) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${value} not found in the circle.`,
        complexity: "Search: O(n) with no match."
      });
      return { ok: false, steps };
    }

    prev.next = curr.next;
    if (curr === this.tail) this.tail = prev;
    this.length--;

    steps.push({
      state: this.snapshot(null, curr._id, [prev._id]),
      explanation: `Deleted first node with value ${value} by linking prev.next to curr.next inside the circle.`,
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
        complexity: "Sequential circular search: O(n) in worst case."
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
    const trav = this._traverseToIndex(index);
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

  traverseOnceFromHead() {
    const steps = [];

    if (this.isEmpty()) {
      steps.push({
        state: this.snapshot(),
        explanation: "Traversal on empty circular list visits no nodes.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    let curr = this.head;
    let index = 0;

    do {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Visiting node at index ${index} while moving around the circle from head.`,
        complexity: "Traversal: O(n) to visit each node once."
      });
      curr = curr.next;
      index++;
    } while (curr !== this.head);

    steps.push({
      state: this.snapshot(),
      explanation:
        "Traversal finished when we returned to head, which marks one full loop around the circle.",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }
}

// Expose
window.CircularSinglyLinkedListModel = CircularSinglyLinkedListModel;
window.CSLLNode = CSLLNode;
