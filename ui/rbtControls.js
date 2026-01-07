// ui/rbtControls.js
// Wiring for red-black build, traversals, properties, insert/delete, and examples.

(function () {
  let mainModel = null;

  const elementsInput = document.getElementById("rbt-elements-input");
  const buildBtn = document.getElementById("rbt-build-btn");
  const resetBtn = document.getElementById("rbt-reset-btn");
  const initError = document.getElementById("rbt-init-error");

  const treeContainer = document.getElementById("rbt-tree-container");
  const explanationBox = document.getElementById("rbt-explanation-box");
  const inlineBox = document.getElementById("rbt-inline-explanation");

  const inorderBtn = document.getElementById("rbt-inorder-btn");
  const preorderBtn = document.getElementById("rbt-preorder-btn");
  const postorderBtn = document.getElementById("rbt-postorder-btn");
  const traversalOutput = document.getElementById("rbt-traversal-output");

  const checkPropsBtn = document.getElementById("rbt-check-props-btn");
  const propsOutput = document.getElementById("rbt-props-output");

  const opKeyInput = document.getElementById("rbt-op-key-input");
  const insertBtn = document.getElementById("rbt-insert-btn");
  const deleteBtn = document.getElementById("rbt-delete-btn");
  const opError = document.getElementById("rbt-op-error");

  const exampleContainer = document.getElementById("rbt-example-tree-container");
  const examplesNote = document.getElementById("rbt-examples-note");
  const exampleRecolorBtn = document.getElementById("rbt-example-recolor-btn");
  const exampleLeftBtn = document.getElementById("rbt-example-rotate-left-btn");
  const exampleRightBtn = document.getElementById("rbt-example-rotate-right-btn");
  const exampleDoubleBtn = document.getElementById("rbt-example-rotate-double-btn");

  const prevBtn = document.getElementById("rbt-prev-step-btn");
  const nextBtn = document.getElementById("rbt-next-step-btn");
  const playPauseBtn = document.getElementById("rbt-play-pause-btn");
  const speedSlider = document.getElementById("rbt-speed-slider");
  const speedMinus = document.getElementById("rbt-speed-decrease");
  const speedPlus = document.getElementById("rbt-speed-increase");

  function parseElements(raw) {
    if (!raw.trim()) throw new Error("Please enter at least one key.");
    const parts = raw.split(",");
    const values = [];
    const seen = new Set();
    for (let p of parts) {
      const t = p.trim();
      if (!t) continue;
      const num = Number(t);
      if (Number.isNaN(num)) throw new Error(`"${t}" is not a valid number.`);
      if (seen.has(num)) continue;
      seen.add(num);
      values.push(num);
    }
    if (!values.length) throw new Error("No valid numeric keys were found.");
    return values;
  }

  function parseKeyInput() {
    const raw = opKeyInput.value.trim();
    if (!raw) throw new Error("Please enter a key.");
    const num = Number(raw);
    if (Number.isNaN(num)) throw new Error(`"${raw}" is not a valid number.`);
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

    mainModel = new window.RBTCore.RBTModel();
    const steps = mainModel.buildFromArray(values);

    RBTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });

    setAllDisabled(true);
    RBTAnimation.playSteps(steps, () => {
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
        'Tree cleared. Enter keys and click "Build Red-Black Tree" to construct a new tree.';
    }
  }

  // Traversals
  function runTraversal(type) {
    if (!mainModel) {
      traversalOutput.textContent = "Build the red-black tree first.";
      return;
    }
    if (RBTAnimation.isRunning()) return;

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
    RBTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    RBTAnimation.playSteps(steps, () => {
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
      propsOutput.textContent = "Build the red-black tree first.";
      return;
    }
    if (RBTAnimation.isRunning()) return;

    traversalOutput.textContent = "";
    propsOutput.textContent = "";
    opError.textContent = "";

    const steps = mainModel.propertiesSteps();
    setAllDisabled(true);
    RBTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    RBTAnimation.playSteps(steps, () => {
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
      opError.textContent = "Build the red-black tree first.";
      return;
    }
    if (RBTAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.insertKeySteps(key);
    setAllDisabled(true);
    RBTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    RBTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  function runDelete() {
    opError.textContent = "";
    if (!mainModel) {
      opError.textContent = "Build the red-black tree first.";
      return;
    }
    if (RBTAnimation.isRunning()) return;

    let key;
    try {
      key = parseKeyInput();
    } catch (e) {
      opError.textContent = e.message;
      return;
    }

    const steps = mainModel.deleteKeySteps(key);
    setAllDisabled(true);
    RBTAnimation.init({
      model: mainModel,
      treeContainer,
      explanationBox,
      inlineBox
    });
    RBTAnimation.playSteps(steps, () => {
      setAllDisabled(false);
      setMainButtonsEnabled(true);
    });
  }

  // Examples (no inline text; uses example container)
  function runExample(kind) {
    examplesNote.textContent = "";
    if (!exampleContainer) return;

    const exampleModel = new window.RBTCore.RBTModel();
    let steps;
    if (kind === "recolor") {
      steps = exampleModel.exampleRecolorSteps();
      examplesNote.textContent =
        "Example where parent and uncle are red, so recoloring is enough to restore properties.";
    } else if (kind === "left") {
      steps = exampleModel.exampleLeftRotateSteps();
      examplesNote.textContent =
        "Example where a right-heavy configuration causes a left rotation.";
    } else if (kind === "right") {
      steps = exampleModel.exampleRightRotateSteps();
      examplesNote.textContent =
        "Example where a left-heavy configuration causes a right rotation.";
    } else if (kind === "double") {
      steps = exampleModel.exampleDoubleRotateSteps();
      examplesNote.textContent =
        "Example showing a double rotation (LR/RL style) during insert fix-up.";
    } else {
      return;
    }

    RBTAnimation.init({
      model: exampleModel,
      treeContainer: exampleContainer,
      explanationBox
      // no inlineBox – keep inline text for main tree
    });
    RBTAnimation.playSteps(steps, () => {});
  }

  // wiring
  if (buildBtn) buildBtn.addEventListener("click", handleBuild);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  if (inorderBtn) inorderBtn.addEventListener("click", () => runTraversal("inorder"));
  if (preorderBtn) preorderBtn.addEventListener("click", () => runTraversal("preorder"));
  if (postorderBtn) postorderBtn.addEventListener("click", () => runTraversal("postorder"));

  if (checkPropsBtn) checkPropsBtn.addEventListener("click", runPropsCheck);

  if (insertBtn) insertBtn.addEventListener("click", runInsert);
  if (deleteBtn) deleteBtn.addEventListener("click", runDelete);

  if (exampleRecolorBtn) exampleRecolorBtn.addEventListener("click", () => runExample("recolor"));
  if (exampleLeftBtn) exampleLeftBtn.addEventListener("click", () => runExample("left"));
  if (exampleRightBtn) exampleRightBtn.addEventListener("click", () => runExample("right"));
  if (exampleDoubleBtn) exampleDoubleBtn.addEventListener("click", () => runExample("double"));

  if (prevBtn && nextBtn && playPauseBtn && speedSlider) {
    prevBtn.addEventListener("click", () => RBTAnimation.stepBackward());
    nextBtn.addEventListener("click", () => RBTAnimation.stepForward());
    playPauseBtn.addEventListener("click", () => {
      const paused = RBTAnimation.togglePause();
      playPauseBtn.textContent = paused ? "Play" : "Pause";
    });
    speedSlider.addEventListener("input", () => {
      RBTAnimation.setSpeed(speedSlider.value);
    });
    if (speedMinus) {
      speedMinus.addEventListener("click", () => {
        let v = Number(speedSlider.value);
        v = Math.max(1, v - 1);
        speedSlider.value = String(v);
        RBTAnimation.setSpeed(v);
      });
    }
    if (speedPlus) {
      speedPlus.addEventListener("click", () => {
        let v = Number(speedSlider.value);
        v = Math.min(5, v + 1);
        speedSlider.value = String(v);
        RBTAnimation.setSpeed(v);
      });
    }
  }

  setMainButtonsEnabled(false);
})();
