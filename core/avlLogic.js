// core/avlLogic.js
// AVL tree with animated insert/delete, traversals, properties,
// and rotation-case example generators.

class AVLNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLModel {
  constructor() {
    this.root = null;
  }

  clear() {
    this.root = null;
  }

  // height / balance helpers
  _height(node) {
    return node ? node.height : 0;
  }

  _updateHeight(node) {
    if (!node) return 0;
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    return node.height;
  }

  _balanceFactor(node) {
    return node ? this._height(node.left) - this._height(node.right) : 0;
  }

  // snapshot as array layout
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

  // rotations
  _rotateRight(y, index, steps) {
    const x = y.left;
    const T2 = x.right;

    const before = this.snapshot();
    const yIdx = this._findIndexByKey(before, y.key);
    const xIdx = this._findIndexByKey(before, x.key);

    steps.push({
      type: "rotateRight",
      indices: [yIdx, xIdx],
      stateTree: before,
      explanation:
        `Right rotation (LL case fix) around node ${y.key}: ${x.key} moves up and ${y.key} becomes its right child.`
    });

    x.right = y;
    y.left = T2;

    this._updateHeight(y);
    this._updateHeight(x);

    return x;
  }

  _rotateLeft(x, index, steps) {
    const y = x.right;
    const T2 = y.left;

    const before = this.snapshot();
    const xIdx = this._findIndexByKey(before, x.key);
    const yIdx = this._findIndexByKey(before, y.key);

    steps.push({
      type: "rotateLeft",
      indices: [xIdx, yIdx],
      stateTree: before,
      explanation:
        `Left rotation (RR case fix) around node ${x.key}: ${y.key} moves up and ${x.key} becomes its left child.`
    });

    y.left = x;
    x.right = T2;

    this._updateHeight(x);
    this._updateHeight(y);

    return y;
  }

  // AVL insert
  _insertAVL(node, key, index, steps) {
    if (!node) {
      const newNode = new AVLNode(key);
      const snap = this.snapshot();
      const idx = index;

      steps.push({
        type: "addNode",
        indices: [idx],
        stateTree: snap,
        explanation:
          snap.size === 0
            ? `Inserted ${key} as the root of the AVL tree.`
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
      explanation:
        `At node ${node.key}. Compare ${key} with ${node.key} to choose left or right subtree.`
    });

    if (key < node.key) {
      const childIndex = 2 * index + 1;
      node.left = this._insertAVL(node.left, key, childIndex, steps);
    } else if (key > node.key) {
      const childIndex = 2 * index + 2;
      node.right = this._insertAVL(node.right, key, childIndex, steps);
    } else {
      steps.push({
        type: "info",
        indices: [currentIdx],
        stateTree: this.snapshot(),
        explanation: `Key ${key} already exists in the AVL tree; duplicates are ignored.`
      });
      return node;
    }

    this._updateHeight(node);
    const balance = this._balanceFactor(node);

    // LL
    if (balance > 1 && key < node.left.key) {
      return this._rotateRight(node, index, steps);
    }
    // RR
    if (balance < -1 && key > node.right.key) {
      return this._rotateLeft(node, index, steps);
    }
    // LR
    if (balance > 1 && key > node.left.key) {
      node.left = this._rotateLeft(node.left, 2 * index + 1, steps);
      return this._rotateRight(node, index, steps);
    }
    // RL
    if (balance < -1 && key < node.right.key) {
      node.right = this._rotateRight(node.right, 2 * index + 2, steps);
      return this._rotateLeft(node, index, steps);
    }

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
        "Building an AVL tree by inserting each key and rebalancing with rotations whenever the balance factor goes outside −1, 0, 1."
    });

    for (const key of values) {
      this.root = this._insertAVL(this.root, key, 0, steps);

      steps.push({
        type: "info",
        indices: [],
        stateTree: this.snapshot(),
        explanation:
          `Finished inserting ${key}. Heights and balance factors are updated; rotations may have been applied.`
      });
    }

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation: "AVL build finished. The tree is height-balanced."
    });

    return steps;
  }

  insertKeySteps(key) {
    const steps = [];
    this.root = this._insertAVL(this.root, key, 0, steps);

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        `Insert operation finished for key ${key}. The AVL tree remains balanced after any necessary rotations.`
    });

    return steps;
  }

  // delete with rebalancing
  _findMinNode(node, steps) {
    while (node && node.left) {
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, node.key);
      steps.push({
        type: "highlight",
        indices: [idx],
        stateTree: snap,
        explanation:
          `Move left from node ${node.key} while searching for the minimum node (inorder successor).`
      });
      node = node.left;
    }
    return node;
  }

  _deleteAVL(node, key, index, steps, flag) {
    if (!node) return null;

    const snapBefore = this.snapshot();
    const idx = this._findIndexByKey(snapBefore, node.key);
    steps.push({
      type: "highlight",
      indices: [idx],
      stateTree: snapBefore,
      explanation:
        `At node ${node.key}. Compare ${key} with ${node.key} while searching for the key to delete.`
    });

    if (key < node.key) {
      node.left = this._deleteAVL(node.left, key, 2 * index + 1, steps, flag);
    } else if (key > node.key) {
      node.right = this._deleteAVL(node.right, key, 2 * index + 2, steps, flag);
    } else {
      flag.found = true;

      if (!node.left || !node.right) {
        const child = node.left ? node.left : node.right;
        const snap = this.snapshot();
        const delIdx = this._findIndexByKey(snap, node.key);
        steps.push({
          type: "info",
          indices: [delIdx],
          stateTree: snap,
          explanation:
            `Deleting node ${node.key} which has ${child ? "one child" : "no children"} in the AVL tree.`
        });
        return child;
      }

      const successor = this._findMinNode(node.right, steps);
      const snapSucc = this.snapshot();
      const succIdx = this._findIndexByKey(snapSucc, successor.key);
      steps.push({
        type: "info",
        indices: [succIdx],
        stateTree: snapSucc,
        explanation:
          `Node ${node.key} has two children. Its inorder successor ${successor.key} will replace its key.`
      });

      node.key = successor.key;
      node.right = this._deleteAVL(node.right, successor.key, 2 * index + 2, steps, flag);
    }

    this._updateHeight(node);
    const balance = this._balanceFactor(node);

    // LL
    if (balance > 1 && this._balanceFactor(node.left) >= 0) {
      return this._rotateRight(node, index, steps);
    }
    // LR
    if (balance > 1 && this._balanceFactor(node.left) < 0) {
      node.left = this._rotateLeft(node.left, 2 * index + 1, steps);
      return this._rotateRight(node, index, steps);
    }
    // RR
    if (balance < -1 && this._balanceFactor(node.right) <= 0) {
      return this._rotateLeft(node, index, steps);
    }
    // RL
    if (balance < -1 && this._balanceFactor(node.right) > 0) {
      node.right = this._rotateRight(node.right, 2 * index + 2, steps);
      return this._rotateLeft(node, index, steps);
    }

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
        explanation: "Cannot delete from an empty AVL tree."
      });
      return steps;
    }

    const flag = { found: false };
    this.root = this._deleteAVL(this.root, key, 0, steps, flag);

    if (!flag.found) {
      steps.push({
        type: "error",
        indices: [],
        stateTree: this.snapshot(),
        explanation: `Key ${key} was not found in the AVL tree; nothing was deleted.`
      });
    } else {
      steps.push({
        type: "info",
        indices: [],
        stateTree: this.snapshot(),
        explanation:
          `Delete operation finished for key ${key}. The AVL tree has been rebalanced if necessary.`
      });
    }

    return steps;
  }

  // traversals
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
      intro =
        "Running Inorder traversal: Left → Root → Right. In an AVL tree this visits keys in sorted order.";
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

  // properties
  _computeProps(node, depth, obj) {
    if (!node) return;
    const bf = this._balanceFactor(node);
    obj.minBF = Math.min(obj.minBF, bf);
    obj.maxBF = Math.max(obj.maxBF, bf);
    obj.maxDepth = Math.max(obj.maxDepth, depth);
    this._computeProps(node.left, depth + 1, obj);
    this._computeProps(node.right, depth + 1, obj);
  }

  propertiesSteps() {
    const steps = [];
    const snap = this.snapshot();

    if (!snap.size) {
      steps.push({
        type: "info",
        indices: [],
        stateTree: snap,
        explanation: "Tree is empty. Height is 0 and all balance factors are 0 by definition."
      });
      return steps;
    }

    const obj = { minBF: Infinity, maxBF: -Infinity, maxDepth: 0 };
    this._computeProps(this.root, 1, obj);

    const height = obj.maxDepth;
    const minBF = obj.minBF;
    const maxBF = obj.maxBF;
    const isAVL = minBF >= -1 && maxBF <= 1;

    steps.push({
      type: "info",
      indices: [],
      stateTree: snap,
      explanation:
        `AVL properties: height = ${height}, minimum balance factor = ${minBF}, maximum balance factor = ${maxBF}. ` +
        `All nodes ${isAVL ? "satisfy" : "do not satisfy"} the AVL condition (−1 ≤ bf ≤ 1).`
    });

    return steps;
  }

  // examples
  _buildExample(values) {
    this.root = null;
    const steps = [];
    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        "Building an AVL example by inserting preset keys that will trigger a specific rotation case."
    });

    for (const key of values) {
      this.root = this._insertAVL(this.root, key, 0, steps);
    }

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation: "Example AVL tree build finished."
    });

    return steps;
  }

  exampleLLSteps() {
    return this._buildExample([30, 20, 10]);
  }

  exampleRRSteps() {
    return this._buildExample([10, 20, 30]);
  }

  exampleLRSteps() {
    return this._buildExample([30, 10, 20]);
  }

  exampleRLSteps() {
    return this._buildExample([10, 30, 20]);
  }
}

window.AVLCore = { AVLModel };
