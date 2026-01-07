// core/countingLogic.js
// Builds a step-by-step trace for Counting Sort: counting, prefix sums, and output placement. [web:134][web:141]

export function buildCountingSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  if (arr.length === 0) return steps;

  const maxVal = Math.max(...arr);
  const count = new Array(maxVal + 1).fill(0);
  const output = new Array(arr.length).fill(null);

  // Step 1: Initialize count array
  steps.push({
    type: "init-count",
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: `Initialize count array of size maxValue + 1 = ${maxVal + 1} with zeros.`,
  });

  // Step 2: Count frequencies
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];

    steps.push({
      type: "count-read",
      index: i,
      value: val,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Read element ${val} at index ${i} and increment its count.`,
    });

    count[val]++;

    steps.push({
      type: "count-update",
      index: i,
      value: val,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Count[${val}] is now ${count[val]}.`,
    });
  }

  // Step 3: Prefix sums (cumulative counts)
  steps.push({
    type: "prefix-start",
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Convert counts into prefix sums so each cell stores the last index of that value.",
  });

  for (let i = 1; i < count.length; i++) {
    const before = count[i];
    count[i] += count[i - 1];

    steps.push({
      type: "prefix-update",
      countIndex: i,
      previousSum: before,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Add Count[${i - 1}] to Count[${i}]; cumulative count at index ${i} is now ${count[i]}.`,
    });
  }

  // Step 4: Build output array (stable) – traverse input from right to left. [web:134][web:145]
  steps.push({
    type: "build-output-start",
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Build the sorted output array by placing elements according to their cumulative counts.",
  });

  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];

    steps.push({
      type: "place-read",
      index: i,
      value: val,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Read element ${val} at index ${i} to place it into the output array.`,
    });

    const pos = count[val] - 1;

    steps.push({
      type: "place-write",
      index: i,
      value: val,
      pos,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Place ${val} at output index ${pos} and decrement Count[${val}].`,
    });

    output[pos] = val;
    count[val]--;
  }

  // Step 5: Copy output back to arr
  steps.push({
    type: "copy-back-start",
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Copy the output array back into the original array.",
  });

  for (let i = 0; i < arr.length; i++) {
    arr[i] = output[i];

    steps.push({
      type: "copy-back",
      index: i,
      value: arr[i],
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Copy output[${i}] = ${arr[i]} back to the main array at index ${i}.`,
    });
  }

  steps.push({
    type: "done",
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Counting Sort completed. All elements are sorted.",
  });

  return steps;
}
