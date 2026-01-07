// core/binaryLogic.js
// Builds a step-by-step trace for iterative Binary Search on a sorted array. [web:265][web:268]

export function buildBinarySteps(array, target) {
  const arr = array.slice();
  const steps = [];

  let low = 0;
  let high = arr.length - 1;

  steps.push({
    type: "init",
    array: arr.slice(),
    target,
    low,
    high,
    message: `Start binary search for ${target} in the sorted array with low = ${low} and high = ${high}.`,
  });

  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Step: check mid
    steps.push({
      type: "check-mid",
      array: arr.slice(),
      target,
      low,
      high,
      mid,
      value: arr[mid],
      message: `Check middle index ${mid} with value ${arr[mid]} (low = ${low}, high = ${high}).`,
    });

    if (arr[mid] === target) {
      foundIndex = mid;

      steps.push({
        type: "found",
        array: arr.slice(),
        target,
        low,
        high,
        mid,
        value: arr[mid],
        message: `Target ${target} found at index ${mid}.`,
      });
      break;
    }

    if (arr[mid] < target) {
      // Target in right half
      low = mid + 1;
      steps.push({
        type: "move-right",
        array: arr.slice(),
        target,
        low,
        high,
        mid,
        message: `Target ${target} is greater than ${arr[mid]}; move low to mid + 1 (= ${low}) and search right half.`,
      });
    } else {
      // Target in left half
      high = mid - 1;
      steps.push({
        type: "move-left",
        array: arr.slice(),
        target,
        low,
        high,
        mid,
        message: `Target ${target} is less than ${arr[mid]}; move high to mid - 1 (= ${high}) and search left half.`,
      });
    }
  }

  if (foundIndex === -1) {
    steps.push({
      type: "not-found",
      array: arr.slice(),
      target,
      low,
      high,
      message: `Search range is empty (low > high); target ${target} is not in the array.`,
    });
  }

  return steps;
}
