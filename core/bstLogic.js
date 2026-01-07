// core/bstLogic.js
// Plain BST build with animated inserts, traversals, type checks,
// insert/delete operations, and example tree generators.

class BSTNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class BSTModel {
  constructor() {
    this.root = null;
  }

  clear() {
    this.root = null;
  }

  // ----- height helpers (for potential later use) -----
  _height(node) {
    return node ? node.height : 0;
  }

  _updateHeight(node) {
    if (!node) return 0;
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    return node.height;
  }

  // ----- snapshot for visualization -----
  _collectNodes() {
    const nodes = [];
    function dfs(node, index) {
      if (!node) return;
      nodes.push({ index, key: node.key });
      if (node.left) dfs(node.left, 2 * index + 1);
      if (node.right) dfs(node.right, 2 * index + 2);
    }
    dfs(this.root, 0);
    return nodes;
  }

  snapshot() {
    const nodes = this._collectNodes();
    if (!nodes.length) {
      return { storage: [], size: 0 };
    }
    let maxIndex = 0;
    for (const n of nodes) {
      if (n.index > maxIndex) maxIndex = n.index;
    }
    const size = maxIndex + 1;
    const storage = new Array(size).fill(null);
    for (const n of nodes) {
      storage[n.index] = n.key;
    }
    return { storage, size };
  }

  _findIndexByKey(snapshot, key) {
    const { storage } = snapshot;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i] === key) return i;
    }
    return -1;
  }

  // ============================================================
  // 1) Build: plain BST insert with steps
  // ============================================================

  _insertBST(node, key, index, steps) {
    if (!node) {
      const newNode = new BSTNode(key);
      const snap = this.snapshot();
      const idx = index;

      steps.push({
        type: "addNode",
        indices: [idx],
        stateTree: snap,
        explanation:
          snap.size === 0
            ? `Inserted ${key} as the root of the BST.`
            : `Inserted ${key} as a new leaf at conceptual index ${idx}.`
      });

      return newNode;
    }

    const snapBefore = this.snapshot();
    const currentIdx = this._findIndexByKey(snapBefore, node.key);

    steps.push({
      type: "highlight",
      indices: [currentIdx],
      stateTree: snapBefore,
      explanation: `At node ${node.key}. Compare ${key} with ${node.key} to decide left or right.`
    });

    if (key < node.key) {
      const childIndex = 2 * index + 1;
      if (!node.left) {
        node.left = this._insertBST(node.left, key, childIndex, steps);

        const snapAfter = this.snapshot();
        const parentIdx = this._findIndexByKey(snapAfter, node.key);
        const childIdx = this._findIndexByKey(snapAfter, key);
        steps.push({
          type: "connect",
          indices: [parentIdx, childIdx],
          stateTree: snapAfter,
          explanation: `Connecting parent ${node.key} to new left child ${key}.`
        });
      } else {
        node.left = this._insertBST(node.left, key, childIndex, steps);
      }
    } else if (key > node.key) {
      const childIndex = 2 * index + 2;
      if (!node.right) {
        node.right = this._insertBST(node.right, key, childIndex, steps);

        const snapAfter = this.snapshot();
        const parentIdx = this._findIndexByKey(snapAfter, node.key);
        const childIdx = this._findIndexByKey(snapAfter, key);
        steps.push({
          type: "connect",
          indices: [parentIdx, childIdx],
          stateTree: snapAfter,
          explanation: `Connecting parent ${node.key} to new right child ${key}.`
        });
      } else {
        node.right = this._insertBST(node.right, key, childIndex, steps);
      }
    } else {
      steps.push({
        type: "info",
        indices: [currentIdx],
        stateTree: this.snapshot(),
        explanation: `Key ${key} already exists in the tree; duplicates are ignored.`
      });
      return node;
    }

    this._updateHeight(node);
    return node;
  }

  buildFromArray(values) {
    this.root = null;
    const steps = [];

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        "Building a Binary Search Tree by inserting each key one at a time, without rebalancing."
    });

    for (const key of values) {
      this.root = this._insertBST(this.root, key, 0, steps);

      steps.push({
        type: "info",
        indices: [],
        stateTree: this.snapshot(),
        explanation:
          `Finished inserting ${key}. The BST shape depends on insertion order (no rotations applied).`
      });
    }

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        "BST build finished. You can now run traversals, operations, or check the tree type."
    });

    return steps;
  }

  // ============================================================
  // 2) Traversals
  // ============================================================

  _inorder(node, acc) {
    if (!node) return;
    this._inorder(node.left, acc);
    acc.push(node.key);
    this._inorder(node.right, acc);
  }

  _preorder(node, acc) {
    if (!node) return;
    acc.push(node.key);
    this._preorder(node.left, acc);
    this._preorder(node.right, acc);
  }

  _postorder(node, acc) {
    if (!node) return;
    this._postorder(node.left, acc);
    this._postorder(node.right, acc);
    acc.push(node.key);
  }

  inorderArray() {
    const res = [];
    this._inorder(this.root, res);
    return res;
  }

  preorderArray() {
    const res = [];
    this._preorder(this.root, res);
    return res;
  }

  postorderArray() {
    const res = [];
    this._postorder(this.root, res);
    return res;
  }

  traversalSteps(type) {
    const steps = [];
    const snap = this.snapshot();

    if (!snap.size) {
      steps.push({
        type: "info",
        indices: [],
        stateTree: snap,
        explanation: "Tree is empty, traversal has no nodes to visit."
      });
      return steps;
    }

    let order;
    let intro;
    if (type === "inorder") {
      order = this.inorderArray();
      intro = "Running Inorder traversal: Left → Root → Right.";
    } else if (type === "preorder") {
      order = this.preorderArray();
      intro = "Running Preorder traversal: Root → Left → Right.";
    } else {
      order = this.postorderArray();
      intro = "Running Postorder traversal: Left → Right → Root.";
    }

    steps.push({
      type: "info",
      indices: [],
      stateTree: snap,
      explanation: intro
    });

    const indexMap = new Map();
    const { storage } = snap;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i] != null) indexMap.set(storage[i], i);
    }

    order.forEach((key, i) => {
      const idx = indexMap.get(key);
      steps.push({
        type: "visit",
        indices: [idx],
        stateTree: this.snapshot(),
        explanation: `Visit node with key ${key} as step ${i + 1} of the ${type} traversal.`
      });
    });

    return steps;
  }

  // ============================================================
  // 3) Tree type checks
  // ============================================================

  _countNodes(node) {
    if (!node) return 0;
    return 1 + this._countNodes(node.left) + this._countNodes(node.right);
  }

  _isComplete() {
    if (!this.root) return true;
    const queue = [{ node: this.root, idx: 0 }];
    let count = 0;
    let lastIdx = 0;
    while (queue.length) {
      const { node, idx } = queue.shift();
      if (!node) continue;
      count++;
      lastIdx = idx;
      queue.push({ node: node.left, idx: 2 * idx + 1 });
      queue.push({ node: node.right, idx: 2 * idx + 2 });
    }
    return lastIdx === count - 1;
  }

  _isFull(node = this.root) {
    if (!node) return true;
    if (!node.left && !node.right) return true;
    if (!node.left || !node.right) return false;
    return this._isFull(node.left) && this._isFull(node.right);
  }

  _isLeftSkewed(node = this.root) {
    if (!node) return false;
    if (node.right) return false;
    if (!node.left) return true;
    return this._isLeftSkewed(node.left);
  }

  _isRightSkewed(node = this.root) {
    if (!node) return false;
    if (node.left) return false;
    if (!node.right) return true;
    return this._isRightSkewed(node.right);
  }

  typeCheckSteps() {
    const steps = [];
    const snap = this.snapshot();

    if (!snap.size) {
      steps.push({
        type: "info",
        indices: [],
        stateTree: snap,
        explanation:
          "Tree is empty, so it is trivially complete and full, and not skewed."
      });
      return steps;
    }

    const isComplete = this._isComplete();
    const isFull = this._isFull();
    const leftSkew = this._isLeftSkewed();
    const rightSkew = this._isRightSkewed();

    const parts = [];
    parts.push(isComplete ? "Complete" : "Not complete");
    parts.push(isFull ? "Full" : "Not full");
    if (leftSkew) parts.push("Left-skewed");
    if (rightSkew) parts.push("Right-skewed");
    if (!leftSkew && !rightSkew) parts.push("Not skewed");

    steps.push({
      type: "info",
      indices: [],
      stateTree: snap,
      explanation:
        `Tree type: ${parts.join(", ")}. A complete tree is filled level by level from the left, ` +
        `a full tree has 0 or 2 children at every node, and a skewed tree has all nodes leaning to one side.`
    });

    return steps;
  }

  // ============================================================
  // 4) Insert / Delete operations on existing tree
  // ============================================================

  insertKeySteps(key) {
    const steps = [];
    // reuse BST insert
    this.root = this._insertBST(this.root, key, 0, steps);

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        `Insert operation finished for key ${key}. The BST property is preserved; shape depends on insertion path.`
    });

    return steps;
  }

  _findMin(node, steps) {
    while (node && node.left) {
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, node.key);
      steps.push({
        type: "highlight",
        indices: [idx],
        stateTree: snap,
        explanation: `Move left from node ${node.key} to find the minimum in this subtree.`
      });
      node = node.left;
    }
    return node;
  }

  _deleteBST(node, key, index, steps, foundFlag) {
    if (!node) return null;

    const snapBefore = this.snapshot();
    const idx = this._findIndexByKey(snapBefore, node.key);
    steps.push({
      type: "highlight",
      indices: [idx],
      stateTree: snapBefore,
      explanation: `At node ${node.key}. Compare ${key} with ${node.key} while searching for the key to delete.`
    });

    if (key < node.key) {
      node.left = this._deleteBST(node.left, key, 2 * index + 1, steps, foundFlag);
    } else if (key > node.key) {
      node.right = this._deleteBST(node.right, key, 2 * index + 2, steps, foundFlag);
    } else {
      // found
      foundFlag.found = true;
      // node with only one child or no child
      if (!node.left || !node.right) {
        const child = node.left ? node.left : node.right;
        const snap = this.snapshot();
        const delIdx = this._findIndexByKey(snap, node.key);
        steps.push({
          type: "info",
          indices: [delIdx],
          stateTree: snap,
          explanation:
            `Deleting node ${node.key} which has ${child ? "one child" : "no children"}.`
        });
        return child;
      }

      // node with two children: get inorder successor
      const successor = this._findMin(node.right, steps);
      const snapSucc = this.snapshot();
      const succIdx = this._findIndexByKey(snapSucc, successor.key);
      steps.push({
        type: "info",
        indices: [succIdx],
        stateTree: snapSucc,
        explanation:
          `Node ${node.key} has two children. Its inorder successor is ${successor.key} in the right subtree.`
      });

      node.key = successor.key;
      node.right = this._deleteBST(node.right, successor.key, 2 * index + 2, steps, foundFlag);
    }

    this._updateHeight(node);
    return node;
  }

  deleteKeySteps(key) {
    const steps = [];
    const snap = this.snapshot();
    if (!snap.size) {
      steps.push({
        type: "error",
        indices: [],
        stateTree: snap,
        explanation: "Cannot delete from an empty tree."
      });
      return steps;
    }

    const flag = { found: false };
    this.root = this._deleteBST(this.root, key, 0, steps, flag);

    if (!flag.found) {
      steps.push({
        type: "error",
        indices: [],
        stateTree: this.snapshot(),
        explanation: `Key ${key} was not found in the BST; nothing was deleted.`
      });
    } else {
      steps.push({
        type: "info",
        indices: [],
        stateTree: this.snapshot(),
        explanation: `Delete operation finished for key ${key}. Subtrees have been re-linked to preserve BST order.`
      });
    }

    return steps;
  }

  // ============================================================
  // 5) Example generators
  // ============================================================

  _buildFromSpecificValues(values) {
    this.root = null;
    const steps = [];
    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation: "Building an example tree by inserting preset keys."
    });
    for (const key of values) {
      this.root = this._insertBST(this.root, key, 0, steps);
    }
    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation: "Example tree build finished."
    });
    return steps;
  }

  exampleBinarySteps() {
    const values = [8, 3, 10, 1, 6, 14, 4, 7, 13];
    return this._buildFromSpecificValues(values);
  }

  exampleCompleteSteps() {
    const values = [8, 4, 12, 2, 6, 10, 14];
    return this._buildFromSpecificValues(values);
  }

  exampleFullSteps() {
    const values = [8, 4, 12, 2, 6, 10, 14];
    return this._buildFromSpecificValues(values);
  }

  exampleLeftSkewedSteps() {
    const values = [1, 2, 3, 4, 5];
    return this._buildFromSpecificValues(values);
  }

  exampleRightSkewedSteps() {
    const values = [5, 4, 3, 2, 1];
    return this._buildFromSpecificValues(values);
  }
}

window.BSTCore = { BSTModel };
