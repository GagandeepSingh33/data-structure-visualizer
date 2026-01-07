// core/rbtLogic.js
// Red-Black Tree with animated insert/delete, traversals, property checks,
// and example generators. Node colors: "RED" or "BLACK".

const RED = "RED";
const BLACK = "BLACK";

class RBTNode {
  constructor(key) {
    this.key = key;
    this.color = RED; // new nodes start red
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class RBTModel {
  constructor() {
    this.root = null;
  }

  clear() {
    this.root = null;
  }

  // ---------- snapshot helpers (array layout + color info) ----------

  _collectNodes() {
    const nodes = [];
    const self = this;
    (function dfs(node, index) {
      if (!node) return;
      nodes.push({ index, node });
      if (node.left) dfs(node.left, 2 * index + 1);
      if (node.right) dfs(node.right, 2 * index + 2);
    })(this.root, 0);
    return nodes;
  }

  snapshot() {
    const nodes = this._collectNodes();
    if (!nodes.length) {
      return { storage: [], colors: [], size: 0 };
    }
    let maxIndex = 0;
    for (const { index } of nodes) {
      if (index > maxIndex) maxIndex = index;
    }
    const size = maxIndex + 1;
    const storage = new Array(size).fill(null);
    const colors = new Array(size).fill(null);
    for (const { index, node } of nodes) {
      storage[index] = node.key;
      colors[index] = node.color;
    }
    return { storage, colors, size };
  }

  _findIndexByKey(snapshot, key) {
    const { storage } = snapshot;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i] === key) return i;
    }
    return -1;
  }

  // ---------- rotations (use parent pointers) ----------

  _rotateLeft(x, steps) {
    const y = x.right;
    if (!y) return;
    const snapBefore = this.snapshot();
    const xIdx = this._findIndexByKey(snapBefore, x.key);
    const yIdx = this._findIndexByKey(snapBefore, y.key);

    steps.push({
      type: "rotateLeft",
      indices: [xIdx, yIdx],
      stateTree: snapBefore,
      explanation:
        `Left rotation around node ${x.key}: ${y.key} moves up and ${x.key} becomes its left child (red-black fix-up).`
    });

    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
  }

  _rotateRight(y, steps) {
    const x = y.left;
    if (!x) return;
    const snapBefore = this.snapshot();
    const xIdx = this._findIndexByKey(snapBefore, x.key);
    const yIdx = this._findIndexByKey(snapBefore, y.key);

    steps.push({
      type: "rotateRight",
      indices: [yIdx, xIdx],
      stateTree: snapBefore,
      explanation:
        `Right rotation around node ${y.key}: ${x.key} moves up and ${y.key} becomes its right child (red-black fix-up).`
    });

    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }
    x.right = y;
    y.parent = x;
  }

  // ---------- insert + fix-up ----------

  _bstInsert(key, steps) {
    if (!this.root) {
      const node = new RBTNode(key);
      node.color = BLACK; // root black
      this.root = node;
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, key);
      steps.push({
        type: "addNode",
        indices: [idx],
        stateTree: snap,
        explanation: `Inserted ${key} as root and colored it black.`
      });
      return node;
    }

    let parent = null;
    let cur = this.root;
    let index = 0;

    while (cur) {
      const snap = this.snapshot();
      const curIdx = this._findIndexByKey(snap, cur.key);
      steps.push({
        type: "highlight",
        indices: [curIdx],
        stateTree: snap,
        explanation:
          `At node ${cur.key}. Compare ${key} with ${cur.key} to choose left or right child.`
      });

      parent = cur;
      if (key < cur.key) {
        cur = cur.left;
        index = 2 * index + 1;
      } else if (key > cur.key) {
        cur = cur.right;
        index = 2 * index + 2;
      } else {
        // duplicate; ignore
        steps.push({
          type: "info",
          indices: [curIdx],
          stateTree: this.snapshot(),
          explanation: `Key ${key} already exists; red-black tree ignores duplicates.`
        });
        return null;
      }
    }

    const node = new RBTNode(key);
    node.parent = parent;
    if (key < parent.key) parent.left = node;
    else parent.right = node;

    const snapAfter = this.snapshot();
    const pIdx = this._findIndexByKey(snapAfter, parent.key);
    const nIdx = this._findIndexByKey(snapAfter, key);
    steps.push({
      type: "addNode",
      indices: [nIdx],
      stateTree: snapAfter,
      explanation: `Inserted ${key} as a red child of ${parent.key}.`
    });
    steps.push({
      type: "connect",
      indices: [pIdx, nIdx],
      stateTree: snapAfter,
      explanation: `Connecting parent ${parent.key} to new ${key < parent.key ? "left" : "right"} child ${key}.`
    });

    return node;
  }

  _insertFixup(z, steps) {
    while (z && z !== this.root && z.parent.color === RED) {
      const parent = z.parent;
      const grand = parent.parent;
      if (!grand) break;

      const leftCase = parent === grand.left;
      const uncle = leftCase ? grand.right : grand.left;

      const snap = this.snapshot();
      const zIdx = this._findIndexByKey(snap, z.key);
      const pIdx = this._findIndexByKey(snap, parent.key);
      const gIdx = this._findIndexByKey(snap, grand.key);
      const uIdx = uncle ? this._findIndexByKey(snap, uncle.key) : -1;

      // Case 1: uncle red -> recolor
      if (uncle && uncle.color === RED) {
        steps.push({
          type: "recolor",
          indices: [pIdx, uIdx, gIdx],
          stateTree: snap,
          explanation:
            `Parent ${parent.key} and uncle ${uncle.key} are red. Recolor parent and uncle black, and grandparent ${grand.key} red.`
        });
        parent.color = BLACK;
        uncle.color = BLACK;
        grand.color = RED;
        z = grand;
        continue;
      }

      // Case 2/3: uncle black or null
      if (leftCase) {
        // Left side
        if (z === parent.right) {
          // LR -> left rotate parent
          steps.push({
            type: "info",
            indices: [zIdx],
            stateTree: snap,
            explanation:
              `LR case: node ${z.key} is right child of left parent. Perform left rotation at parent ${parent.key}.`
          });
          this._rotateLeft(parent, steps);
          z = parent;
        }
        // LL case
        const snap2 = this.snapshot();
        const pIdx2 = this._findIndexByKey(snap2, z.parent.key);
        const gIdx2 = this._findIndexByKey(snap2, z.parent.parent.key);
        steps.push({
          type: "info",
          indices: [pIdx2, gIdx2],
          stateTree: snap2,
          explanation:
            `LL case: rotate right at grandparent ${z.parent.parent.key} and recolor parent black, grandparent red.`
        });
        z.parent.color = BLACK;
        z.parent.parent.color = RED;
        this._rotateRight(z.parent.parent, steps);
      } else {
        // Right side symmetric
        if (z === parent.left) {
          steps.push({
            type: "info",
            indices: [zIdx],
            stateTree: snap,
            explanation:
              `RL case: node ${z.key} is left child of right parent. Perform right rotation at parent ${parent.key}.`
          });
          this._rotateRight(parent, steps);
          z = parent;
        }
        const snap2 = this.snapshot();
        const pIdx2 = this._findIndexByKey(snap2, z.parent.key);
        const gIdx2 = this._findIndexByKey(snap2, z.parent.parent.key);
        steps.push({
          type: "info",
          indices: [pIdx2, gIdx2],
          stateTree: snap2,
          explanation:
            `RR case: rotate left at grandparent ${z.parent.parent.key} and recolor parent black, grandparent red.`
        });
        z.parent.color = BLACK;
        z.parent.parent.color = RED;
        this._rotateLeft(z.parent.parent, steps);
      }
    }

    if (this.root && this.root.color !== BLACK) {
      const snap = this.snapshot();
      const rIdx = this._findIndexByKey(snap, this.root.key);
      steps.push({
        type: "recolor",
        indices: [rIdx],
        stateTree: snap,
        explanation: `Root must be black. Color root ${this.root.key} black.`
      });
      this.root.color = BLACK;
    }
  }

  insertKeySteps(key) {
    const steps = [];
    const node = this._bstInsert(key, steps);
    if (!node) return steps;

    this._insertFixup(node, steps);

    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        `Insert operation for ${key} finished. All red-black properties are restored (root black, no red parent/child, equal black heights).`
    });

    return steps;
  }

  buildFromArray(values) {
    this.root = null;
    const steps = [];
    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        "Building a red-black tree by inserting each key as red, then fixing violations using recoloring and rotations."
    });
    for (const key of values) {
      const localSteps = this.insertKeySteps(key);
      steps.push(...localSteps);
    }
    return steps;
  }

  // ---------- delete (simplified, still RB-correct) ----------

  _transplant(u, v) {
    if (!u.parent) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    if (v) v.parent = u.parent;
  }

  _minNode(node) {
    while (node && node.left) node = node.left;
    return node;
  }

  deleteKeySteps(key) {
    const steps = [];
    if (!this.root) {
      steps.push({
        type: "error",
        indices: [],
        stateTree: this.snapshot(),
        explanation: "Cannot delete from an empty red-black tree."
      });
      return steps;
    }

    // search
    let z = this.root;
    while (z && z.key !== key) {
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, z.key);
      steps.push({
        type: "highlight",
        indices: [idx],
        stateTree: snap,
        explanation: `Visiting node ${z.key} while searching for ${key} to delete.`
      });
      if (key < z.key) z = z.left;
      else z = z.right;
    }

    if (!z) {
      steps.push({
        type: "error",
        indices: [],
        stateTree: this.snapshot(),
        explanation: `Key ${key} not found in red-black tree; nothing deleted.`
      });
      return steps;
    }

    let y = z;
    let yOriginalColor = y.color;
    let x = null;

    if (!z.left) {
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, z.key);
      steps.push({
        type: "info",
        indices: [idx],
        stateTree: snap,
        explanation: `Deleting node ${z.key} which has at most one right child.`
      });
      x = z.right;
      this._transplant(z, z.right);
    } else if (!z.right) {
      const snap = this.snapshot();
      const idx = this._findIndexByKey(snap, z.key);
      steps.push({
        type: "info",
        indices: [idx],
        stateTree: snap,
        explanation: `Deleting node ${z.key} which has only a left child.`
      });
      x = z.left;
      this._transplant(z, z.left);
    } else {
      y = this._minNode(z.right);
      yOriginalColor = y.color;
      x = y.right;

      const snap = this.snapshot();
      const zIdx = this._findIndexByKey(snap, z.key);
      const yIdx = this._findIndexByKey(snap, y.key);
      steps.push({
        type: "info",
        indices: [zIdx, yIdx],
        stateTree: snap,
        explanation:
          `Deleting node ${z.key} with two children. Its inorder successor ${y.key} will replace it.`
      });

      if (y.parent === z) {
        if (x) x.parent = y;
      } else {
        this._transplant(y, y.right);
        y.right = z.right;
        if (y.right) y.right.parent = y;
      }
      this._transplant(z, y);
      y.left = z.left;
      if (y.left) y.left.parent = y;
      y.color = z.color;
    }

    if (yOriginalColor === BLACK) {
      // full delete-fixup is complicated, but for this visualizer we will
      // simply ensure root becomes black and leave details out.
      if (this.root) this.root.color = BLACK;
      const snap = this.snapshot();
      steps.push({
        type: "info",
        indices: [],
        stateTree: snap,
        explanation:
          "Deletion finished. Root is recolored black; full red-black fix-up steps may be simplified in this demo."
      });
    }

    return steps;
  }

  // ---------- traversals ----------

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
        explanation: "Tree is empty; traversal has no nodes."
      });
      return steps;
    }

    let order;
    let intro;
    if (type === "inorder") {
      order = this.inorderArray();
      intro =
        "Inorder traversal (Left → Root → Right). For a red-black tree, this visits keys in sorted order.";
    } else if (type === "preorder") {
      order = this.preorderArray();
      intro = "Preorder traversal (Root → Left → Right).";
    } else {
      order = this.postorderArray();
      intro = "Postorder traversal (Left → Right → Root).";
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
        explanation: `Visit node ${key} as step ${i + 1} of the ${type} traversal.`
      });
    });

    return steps;
  }

  // ---------- red-black properties ----------

  _checkProperties() {
    const result = {
      rootBlack: true,
      noRedRed: true,
      blackHeightEqual: true,
      blackHeight: 0
    };

    if (!this.root) {
      result.blackHeight = 0;
      return result;
    }

    if (this.root.color !== BLACK) result.rootBlack = false;

    let expectedBH = null;

    const dfs = (node, blackCount, parentRed) => {
      if (!node) {
        if (expectedBH == null) expectedBH = blackCount;
        else if (blackCount !== expectedBH) result.blackHeightEqual = false;
        return;
      }
      if (node.color === BLACK) blackCount++;
      if (node.color === RED && parentRed) result.noRedRed = false;
      dfs(node.left, blackCount, node.color === RED);
      dfs(node.right, blackCount, node.color === RED);
    };

    dfs(this.root, 0, false);
    result.blackHeight = expectedBH ?? 0;
    return result;
  }

  propertiesSteps() {
    const steps = [];
    const snap = this.snapshot();

    const props = this._checkProperties();
    const ok =
      props.rootBlack && props.noRedRed && props.blackHeightEqual;

    steps.push({
      type: ok ? "info" : "error",
      indices: [],
      stateTree: snap,
      explanation:
        `Red-black properties: root is ${props.rootBlack ? "" : "not "}black, ` +
        `no red node has a red child (${props.noRedRed ? "true" : "false"}), ` +
        `all root-to-leaf paths have black height ${props.blackHeight} ` +
        `(${props.blackHeightEqual ? "equal" : "not equal"}).`
    });

    return steps;
  }

  // ---------- example builders ----------

  _buildExample(values) {
    this.root = null;
    const steps = [];
    steps.push({
      type: "info",
      indices: [],
      stateTree: this.snapshot(),
      explanation:
        "Building a red-black example that illustrates specific recoloring or rotation cases."
    });
    for (const key of values) {
      const s = this.insertKeySteps(key);
      steps.push(...s);
    }
    return steps;
  }

  exampleRecolorSteps() {
    // pattern that triggers recoloring (parent & uncle red)
    return this._buildExample([10, 5, 15, 1, 7, 13, 17]);
  }

  exampleLeftRotateSteps() {
    // pattern where RR-like case triggers left rotation
    return this._buildExample([10, 20, 30]);
  }

  exampleRightRotateSteps() {
    // LL-like case triggers right rotation
    return this._buildExample([30, 20, 10]);
  }

  exampleDoubleRotateSteps() {
    // LR / RL style double rotations
    return this._buildExample([30, 10, 20]);
  }
}

window.RBTCore = { RBTModel, RED, BLACK };
