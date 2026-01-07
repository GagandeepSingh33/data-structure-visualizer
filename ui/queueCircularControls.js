// ui/queueCircularControls.js
// Connects DOM controls to CircularQueueModel and QueueAnimatorCircular.

(function () {
  const initInput = document.getElementById("queue-elements-input");
  const initBtn = document.getElementById("queue-init-btn");
  const clearBtn = document.getElementById("queue-clear-btn");
  const initError = document.getElementById("queue-init-error");

  const valueInput = document.getElementById("queue-value-input");
  const opButtons = document.querySelectorAll(".queue-op-btn");
  const opError = document.getElementById("queue-op-error");

  if (!initBtn || !window.CircularQueueModel || !window.QueueAnimatorCircular) {
    return;
  }

  const queue = new window.CircularQueueModel();

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
    const steps = result.steps || [];
    if (steps.length > 0) {
      window.QueueAnimatorCircular.playSteps(steps);
    } else {
      window.QueueAnimatorCircular.renderState(queue.snapshot());
    }
  }

  // INIT
  initBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";

    const values = parseInitValues();
    const steps = queue.initFromArray(values);
    runStepsResult({ ok: true, steps });
  });

  clearBtn.addEventListener("click", () => {
    initError.textContent = "";
    opError.textContent = "";

    const result = queue.clearAll();
    runStepsResult(result);
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
          case "enqueue":
            if (!valueVal) {
              opError.textContent =
                "Provide a value to enqueue into the circular queue.";
              return;
            }
            result = queue.enqueue(valueVal);
            break;

          case "dequeue":
            result = queue.dequeue();
            break;

          case "front":
            result = queue.frontPeek();
            break;

          case "rear":
            result = queue.rearPeek();
            break;

          case "is-empty":
            result = queue.isEmptyCheck();
            break;

          case "size":
            result = queue.sizeCheck();
            break;

          case "search-value":
            if (!valueVal) {
              opError.textContent =
                "Provide a value to search in the circular queue.";
              return;
            }
            result = queue.searchValue(valueVal);
            break;

          case "clear-all":
            result = queue.clearAll();
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
