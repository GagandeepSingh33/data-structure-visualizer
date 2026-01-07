// ui/avlControls.js
// Wiring for AVL build, traversals, properties, insert/delete, and rotation examples.

(function () {
  let mainModel = null;

  const elementsInput = document.getElementById("avl-elements-input");
  const buildBtn = document.getElementById("avl-build-btn");
  const resetBtn = document.getElementById("avl-reset-btn");
  const initError = document.getElementById("avl-init-error");

  const treeContainer = document.getElementById("avl-tree-container");
  const explanationBox = document.getElementById("avl-explanation-box");
  const inlineBox = document.getElementById("avl-inline-explanation");

  const inorderBtn = document.getElementById("avl-inorder-btn");
  const preorderBtn = document.getElementById("avl-preorder-btn");
  const postorderBtn = document.getElementById("avl-postorder-btn");
  const traversalOutput = document.getElementById("avl-traversal-output");

  const checkPropsBtn = document.getElementById("avl-check-props-btn");
  const propsOutput = document.getElementById("avl-props-output");

  const opKeyInput = document.getElementById("avl-op-key-input");
  const insertBtn = document.getElementById("avl-insert-btn");
  const deleteBtn = document.getElementById("avl-delete-btn");
  const opError = document.getElementById("avl-op-error");

  const exampleContainer = document.getElementById("avl-example-tree-container");
  const examplesNote = document.getElementById("avl-examples-note");
  const exampleLLBtn = document.getElementById("avl-example-ll-btn");
  const exampleRRBtn = document.getElementById("avl-example-rr-btn");
  const exampleLRBtn = document.getElementById("avl-example-lr-btn");
  const exampleRLBtn = document.getElementById("avl-example-rl-btn");

  const prevBtn = document.getElementById("avl-prev-step-btn");
  const nextBtn = document.getElementById("avl-next-step-btn");
  const playPauseBtn = document.getElementById("avl-play-pause-btn");
  const speedSlider = document.getElementById("avl-speed-slider");
  const speedMinus = document.getElementById("avl-speed-decrease");
  const speedPlus = document.getElementById("avl-speed-increase");

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
    checkPropsBtn.disabled = !hasTree;
    insertBtn.disabled = !hasTree;
    deleteBtn.disabled = !hasTree;
  }

  function setAllDisabled(disabled) {
    buildBtn.disabled = disabled;
    resetBtn.disabled = disabled;
    inorderBtn.disabled = disabled || inorderBtn.disabled;
    preorderBtn.disabled = disabled || preorderBtn.disabled;
    postorderBtn.disabled = disabled || postorderBtn.disabled;
    checkPropsBtn.disabled = disabled || checkPropsBtn.disabled;
    insertBtn.disabled = disabled || insertBtn.disabled;
    deleteBtn.disabled = disabled || deleteBtn.disabled;
  }

  // Build / Reset
  function handleBuild() {
    initError.textContent = "";
    traversalOutput.textContent = "";
    propsOutput.textContent = "";
    opError.textContent = "";

    let values;
    try {
      values = parseElements(elementsInput.value);
    } catch (e) {
      initError.textContent = e.message;
      return;
    }

    mainModel = new window.AVLCore.AVLModel();
    const steps = mainModel.buildFromArray(values);

    AVLAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });

    setAllDisabled(true);
    AVLAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  function handleReset() {
    if (mainModel) mainModel.clear();
    elementsInput.value = "";
    initError.textContent = "";
    traversalOutput.textContent = "";
    propsOutput.textContent = "";
    opError.textContent = "";
    if (inlineBox) inlineBox.textContent = "";
    setMainButtonsEnabled(false);

    if (treeContainer) treeContainer.innerHTML = "";
    if (explanationBox) {
      explanationBox.textContent =
        'Tree cleared. Enter keys and click "Build AVL Tree" to construct a new tree.';
    }
  }

  // Traversals
  function runTraversal(type) {
    if (!mainModel) {
      traversalOutput.textContent = "Build the AVL tree first.";
      return;
    }
    if (AVLAnimation.isRunning()) return;

    traversalOutput.textContent = "";
    propsOutput.textContent = "";
    opError.textContent = "";

    const steps = mainModel.traversalSteps(type);
    const order =
      type === "inorder"
        ? mainModel.inorderArray()
        : type === "preorder"
        ? mainModel.preorderArray()
        : mainModel.postorderArray();

    setAllDisabled(true);
    AVLAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    AVLAnimation.playSteps(steps, () => {
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

  // Properties
  function runPropsCheck() {
    if (!mainModel) {
      propsOutput.textContent = "Build the AVL tree first.";
      return;
    }
    if (AVLAnimation.isRunning()) return;

    traversalOutput.textContent = "";
    propsOutput.textContent = "";
    opError.textContent = "";

    const steps = mainModel.propertiesSteps();
    setAllDisabled(true);
    AVLAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    AVLAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
      if (steps.length > 0) {
        propsOutput.textContent = steps[steps.length - 1].explanation;
      }
    });
  }

  // Insert / Delete
  function runInsert() {
    opError.textContent = "";
    if (!mainModel) {
      opError.textContent = "Build the AVL tree first.";
      return;
    }
    if (AVLAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.insertKeySteps(key);
    setAllDisabled(true);
    AVLAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    AVLAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  function runDelete() {
    opError.textContent = "";
    if (!mainModel) {
      opError.textContent = "Build the AVL tree first.";
      return;
    }
    if (AVLAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.deleteKeySteps(key);
    setAllDisabled(true);
    AVLAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    AVLAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  // Rotation examples (no inline text)
  function runExample(kind) {
    examplesNote.textContent = "";
    if (!exampleContainer) return;

    const exampleModel = new window.AVLCore.AVLModel();
    let steps;
    if (kind === "ll") {
      steps = exampleModel.exampleLLSteps();
      examplesNote.textContent =
        "LL case example: inserting keys in descending order triggers a right rotation.";
    } else if (kind === "rr") {
      steps = exampleModel.exampleRRSteps();
      examplesNote.textContent =
        "RR case example: inserting keys in ascending order triggers a left rotation.";
    } else if (kind === "lr") {
      steps = exampleModel.exampleLRSteps();
      examplesNote.textContent =
        "LR case example: left-right pattern causes a left rotation followed by a right rotation.";
    } else if (kind === "rl") {
      steps = exampleModel.exampleRLSteps();
      examplesNote.textContent =
        "RL case example: right-left pattern causes a right rotation followed by a left rotation.";
    } else {
      return;
    }

    AVLAnimation.init({
      model: exampleModel,
      treeContainer: exampleContainer,
      explanationBox
      // no inlineBox here; keep inline text for main tree only
    });

    AVLAnimation.playSteps(steps, () => {});
  }

  // Wiring
  if (buildBtn) buildBtn.addEventListener("click", handleBuild);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  if (inorderBtn) inorderBtn.addEventListener("click", () => runTraversal("inorder"));
  if (preorderBtn) preorderBtn.addEventListener("click", () => runTraversal("preorder"));
  if (postorderBtn) postorderBtn.addEventListener("click", () => runTraversal("postorder"));

  if (checkPropsBtn) checkPropsBtn.addEventListener("click", runPropsCheck);

  if (insertBtn) insertBtn.addEventListener("click", runInsert);
  if (deleteBtn) deleteBtn.addEventListener("click", runDelete);

  if (exampleLLBtn) exampleLLBtn.addEventListener("click", () => runExample("ll"));
  if (exampleRRBtn) exampleRRBtn.addEventListener("click", () => runExample("rr"));
  if (exampleLRBtn) exampleLRBtn.addEventListener("click", () => runExample("lr"));
  if (exampleRLBtn) exampleRLBtn.addEventListener("click", () => runExample("rl"));

  if (prevBtn && nextBtn && playPauseBtn && speedSlider) {
    prevBtn.addEventListener("click", () => AVLAnimation.stepBackward());
    nextBtn.addEventListener("click", () => AVLAnimation.stepForward());
    playPauseBtn.addEventListener("click", () => {
      const paused = AVLAnimation.togglePause();
      playPauseBtn.textContent = paused ? "Play" : "Pause";
    });
    speedSlider.addEventListener("input", () => {
      AVLAnimation.setSpeed(speedSlider.value);
    });
    if (speedMinus) {
      speedMinus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.max(1, val - 1);
        speedSlider.value = String(val);
        AVLAnimation.setSpeed(val);
      });
    }
    if (speedPlus) {
      speedPlus.addEventListener("click", () => {
        let val = Number(speedSlider.value);
        val = Math.min(5, val + 1);
        speedSlider.value = String(val);
        AVLAnimation.setSpeed(val);
      });
    }
  }

  setMainButtonsEnabled(false);
})();
