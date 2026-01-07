// core/linearLogic.js
// Builds a step-by-step trace for Linear Search. [web:237][web:243]

export function buildLinearSteps(array, target) {
  const arr = array.slice();
  const steps = [];

  // Initial state
  steps.push({
    type: "init",
    array: arr.slice(),
    target,
    message: `Start linear search for ${target} from the first element.`,
  });

  let foundIndex = -1;

  for (let i = 0; i < arr.length; i++) {
    // Step: check this index
    steps.push({
      type: "check",
      index: i,
      value: arr[i],
      target,
      array: arr.slice(),
      message: `Check index ${i}: compare element ${arr[i]} with target ${target}.`,
    });

    if (arr[i] === target) {
      foundIndex = i;

      // Step: found
      steps.push({
        type: "found",
        index: i,
        value: arr[i],
        target,
        array: arr.slice(),
        message: `Target ${target} found at index ${i}.`,
      });
      break;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      type: "not-found",
      target,
      array: arr.slice(),
      message: `Target ${target} not found in the array after checking all elements.`,
    });
  }

  return steps;
}
