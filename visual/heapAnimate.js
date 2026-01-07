// visual/heapSortAnimate.js
// Renders the array and a side heap-tree view for Heap Sort.

(function () {
  let currentArray = [];
  let currentStep = null;

  function setHeapBaseArray(array) {
    currentArray = array.slice();
  }

  function getHeapBaseArray() {
    return currentArray.slice();
  }

  // Linear array rendering
  function renderHeapArray(containerEl, step) {
    currentStep = step;
    containerEl.innerHTML = "";

    const arr = step.array || currentArray;
    const n = arr.length;
    const heapSize = step.heapSize != null ? step.heapSize : n;

    for (let idx = 0; idx < n; idx++) {
      const cell = document.createElement("div");
      cell.className = "array-cell";
      cell.textContent = arr[idx];

      let isSorted = false;
      let isActive = false;

      // Sorted region
      if (step.heapType === "max") {
        if (idx >= heapSize) isSorted = true;
      } else {
        if (step.sortedIndex != null && idx <= step.sortedIndex) {
          isSorted = true;
        }
      }

      // Heapify highlighting
      if (
        step.type === "heapify-start" ||
        step.type === "heapify-compare-left" ||
        step.type === "heapify-compare-right" ||
        step.type === "heapify-swap" ||
        step.type === "heapify-done"
      ) {
        if (idx === step.index) {
          isActive = true;
        }
        if (
          (step.type === "heapify-compare-left" && idx === step.left) ||
          (step.type === "heapify-compare-right" && idx === step.right)
        ) {
          isActive = true;
        }
        if (step.type === "heapify-swap" && idx === step.swapIndex) {
          isActive = true;
        }
      }

      // Extraction highlighting
      if (
        step.type === "extract-swap-root" &&
        (idx === 0 || idx === step.sortedIndex)
      ) {
        isActive = true;
      }

      // Done: entire array sorted
      if (step.type === "heap-done") {
        isSorted = true;
      }

      // Phase 0 highlighting (array build)
      if (step.type === "array-insert" && idx === step.index) {
        isActive = true;
      }

      if (isActive) {
        cell.classList.add("cell-swap");
      }
      if (isSorted) {
        cell.classList.add("cell-sorted");
      }

      containerEl.appendChild(cell);
    }
  }

  // Tree view rendering with circles + lines (same style as heap visualizer)
  function renderHeapTree(treeContainerEl, step) {
    const arr = step.array || currentArray;
    const n = arr.length;
    const heapSize = step.heapSize != null ? step.heapSize : n;

    treeContainerEl.innerHTML = "";
    if (n === 0) return;

    const width = treeContainerEl.clientWidth || 600;
    const levels = Math.floor(Math.log2(n)) + 1;
    const levelHeight = 80;
    const height = levels * levelHeight + 40;
    treeContainerEl.style.height = `${height}px`;

    const positions = {};
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const levelStart = Math.pow(2, level) - 1;
      const offset = i - levelStart;
      const nodesInLevel = Math.pow(2, level);

      const y = (level + 1) * levelHeight;
      const segmentWidth = width / nodesInLevel;
      const x = segmentWidth * (offset + 0.5);

      positions[i] = { x, y };
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "heap-tree-edges");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    for (let i = 0; i < n; i++) {
      const parentPos = positions[i];
      if (!parentPos) continue;

      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && positions[left]) {
        const child = positions[left];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentPos.x);
        line.setAttribute("y1", parentPos.y + 20);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - 20);
        line.setAttribute("class", "heap-tree-edge");
        svg.appendChild(line);
      }

      if (right < n && positions[right]) {
        const child = positions[right];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentPos.x);
        line.setAttribute("y1", parentPos.y + 20);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - 20);
        line.setAttribute("class", "heap-tree-edge");
        svg.appendChild(line);
      }
    }

    treeContainerEl.appendChild(svg);

    for (let i = 0; i < n; i++) {
      const pos = positions[i];
      const node = document.createElement("div");
      node.classList.add("heap-tree-node");
      node.textContent = arr[i];

      let isSorted = false;
      let isActive = false;

      if (step.heapType === "max") {
        if (i >= heapSize) isSorted = true;
      } else {
        if (step.sortedIndex != null && i <= step.sortedIndex) {
          isSorted = true;
        }
      }

      if (
        step.type === "heapify-start" ||
        step.type === "heapify-compare-left" ||
        step.type === "heapify-compare-right" ||
        step.type === "heapify-swap" ||
        step.type === "heapify-done"
      ) {
        if (i === step.index) {
          isActive = true;
        }
        if (
          (step.type === "heapify-compare-left" && i === step.left) ||
          (step.type === "heapify-compare-right" && i === step.right)
        ) {
          isActive = true;
        }
        if (step.type === "heapify-swap" && i === step.swapIndex) {
          isActive = true;
        }
      }

      if (
        step.type === "extract-swap-root" &&
        (i === 0 || i === step.sortedIndex)
      ) {
        isActive = true;
      }

      if (step.type === "heap-done") {
        isSorted = true;
      }

      // Phase 0 highlighting
      if (step.type === "array-insert" && i === step.index) {
        isActive = true;
      }
      if (
        step.type === "tree-connect" &&
        (i === step.index || i === step.parentIndex)
      ) {
        isActive = true;
      }

      if (isActive) {
        node.classList.add("cell-swap");
      }
      if (isSorted) {
        node.classList.add("cell-sorted");
      }

      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      treeContainerEl.appendChild(node);
    }
  }

  function renderHeapState(arrayContainerEl, treeContainerEl, step) {
    renderHeapArray(arrayContainerEl, step);
    renderHeapTree(treeContainerEl, step);
  }

  window.HeapSortVisual = {
    setHeapBaseArray,
    getHeapBaseArray,
    renderHeapState
  };
})();
