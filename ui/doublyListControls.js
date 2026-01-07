// ui/doublyListControls.js
// Wires inputs + buttons to DoublyLinkedListModel and DLLAnimator.

(function () {
  const initInput = document.getElementById("dll-elements-input");
  const initBtn = document.getElementById("dll-init-btn");
  const clearBtn = document.getElementById("dll-clear-btn");
  const initError = document.getElementById("dll-init-error");

  const indexInput = document.getElementById("dll-index-input");
  const valueInput = document.getElementById("dll-value-input");
  const targetValueInput = document.getElementById("dll-target-value-input");
  const opButtons = document.querySelectorAll(".dll-op-btn");
  const opError = document.getElementById("dll-op-error");

  if (!initBtn || !window.DoublyLinkedListModel || !window.DLLAnimator) {
    return; // not on this page
  }

  const list = new window.DoublyLinkedListModel();

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
        window.DLLAnimator.playSteps(result.steps);
      }
      return;
    }
    window.DLLAnimator.playSteps(result.steps || []);
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
    window.DLLAnimator.renderState(list.snapshot());
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

          case "traverse-forward":
            result = list.traverseForward();
            break;

          case "traverse-backward":
            result = list.traverseBackward();
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
