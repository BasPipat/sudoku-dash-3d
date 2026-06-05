// verify_template.js — Node.js script to verify the 3D Sudoku template board
// Run with: node verify_template.js

const TEMPLATE_BOARD = [
  [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8]
  ],
  [
    [8, 6, 4, 9, 7, 2, 5, 3, 1],
    [2, 9, 7, 3, 1, 5, 8, 6, 4],
    [5, 3, 1, 6, 4, 8, 2, 9, 7],
    [6, 7, 8, 1, 2, 9, 3, 4, 5],
    [9, 1, 2, 4, 5, 3, 6, 7, 8],
    [3, 4, 5, 7, 8, 6, 9, 1, 2],
    [1, 2, 9, 5, 3, 4, 7, 8, 6],
    [4, 5, 3, 8, 6, 7, 1, 2, 9],
    [7, 8, 6, 2, 9, 1, 4, 5, 3]
  ],
  [
    [9, 7, 5, 8, 3, 1, 6, 4, 2],
    [3, 1, 8, 2, 6, 4, 9, 7, 5],
    [6, 4, 2, 5, 9, 7, 3, 1, 8],
    [1, 5, 9, 3, 4, 8, 7, 2, 6],
    [4, 8, 3, 6, 7, 2, 1, 5, 9],
    [7, 2, 6, 9, 1, 5, 4, 8, 3],
    [8, 6, 7, 1, 2, 9, 5, 3, 4],
    [2, 9, 1, 4, 5, 3, 8, 6, 7],
    [5, 3, 4, 7, 8, 6, 2, 9, 1]
  ],
  [
    [2, 4, 6, 5, 1, 9, 3, 7, 8],
    [5, 7, 9, 8, 4, 3, 6, 1, 2],
    [8, 1, 3, 2, 7, 6, 9, 4, 5],
    [4, 6, 2, 7, 9, 5, 1, 8, 3],
    [7, 9, 5, 1, 3, 8, 4, 2, 6],
    [1, 3, 8, 4, 6, 2, 7, 5, 9],
    [9, 8, 4, 3, 5, 7, 2, 6, 1],
    [3, 2, 7, 6, 8, 1, 5, 9, 4],
    [6, 5, 1, 9, 2, 4, 8, 3, 7]
  ],
  [
    [3, 5, 1, 7, 6, 8, 2, 9, 4],
    [6, 8, 4, 1, 9, 2, 5, 3, 7],
    [9, 2, 7, 4, 3, 5, 8, 6, 1],
    [5, 1, 3, 6, 8, 4, 9, 7, 2],
    [8, 4, 6, 9, 2, 7, 3, 1, 5],
    [2, 7, 9, 3, 5, 1, 6, 4, 8],
    [7, 3, 2, 8, 1, 6, 4, 5, 9],
    [1, 6, 5, 2, 4, 9, 7, 8, 3],
    [4, 9, 8, 5, 7, 3, 1, 2, 6]
  ],
  [
    [7, 9, 8, 3, 2, 4, 1, 5, 6],
    [1, 3, 2, 6, 5, 7, 4, 8, 9],
    [4, 6, 5, 9, 8, 1, 7, 2, 3],
    [9, 8, 7, 2, 1, 3, 5, 6, 4],
    [3, 2, 1, 5, 4, 6, 8, 9, 7],
    [6, 5, 4, 8, 7, 9, 2, 3, 1],
    [5, 1, 6, 4, 9, 2, 3, 7, 8],
    [8, 4, 9, 7, 3, 5, 6, 1, 2],
    [2, 7, 3, 1, 6, 8, 9, 4, 5]
  ],
  [
    [4, 3, 2, 1, 9, 5, 8, 6, 7],
    [7, 6, 5, 4, 3, 8, 2, 9, 1],
    [1, 9, 8, 7, 6, 2, 5, 3, 4],
    [3, 2, 1, 8, 7, 6, 4, 5, 9],
    [6, 5, 4, 2, 1, 9, 7, 8, 3],
    [9, 8, 7, 5, 4, 3, 1, 2, 6],
    [2, 7, 3, 9, 8, 1, 6, 4, 5],
    [5, 1, 6, 3, 2, 4, 9, 7, 8],
    [8, 4, 9, 6, 5, 7, 3, 1, 2]
  ],
  [
    [6, 8, 7, 2, 4, 3, 9, 1, 5],
    [9, 2, 1, 5, 7, 6, 3, 4, 8],
    [3, 5, 4, 8, 1, 9, 6, 7, 2],
    [8, 4, 6, 9, 5, 1, 2, 3, 7],
    [2, 7, 9, 3, 8, 4, 5, 6, 1],
    [5, 1, 3, 6, 2, 7, 8, 9, 4],
    [4, 9, 8, 7, 6, 5, 1, 2, 3],
    [7, 3, 2, 1, 9, 8, 4, 5, 6],
    [1, 6, 5, 4, 3, 2, 7, 8, 9]
  ],
  [
    [5, 1, 9, 6, 8, 7, 4, 2, 3],
    [8, 4, 3, 9, 2, 1, 7, 5, 6],
    [2, 7, 6, 3, 5, 4, 1, 8, 9],
    [7, 9, 5, 4, 3, 2, 6, 1, 8],
    [1, 3, 8, 7, 6, 5, 9, 4, 2],
    [4, 6, 2, 1, 9, 8, 3, 7, 5],
    [6, 5, 1, 2, 4, 3, 8, 9, 7],
    [9, 8, 4, 5, 7, 6, 2, 3, 1],
    [3, 2, 7, 8, 1, 9, 5, 6, 4]
  ]
];

const VALID_SET = new Set([1,2,3,4,5,6,7,8,9]);

function checkGroup(label, values) {
  const set = new Set(values);
  if (set.size !== 9 || !values.every(v => VALID_SET.has(v))) {
    return `FAIL: ${label} -> [${values.join(',')}]`;
  }
  return null;
}

let errors = [];
let checks = 0;

// 1. Check Z-slice rows (9 slices × 9 rows = 81 checks)
for (let z = 0; z < 9; z++) {
  for (let y = 0; y < 9; y++) {
    const vals = TEMPLATE_BOARD[z][y];
    const err = checkGroup(`Z-slice z=${z} row y=${y}`, vals);
    if (err) errors.push(err);
    checks++;
  }
}

// 2. Check Z-slice cols (9 slices × 9 cols = 81 checks)
for (let z = 0; z < 9; z++) {
  for (let x = 0; x < 9; x++) {
    const vals = [];
    for (let y = 0; y < 9; y++) vals.push(TEMPLATE_BOARD[z][y][x]);
    const err = checkGroup(`Z-slice z=${z} col x=${x}`, vals);
    if (err) errors.push(err);
    checks++;
  }
}

// 3. Check Z-slice 3x3 boxes (9 slices × 9 boxes = 81 checks)
for (let z = 0; z < 9; z++) {
  for (let by = 0; by < 3; by++) {
    for (let bx = 0; bx < 3; bx++) {
      const vals = [];
      for (let dy = 0; dy < 3; dy++)
        for (let dx = 0; dx < 3; dx++)
          vals.push(TEMPLATE_BOARD[z][by*3+dy][bx*3+dx]);
      const err = checkGroup(`Z-slice z=${z} box (by=${by},bx=${bx})`, vals);
      if (err) errors.push(err);
      checks++;
    }
  }
}

// 4. Check Depth pillars (9 × 9 = 81 checks)
for (let y = 0; y < 9; y++) {
  for (let x = 0; x < 9; x++) {
    const vals = [];
    for (let z = 0; z < 9; z++) vals.push(TEMPLATE_BOARD[z][y][x]);
    const err = checkGroup(`Depth pillar y=${y} x=${x}`, vals);
    if (err) errors.push(err);
    checks++;
  }
}

// 5. Check X-slice 3x3 boxes (9 x-positions × 9 boxes = 81 checks)
for (let x = 0; x < 9; x++) {
  for (let by = 0; by < 3; by++) {
    for (let bz = 0; bz < 3; bz++) {
      const vals = [];
      for (let dy = 0; dy < 3; dy++)
        for (let dz = 0; dz < 3; dz++)
          vals.push(TEMPLATE_BOARD[bz*3+dz][by*3+dy][x]);
      const err = checkGroup(`X-slice x=${x} box (by=${by},bz=${bz})`, vals);
      if (err) errors.push(err);
      checks++;
    }
  }
}

// 6. Check Y-slice 3x3 boxes (9 y-positions × 9 boxes = 81 checks)
for (let y = 0; y < 9; y++) {
  for (let bx = 0; bx < 3; bx++) {
    for (let bz = 0; bz < 3; bz++) {
      const vals = [];
      for (let dz = 0; dz < 3; dz++)
        for (let dx = 0; dx < 3; dx++)
          vals.push(TEMPLATE_BOARD[bz*3+dz][y][bx*3+dx]);
      const err = checkGroup(`Y-slice y=${y} box (bx=${bx},bz=${bz})`, vals);
      if (err) errors.push(err);
      checks++;
    }
  }
}

console.log(`\n====== 3D Sudoku Template Verification ======`);
console.log(`Total constraint groups checked: ${checks}`);
console.log(`Errors found: ${errors.length}`);
if (errors.length === 0) {
  console.log(`\n✅ TEMPLATE IS 100% VALID — All ${checks} constraint groups pass!\n`);
} else {
  console.log(`\n❌ TEMPLATE IS INVALID! First 20 errors:\n`);
  errors.slice(0, 20).forEach(e => console.log('  ' + e));
  console.log(`\n... and ${Math.max(0, errors.length - 20)} more errors.`);
}
