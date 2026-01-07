// core/linkedListLogic.js
// Pure data + algorithm layer. No DOM here. [web:159][web:164]

class SLLNode {
  constructor(value) {
    this.value = value;
    this.next = null;
    // stable id for animation mapping
    this._id = `n-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

class LinkedListModel {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  isEmpty() {
    return this.head === null;
  }

  // Utility: snapshot current list for visualization
  snapshot(activeId = null, targetId = null, pointerIds = []) {
    const nodes = [];
    let curr = this.head;
    while (curr) {
      nodes.push({
        id: curr._id,
        value: curr.value,
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

  // Create list from comma-separated string (already split & trimmed in UI)
  initFromArray(values) {
    this.head = null;
    this.length = 0;
    const steps = [];

    steps.push({
      state: this.snapshot(),
      explanation: "Starting with an empty list (head is null).",
      complexity: "Initialization: O(1) to clear, then O(n) to insert each node."
    });

    let tail = null;
    values.forEach((val, index) => {
      const node = new SLLNode(val);
      if (!this.head) {
        this.head = node;
        tail = node;
      } else {
        tail.next = node;
        tail = node;
      }
      this.length++;

      steps.push({
        state: this.snapshot(node._id),
        explanation: `Created node ${val} and linked it ${index === 0 ? "as head" : "at the end of the list"}.`,
        complexity: "Each append here is O(1) because we keep a running tail pointer inside this init routine."
      });
    });

    if (this.length === 0) {
      steps.push({
        state: this.snapshot(),
        explanation: "Initialization left the list empty because no values were provided.",
        complexity: "O(1)."
      });
    } else {
      steps.push({
        state: this.snapshot(),
        explanation: "Initialization complete. The list is built by chaining node.next pointers instead of contiguous indices like an array.",
        complexity: `Overall complexity: O(n) for n = ${this.length} nodes.`
      });
    }

    return steps;
  }

  // Internal traversal helper: go to index and record traversal steps
  _traverseToIndex(index) {
    const steps = [];

    if (index < 0 || index >= this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Index ${index} is out of bounds for list of length ${this.length}.`,
        complexity: "Invalid index: O(1) to check."
      });
      return { ok: false, steps, curr: null, prev: null };
    }

    let curr = this.head;
    let prev = null;
    let i = 0;
    while (i < index) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing from node ${i} to node ${i + 1} by following next pointer.`,
        complexity: "Traversal so far: O(i). Final traversal is O(n) in worst case."
      });
      prev = curr;
      curr = curr.next;
      i++;
    }

    steps.push({
      state: this.snapshot(curr._id),
      explanation: `Reached index ${index} by sequential traversal from head.`,
      complexity: `Traversal: O(n), where n is the index distance from head.`
    });

    return { ok: true, steps, curr, prev };
  }

  // INSERTIONS

  insertHead(value) {
    const steps = [];
    const node = new SLLNode(value);

    steps.push({
      state: this.snapshot(this.head ? this.head._id : null),
      explanation: "To insert at head, only the head pointer and one node.next pointer need to change.",
      complexity: "Conceptual pointer rewiring is O(1)."
    });

    node.next = this.head;
    this.head = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id),
      explanation: `Inserted ${value} at head. Head now points to this new node.`,
      complexity: "Insert at head: O(1) regardless of list size."
    });

    return { ok: true, steps };
  }

  insertTail(value) {
    const steps = [];
    const node = new SLLNode(value);

    if (!this.head) {
      this.head = node;
      this.length = 1;
      steps.push({
        state: this.snapshot(node._id),
        explanation: "List was empty, so inserting at end is same as inserting at head.",
        complexity: "O(1)."
      });
      return { ok: true, steps };
    }

    let curr = this.head;
    let index = 0;
    while (curr.next) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing to tail: moving from node ${index} to node ${index + 1}.`,
        complexity: "Traversal: O(n) to reach current tail."
      });
      curr = curr.next;
      index++;
    }

    curr.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id),
      explanation: `Appended ${value} at the end by updating the last node's next pointer.`,
      complexity: "Insert at end: O(n) due to traversal from head to tail."
    });

    return { ok: true, steps };
  }

  insertAtIndex(index, value) {
    const steps = [];

    if (index < 0 || index > this.length) {
      steps.push({
        state: this.snapshot(),
        explanation: `Cannot insert at index ${index}. Valid indices are 0 through ${this.length}.`,
        complexity: "Bound check: O(1)."
      });
      return { ok: false, steps };
    }

    if (index === 0) {
      const res = this.insertHead(value);
      steps.push(...res.steps);
      return { ok: res.ok, steps };
    }

    const trav = this._traverseToIndex(index - 1);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const prev = trav.curr;
    const node = new SLLNode(value);

    node.next = prev.next;
    prev.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, prev._id, [prev._id, node._id]),
      explanation: `Inserted ${value} at index ${index} by updating prev.next and newNode.next pointers.`,
      complexity: "Traversal O(n) + O(1) pointer changes."
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

    let prev = this.head;
    let curr = this.head.next;
    let index = 1;

    while (curr && curr.value !== targetVal) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: current node at index ${index} does not match target ${targetVal}.`,
        complexity: "Traversal is O(n) in worst case."
      });
      prev = curr;
      curr = curr.next;
      index++;
    }

    if (!curr) {
      steps.push({
        state: this.snapshot(),
        explanation: `Value ${targetVal} not found, so cannot insert before it.`,
        complexity: "Search: O(n) with no successful match."
      });
      return { ok: false, steps };
    }

    const node = new SLLNode(newVal);
    node.next = curr;
    prev.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [prev._id, node._id]),
      explanation: `Inserted ${newVal} before the first occurrence of ${targetVal}.`,
      complexity: "Search + insert: O(n) for traversal, O(1) for pointer updates."
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

    const node = new SLLNode(newVal);
    node.next = curr.next;
    curr.next = node;
    this.length++;

    steps.push({
      state: this.snapshot(node._id, curr._id, [curr._id, node._id]),
      explanation: `Inserted ${newVal} after the first occurrence of ${targetVal}.`,
      complexity: "Search + insert: O(n) for traversal, O(1) for pointer updates."
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
      explanation: "Deleting head: head pointer will move to the second node.",
      complexity: "O(1)."
    });

    this.head = this.head.next;
    this.length--;

    steps.push({
      state: this.snapshot(null, removed._id),
      explanation: `Removed head node with value ${removed.value}. Remaining nodes are unchanged.`,
      complexity: "Delete head: O(1)."
    });

    if (this.length === 0) {
      steps.push({
        state: this.snapshot(),
        explanation: "List is now empty; head is null.",
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
        explanation: "Cannot delete from an empty list.",
        complexity: "O(1)."
      });
      return { ok: false, steps };
    }

    if (!this.head.next) {
      // single node
      const removed = this.head;
      this.head = null;
      this.length = 0;
      steps.push({
        state: this.snapshot(null, removed._id),
        explanation: `Deleted the only node (${removed.value}); list is now empty.`,
        complexity: "Single-node delete: O(1)."
      });
      return { ok: true, steps };
    }

    let prev = this.head;
    let curr = this.head.next;
    let index = 1;

    while (curr.next) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing towards tail: at index ${index}.`,
        complexity: "Traversal: O(n)."
      });
      prev = curr;
      curr = curr.next;
      index++;
    }

    prev.next = null;
    this.length--;

    steps.push({
      state: this.snapshot(null, curr._id, [prev._id]),
      explanation: `Deleted tail node with value ${curr.value} by setting prev.next to null.`,
      complexity: "Delete tail: O(n) due to traversal."
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

    const trav = this._traverseToIndex(index - 1);
    steps.push(...trav.steps);
    if (!trav.ok) return { ok: false, steps };

    const prev = trav.curr;
    const target = prev.next;

    prev.next = target.next;
    this.length--;

    steps.push({
      state: this.snapshot(null, target._id, [prev._id]),
      explanation: `Deleted node at index ${index} by bypassing it in the pointer chain (prev.next = target.next).`,
      complexity: "Delete at index: O(n) because of traversal."
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

    let prev = this.head;
    let curr = this.head.next;
    let index = 1;

    while (curr && curr.value !== value) {
      steps.push({
        state: this.snapshot(curr._id),
        explanation: `Traversing: node at index ${index} has value ${curr.value}, not target ${value}.`,
        complexity: "Search by value: O(n) in worst case."
      });
      prev = curr;
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

    prev.next = curr.next;
    this.length--;

    steps.push({
      state: this.snapshot(null, curr._id, [prev._id]),
      explanation: `Deleted first node with value ${value} by linking prev.next to curr.next.`,
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
      complexity: "Search successful: still O(n) in worst case."
    });

    return { ok: true, steps };
  }

  searchByIndex(index) {
    const trav = this._traverseToIndex(index);
    const steps = [...trav.steps];
    if (!trav.ok) return { ok: false, steps };

    steps.push({
      state: this.snapshot(trav.curr._id),
      explanation: `Node at index ${index} has value ${trav.curr.value}.`,
      complexity: "Access by index in linked list: O(n) because traversal is required."
    });

    return { ok: true, steps };
  }

  traverseAll() {
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
        explanation: `Visiting node at index ${index} with value ${curr.value}.`,
        complexity: "Full traversal: O(n) to visit every node once."
      });
      curr = curr.next;
      index++;
    }

    steps.push({
      state: this.snapshot(),
      explanation: "Traversal finished at null, which marks the end of the list.",
      complexity: "O(n)."
    });

    return { ok: true, steps };
  }
}

// Expose to other scripts
window.LinkedListModel = LinkedListModel;
window.SLLNode = SLLNode;
