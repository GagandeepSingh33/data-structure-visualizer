// ui/stackControls.js
// Wires inputs + buttons to StackModel and StackAnimator.

(function () {
  const initInput = document.getElementById("stack-elements-input");
  const initBtn = document.getElementById("stack-init-btn");
  const clearBtn = document.getElementById("stack-clear-btn");
  const initError = document.getElementById("stack-init-error");

  const valueInput = document.getElementById("stack-value-input");
  const opButtons = document.querySelectorAll(".stack-op-btn");
  const opError = document.getElementById("stack-op-error");

  if (!initBtn || !window.StackModel || !window.StackAnimator) {
    return; // not on this page
  }

  const stack = new window.StackModel();

  function parseInitValues() {
    const raw = initInput.value.trim();
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function runStepsResult(result) {
    if (!result) return;
    if (result.ok === false) {
      if (result.steps && result.steps.length > 0) {
        window.StackAnimator.playSteps(result.steps);
      }
      return;
    }
    window.StackAnimator.playSteps(result.steps || []);
  }

  // INIT HANDLERS

  initBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";

    const values = parseInitValues();
    const steps = stack.initFromArray(values);
    runStepsResult({ ok: true, steps });
  });

  clearBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";
    stack.items = [];
    window.StackAnimator.renderState(stack.snapshot());
  });

  // OPERATIONS

  opButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      opError.textContent = "";
      const op = btn.getAttribute("data-op");
      const valueVal = valueInput.value.trim();

      let result = null;

      try {
        switch (op) {
          case "push":
            if (!valueVal) {
              opError.textContent = "Provide a value to push onto the stack.";
              return;
            }
            result = stack.push(valueVal);
            break;

          case "pop":
            result = stack.pop();
            break;

          case "peek":
            result = stack.peek();
            break;

          case "is-empty":
            result = stack.isEmptyCheck();
            break;

          case "size":
            result = stack.sizeCheck();
            break;

          case "search-value":
            if (!valueVal) {
              opError.textContent = "Provide a value to search in the stack.";
              return;
            }
            result = stack.searchValue(valueVal);
            break;

          case "clear-all":
            result = stack.clearAll();
            break;

          default:
            opError.textContent = "Unknown operation.";
            return;
        }
      } catch (e) {
        console.error(e);
        opError.textContent =
          "An error occurred while performing the operation.";
        return;
      }

      runStepsResult(result);
    });
  });
})();
