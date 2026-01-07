// core/radixLogic.js
// Builds a step-by-step trace for LSD Radix Sort using Counting Sort on each digit (base 10). [web:153][web:160]

export function buildRadixSteps(initialArray) {
  const arr = initialArray.slice();
  const steps = [];

  if (arr.length === 0) return steps;

  const maxVal = Math.max(...arr);
  const base = 10;

  steps.push({
    type: "radix-init",
    base,
    maxVal,
    array: arr.slice(),
    message: `Radix Sort will process digits in base ${base} up to the most significant digit of ${maxVal}.`,
  });

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= base) {
    runDigitCountingSort(arr, exp, base, steps);
  }

  steps.push({
    type: "radix-done",
    array: arr.slice(),
    message: "Radix Sort completed. All elements are sorted.",
  });

  return steps;
}

// One pass of stable counting sort based on digit at exponent exp. [web:153][web:160]
function runDigitCountingSort(arr, exp, base, steps) {
  const n = arr.length;
  const output = new Array(n).fill(null);
  const count = new Array(base).fill(0);

  steps.push({
    type: "digit-pass-start",
    exp,
    base,
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: `Starting a new pass for digit at exponent ${exp} (1 = units, 10 = tens, ...).`,
  });

  // Step 1: count frequency of each digit
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % base;

    steps.push({
      type: "digit-read",
      index: i,
      value: arr[i],
      digit,
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Read element ${arr[i]} at index ${i}; its digit at exponent ${exp} is ${digit}.`,
    });

    count[digit]++;

    steps.push({
      type: "digit-count-update",
      index: i,
      value: arr[i],
      digit,
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Increment count for digit ${digit}; Count[${digit}] is now ${count[digit]}.`,
    });
  }

  // Step 2: prefix sums on count (cumulative positions)
  steps.push({
    type: "digit-prefix-start",
    exp,
    base,
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Convert digit counts into prefix sums for positions within this digit pass.",
  });

  for (let i = 1; i < base; i++) {
    const before = count[i];
    count[i] += count[i - 1];

    steps.push({
      type: "digit-prefix-update",
      countIndex: i,
      previousSum: before,
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Add Count[${i - 1}] to Count[${i}]; cumulative count at ${i} is now ${count[i]}.`,
    });
  }

  // Step 3: build output (stable) – traverse from right to left
  steps.push({
    type: "digit-build-output-start",
    exp,
    base,
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Build the output array for this digit by placing elements according to cumulative counts.",
  });

  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % base;

    steps.push({
      type: "digit-place-read",
      index: i,
      value: arr[i],
      digit,
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Read element ${arr[i]} at index ${i} with digit ${digit} to place in output.`,
    });

    const pos = count[digit] - 1;

    steps.push({
      type: "digit-place-write",
      index: i,
      value: arr[i],
      digit,
      pos,
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Place ${arr[i]} at output index ${pos} for digit ${digit} and decrement its count.`,
    });

    output[pos] = arr[i];
    count[digit]--;
  }

  // Step 4: copy output back to arr
  steps.push({
    type: "digit-copy-back-start",
    exp,
    base,
    array: arr.slice(),
    count: count.slice(),
    output: output.slice(),
    message: "Copy this digit-sorted output back to the main array before the next digit pass.",
  });

  for (let i = 0; i < n; i++) {
    arr[i] = output[i];

    steps.push({
      type: "digit-copy-back",
      index: i,
      value: arr[i],
      exp,
      base,
      array: arr.slice(),
      count: count.slice(),
      output: output.slice(),
      message: `Copy output[${i}] = ${arr[i]} back to array at index ${i}.`,
    });
  }
}
