// ui/bstControls.js
// Build + traversals + type check + insert/delete for main BST,
// and separate example trees for each type.

(function () {
  let mainModel = null;

  // Main BST elements
  const elementsInput = document.getElementById("bst-elements-input");
  const buildBtn = document.getElementById("bst-build-btn");
  const resetBtn = document.getElementById("bst-reset-btn");
  const initError = document.getElementById("bst-init-error");

  const treeContainer = document.getElementById("bst-tree-container");
  const explanationBox = document.getElementById("bst-explanation-box");

  const inorderBtn = document.getElementById("bst-inorder-btn");
  const preorderBtn = document.getElementById("bst-preorder-btn");
  const postorderBtn = document.getElementById("bst-postorder-btn");
  const traversalOutput = document.getElementById("bst-traversal-output");

  const checkTypeBtn = document.getElementById("bst-check-type-btn");
  const typeOutput = document.getElementById("bst-type-output");

  // Operations
  const opKeyInput = document.getElementById("bst-op-key-input");
  const insertBtn = document.getElementById("bst-insert-btn");
  const deleteBtn = document.getElementById("bst-delete-btn");
  const opError = document.getElementById("bst-op-error");

  // Example section
  const exampleContainer = document.getElementById("bst-example-tree-container");
  const examplesNote = document.getElementById("bst-examples-note");
  const exampleBinaryBtn = document.getElementById("bst-example-binary-btn");
  const exampleCompleteBtn = document.getElementById("bst-example-complete-btn");
  const exampleFullBtn = document.getElementById("bst-example-full-btn");
  const exampleLeftBtn = document.getElementById("bst-example-left-skewed-btn");
  const exampleRightBtn = document.getElementById("bst-example-right-skewed-btn");

  // Playback controls
  const prevBtn = document.getElementById("bst-prev-step-btn");
  const nextBtn = document.getElementById("bst-next-step-btn");
  const playPauseBtn = document.getElementById("bst-play-pause-btn");
  const speedSlider = document.getElementById("bst-speed-slider");
  const speedMinus = document.getElementById("bst-speed-decrease");
  const speedPlus = document.getElementById("bst-speed-increase");

  function parseElements(raw) {
    if (!raw.trim()) {
      throw new Error("Please enter at least one key.");
    }
    const parts = raw.split(",");
    const values = [];
    const seen = new Set();

    for (let p of parts) {
      const trimmed = p.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        throw new Error(`"${trimmed}" is not a valid number.`);
      }
      if (seen.has(num)) continue;
      seen.add(num);
      values.push(num);
    }

    if (!values.length) {
      throw new Error("No valid numeric keys were found.");
    }
    return values;
  }

  function parseKeyInput() {
    const raw = opKeyInput.value.trim();
    if (!raw) {
      throw new Error("Please enter a key.");
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      throw new Error(`"${raw}" is not a valid number.`);
    }
    return num;
  }

  function setMainButtonsEnabled(hasTree) {
    inorderBtn.disabled = !hasTree;
    preorderBtn.disabled = !hasTree;
    postorderBtn.disabled = !hasTree;
    checkTypeBtn.disabled = !hasTree;
    insertBtn.disabled = !hasTree;
    deleteBtn.disabled = !hasTree;
  }

  function setAllDisabled(disabled) {
    buildBtn.disabled = disabled;
    resetBtn.disabled = disabled;
    inorderBtn.disabled = disabled || inorderBtn.disabled;
    preorderBtn.disabled = disabled || preorderBtn.disabled;
    postorderBtn.disabled = disabled || postorderBtn.disabled;
    checkTypeBtn.disabled = disabled || checkTypeBtn.disabled;
    insertBtn.disabled = disabled || insertBtn.disabled;
    deleteBtn.disabled = disabled || deleteBtn.disabled;
  }

  // ----- Build / Reset -----
  function handleBuild() {
    initError.textContent = "";
    traversalOutput.textContent = "";
    typeOutput.textContent = "";
    opError.textContent = "";

    let values;
    try {
      values = parseElements(elementsInput.value);
    } catch (e) {
      initError.textContent = e.message;
      return;
    }

    mainModel = new window.BSTCore.BSTModel();
    const steps = mainModel.buildFromArray(values);

    window.BSTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox
    });

    setAllDisabled(true);
    window.BSTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  function handleReset() {
    if (mainModel) {
      mainModel.clear();
    }
    elementsInput.value = "";
    initError.textContent = "";
    traversalOutput.textContent = "";
    typeOutput.textContent = "";
    opError.textContent = "";
    setMainButtonsEnabled(false);

    if (treeContainer) treeContainer.innerHTML = "";
    if (explanationBox) {
      explanationBox.textContent =
        'Tree cleared. Enter keys and click "Build BST" to construct a new tree.';
    }
  }

  // ----- Traversals -----
  function runTraversal(type) {
    if (!mainModel) {
      traversalOutput.textContent = "Build the BST first.";
      return;
    }
    if (window.BSTAnimation.isRunning()) return;

    traversalOutput.textContent = "";
    typeOutput.textContent = "";
    opError.textContent = "";

    const steps = mainModel.traversalSteps(type);
    const order =
      type === "inorder"
        ? mainModel.inorderArray()
        : type === "preorder"
        ? mainModel.preorderArray()
        : mainModel.postorderArray();

    setAllDisabled(true);
    window.BSTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
      const label =
        type === "inorder"
          ? "Inorder order: "
          : type === "preorder"
          ? "Preorder order: "
          : "Postorder order: ";
      traversalOutput.textContent = label + order.join(", ");
    });
  }

  // ----- Type check -----
  function runTypeCheck() {
    if (!mainModel) {
      typeOutput.textContent = "Build the BST first.";
      return;
    }
    if (window.BSTAnimation.isRunning()) return;

    traversalOutput.textContent = "";
    typeOutput.textContent = "";
    opError.textContent = "";

    const steps = mainModel.typeCheckSteps();
    setAllDisabled(true);
    window.BSTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
      if (steps.length > 0) {
        typeOutput.textContent = steps[steps.length - 1].explanation;
      }
    });
  }

  // ----- Insert / Delete -----
  function runInsert() {
    opError.textContent = "";
    if (!mainModel) {
      opError.textContent = "Build the BST first.";
      return;
    }
    if (window.BSTAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.insertKeySteps(key);
    setAllDisabled(true);
    window.BSTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox
    });
    window.BSTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  function runDelete() {
    opError.textContent = "";
    if (!mainModel) {
      opError.textContent = "Build the BST first.";
      return;
    }
    if (window.BSTAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.deleteKeySteps(key);
    setAllDisabled(true);
    window.BSTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox
    });
    window.BSTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  // ----- Examples -----
  function runExample(kind) {
    examplesNote.textContent = "";
    if (!exampleContainer) return;

    const exampleModel = new window.BSTCore.BSTModel();
    let steps;
    if (kind === "binary") {
      steps = exampleModel.exampleBinarySteps();
      examplesNote.textContent = "Example of a generic BST shape.";
    } else if (kind === "complete") {
      steps = exampleModel.exampleCompleteSteps();
      examplesNote.textContent =
        "Example of a nearly complete binary tree: levels filled from the left.";
    } else if (kind === "full") {
      steps = exampleModel.exampleFullSteps();
      examplesNote.textContent =
        "Example of a full binary tree: every internal node has 2 children.";
    } else if (kind === "left") {
      steps = exampleModel.exampleLeftSkewedSteps();
      examplesNote.textContent =
        "Example of a left-skewed tree: nodes lean down the left side.";
    } else if (kind === "right") {
      steps = exampleModel.exampleRightSkewedSteps();
      examplesNote.textContent =
        "Example of a right-skewed tree: nodes lean down the right side.";
    } else {
      return;
    }

    window.BSTAnimation.init({
      model: exampleModel,
      treeContainer: exampleContainer,
      explanationBox
    });

    window.BSTAnimation.playSteps(steps, () => {});
  }

  // ----- Wire up -----
  if (buildBtn) buildBtn.addEventListener("click", handleBuild);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  if (inorderBtn) {
    inorderBtn.addEventListener("click", () => runTraversal("inorder"));
  }
  if (preorderBtn) {
    preorderBtn.addEventListener("click", () => runTraversal("preorder"));
  }
  if (postorderBtn) {
    postorderBtn.addEventListener("click", () => runTraversal("postorder"));
  }

  if (checkTypeBtn) {
    checkTypeBtn.addEventListener("click", runTypeCheck);
  }

  if (insertBtn) {
    insertBtn.addEventListener("click", runInsert);
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", runDelete);
  }

  if (exampleBinaryBtn) {
    exampleBinaryBtn.addEventListener("click", () => runExample("binary"));
  }
  if (exampleCompleteBtn) {
    exampleCompleteBtn.addEventListener("click", () => runExample("complete"));
  }
  if (exampleFullBtn) {
    exampleFullBtn.addEventListener("click", () => runExample("full"));
  }
  if (exampleLeftBtn) {
    exampleLeftBtn.addEventListener("click", () => runExample("left"));
  }
  if (exampleRightBtn) {
    exampleRightBtn.addEventListener("click", () => runExample("right"));
  }

  // Playback controls
  if (prevBtn && nextBtn && playPauseBtn && speedSlider) {
    prevBtn.addEventListener("click", () => {
      window.BSTAnimation.stepBackward();
    });

    nextBtn.addEventListener("click", () => {
      window.BSTAnimation.stepForward();
    });

    playPauseBtn.addEventListener("click", () => {
      const paused = window.BSTAnimation.togglePause();
      playPauseBtn.textContent = paused ? "Play" : "Pause";
    });

    speedSlider.addEventListener("input", () => {
      window.BSTAnimation.setSpeed(speedSlider.value);
    });

    if (speedMinus) {
      speedMinus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.max(1, val - 1);
        speedSlider.value = String(val);
        window.BSTAnimation.setSpeed(val);
      });
    }

    if (speedPlus) {
      speedPlus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.min(5, val + 1);
        speedSlider.value = String(val);
        window.BSTAnimation.setSpeed(val);
      });
    }
  }

  // initial state
  setMainButtonsEnabled(false);
})();
