// ui/singlyCircularControls.js
// Wires inputs + buttons to CircularSinglyLinkedListModel and CSLLAnimator.

(function () {
  const initInput = document.getElementById("csll-elements-input");
  const initBtn = document.getElementById("csll-init-btn");
  const clearBtn = document.getElementById("csll-clear-btn");
  const initError = document.getElementById("csll-init-error");

  const indexInput = document.getElementById("csll-index-input");
  const valueInput = document.getElementById("csll-value-input");
  const targetValueInput = document.getElementById("csll-target-value-input");
  const opButtons = document.querySelectorAll(".csll-op-btn");
  const opError = document.getElementById("csll-op-error");

  if (!initBtn || !window.CircularSinglyLinkedListModel || !window.CSLLAnimator) {
    return; // not on this page
  }

  const list = new window.CircularSinglyLinkedListModel();

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
        window.CSLLAnimator.playSteps(result.steps);
      }
      return;
    }
    window.CSLLAnimator.playSteps(result.steps || []);
  }

  // INIT HANDLERS

  initBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";

    const values = parseInitValues();
    const steps = list.initFromArray(values);
    runStepsResult({ ok: true, steps });
  });

  clearBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";
    list.head = null;
    list.tail = null;
    list.length = 0;
    window.CSLLAnimator.renderState(list.snapshot());
  });

  // OPERATIONS

  opButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      opError.textContent = "";
      const op = btn.getAttribute("data-op");
      const indexValRaw = indexInput.value;
      const valueVal = valueInput.value.trim();
      const targetVal = targetValueInput.value.trim();

      let indexVal =
        indexValRaw === "" || indexValRaw === null
          ? null
          : parseInt(indexValRaw, 10);

      let result = null;

      try {
        switch (op) {
          // INSERTS
          case "insert-head":
            if (!valueVal) {
              opError.textContent = "Provide a value to insert at head.";
              return;
            }
            result = list.insertHead(valueVal);
            break;

          case "insert-index":
            if (indexVal === null || isNaN(indexVal)) {
              opError.textContent = "Provide an index for insert at index.";
              return;
            }
            if (!valueVal) {
              opError.textContent = "Provide a value for insert at index.";
              return;
            }
            result = list.insertAtIndex(indexVal, valueVal);
            break;

          case "insert-before":
            if (!targetVal) {
              opError.textContent = "Provide target value to insert before.";
              return;
            }
            if (!valueVal) {
              opError.textContent = "Provide new value to insert.";
              return;
            }
            result = list.insertBeforeValue(targetVal, valueVal);
            break;

          case "insert-after":
            if (!targetVal) {
              opError.textContent = "Provide target value to insert after.";
              return;
            }
            if (!valueVal) {
              opError.textContent = "Provide new value to insert.";
              return;
            }
            result = list.insertAfterValue(targetVal, valueVal);
            break;

          case "insert-tail":
            if (!valueVal) {
              opError.textContent = "Provide a value to insert at end.";
              return;
            }
            result = list.insertTail(valueVal);
            break;

          // DELETES
          case "delete-head":
            result = list.deleteHead();
            break;

          case "delete-index":
            if (indexVal === null || isNaN(indexVal)) {
              opError.textContent = "Provide an index to delete at index.";
              return;
            }
            result = list.deleteAtIndex(indexVal);
            break;

          case "delete-value":
            if (!valueVal) {
              opError.textContent = "Provide a value to delete.";
              return;
            }
            result = list.deleteByValue(valueVal);
            break;

          case "delete-tail":
            result = list.deleteTail();
            break;

          // SEARCH + TRAVERSAL
          case "search-value":
            if (!valueVal) {
              opError.textContent = "Provide a value to search.";
              return;
            }
            result = list.searchByValue(valueVal);
            break;

          case "search-index":
            if (indexVal === null || isNaN(indexVal)) {
              opError.textContent = "Provide an index to search.";
              return;
            }
            result = list.searchByIndex(indexVal);
            break;

          case "traverse-once":
            result = list.traverseOnceFromHead();
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
