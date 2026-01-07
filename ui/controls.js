// ui/controls.js
// Connects UI controls with ArrayModel and ArrayAnimation.

(function () {
  let model = null;

  const initSizeInput = document.getElementById("array-size-input");
  const initElementsInput = document.getElementById("array-elements-input");
  const initButton = document.getElementById("init-array-btn");
  const initError = document.getElementById("init-error");

  const indexInput = document.getElementById("op-index-input");
  const valueInput = document.getElementById("op-value-input");
  const opButtons = document.querySelectorAll(".op-btn");
  const opError = document.getElementById("op-error");

  const arrayContainer = document.getElementById("array-container");
  const newArrayContainer = document.getElementById("new-array-container");
  const explanationBox = document.getElementById("explanation-box");
  const capacityInfo = document.getElementById("capacity-info");

  function setControlsDisabled(disabled) {
    initButton.disabled = disabled;
    opButtons.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function parseInitialElements(raw, capacity) {
    if (!raw.trim()) return [];
    const parts = raw.split(",");
    const values = [];
    for (let p of parts) {
      const trimmed = p.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        throw new Error(`"${trimmed}" is not a valid number.`);
      }
      values.push(num);
      if (values.length >= capacity) break;
    }
    return values;
  }

  function initArray() {
    opError.textContent = "";
    initError.textContent = "";

    const size = Number(initSizeInput.value);
    if (!Number.isInteger(size) || size <= 0) {
      initError.textContent = "Array capacity must be a positive integer.";
      return;
    }
    if (size > 30) {
      initError.textContent = "For visualization, please keep capacity ≤ 30.";
      return;
    }

    let initialValues = [];
    try {
      initialValues = parseInitialElements(initElementsInput.value, size);
    } catch (e) {
      initError.textContent = e.message;
      return;
    }

    model = new window.ArrayCore.ArrayModel(size);

    window.ArrayAnimation.init({
      model,
      arrayContainer,
      newArrayContainer,
      explanationBox,
      capacityInfo
    });

    const initSteps = model.initWithValues(initialValues);
    setControlsDisabled(true);
    window.ArrayAnimation.playSteps(initSteps, () => {
      setControlsDisabled(false);
      explanationBox.textContent =
        "Array initialized. Use operations below to see index-based and value-based behavior.";
    });
  }

  function handleOperationClick(event) {
    if (!model) {
      opError.textContent = "Initialize the array first.";
      return;
    }

    if (window.ArrayAnimation.isRunning()) {
      return;
    }

    opError.textContent = "";

    const opType = event.currentTarget.dataset.op;
    const indexRaw = indexInput.value;
    const valueRaw = valueInput.value;

    let index = null;
    let value = null;

    if (indexRaw !== "") {
      const parsedIndex = Number(indexRaw);
      if (!Number.isInteger(parsedIndex)) {
        opError.textContent = "Index must be an integer.";
        return;
      }
      index = parsedIndex;
    }

    if (valueRaw.trim() !== "") {
      const num = Number(valueRaw);
      if (Number.isNaN(num)) {
        opError.textContent = "Value must be numeric for this visualizer.";
        return;
      }
      value = num;
    }

    let result = null;

    try {
      if (opType === "access") {
        if (index == null && value == null) {
          opError.textContent = "Provide an index or a value for access.";
          return;
        }
        result = model.access({ index, value });
      } else if (opType === "insert") {
        if (value == null && index == null) {
          opError.textContent =
            "Provide at least a value. Optional: also an index (for the resize demo if full).";
          return;
        }
        let allowResizeDemo = false;
        if (index != null && value != null) {
          allowResizeDemo = true;
        }
        result = model.insert({ index, value, allowResizeDemo });
      } else if (opType === "delete") {
        if (index == null && value == null) {
          opError.textContent = "Provide an index or a value to delete.";
          return;
        }
        result = model.delete({ index, value });
      } else if (opType === "update") {
        if (index == null || value == null) {
          opError.textContent =
            "For this demo, update requires both index (where to write) and value (new content).";
          return;
        }
        result = model.update({ index, value });
      }
    } catch (e) {
      console.error(e);
      opError.textContent = "Unexpected error during operation.";
      return;
    }

    if (!result || !result.steps) {
      opError.textContent = "Operation did not produce animation steps.";
      return;
    }

    setControlsDisabled(true);
    window.ArrayAnimation.playSteps(result.steps, () => {
      setControlsDisabled(false);
    });
  }

  initButton.addEventListener("click", initArray);
  opButtons.forEach((btn) => btn.addEventListener("click", handleOperationClick));
})();
