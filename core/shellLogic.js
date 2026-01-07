// core/shellLogic.js
// Builds a step-by-step trace of Shell Sort using a simple gap sequence n/2, n/4, ..., 1. [web:95][web:96]

export function buildShellSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];
  const n = arr.length;

  // Start with gap = floor(n/2), then keep halving until 1. [web:95][web:96]
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      type: "gap-start",
      gap,
      array: arr.slice(),
      message: `Starting a new pass with gap = ${gap}. Elements this far apart are compared and gap-sorted.`,
    });

    // Gap-based insertion sort. [web:95][web:96][web:98]
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      steps.push({
        type: "gap-key-select",
        gap,
        i,
        j,
        key: temp,
        array: arr.slice(),
        message: `Take element at index ${i} as the key for gap-insertion with gap = ${gap}.`,
      });

      while (j >= gap && arr[j - gap] > temp) {
        steps.push({
          type: "gap-compare",
          gap,
          i,
          j,
          compareIndex: j - gap,
          key: temp,
          array: arr.slice(),
          message: `Compare key ${temp} with element at index ${j - gap} (${arr[j - gap]}). Since ${arr[j - gap]} > ${temp}, shift it by gap.`,
        });

        arr[j] = arr[j - gap];

        steps.push({
          type: "gap-shift",
          gap,
          i,
          fromIndex: j - gap,
          toIndex: j,
          key: temp,
          array: arr.slice(),
          message: `Element ${arr[j]} has been shifted from index ${j - gap} to index ${j}.`,
        });

        j -= gap;
      }

      steps.push({
        type: "gap-insert",
        gap,
        i,
        insertIndex: j,
        key: temp,
        array: arr.slice(),
        message: `Insert key ${temp} at index ${j} for this gap.`,
      });

      arr[j] = temp;

      steps.push({
        type: "gap-position-fixed",
        gap,
        i,
        array: arr.slice(),
        message: `After this insertion, elements that differ by gap = ${gap} are better ordered.`,
      });
    }
  }

  steps.push({
    type: "done",
    array: arr.slice(),
    message: "Shell Sort completed. After the final gap = 1 pass, the array is fully sorted.",
  });

  return steps;
}
