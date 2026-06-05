// stress_test.js — Tests puzzle generation 50 times to catch any invalid puzzles
// Run with: node stress_test.js

// ===== COPY of TEMPLATE_BOARD =====
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// === EXACT COPY of getShuffledSolvedBoard from sudoku.ts ===
function getShuffledSolvedBoard() {
  const mapping = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let board = TEMPLATE_BOARD.map(layer =>
    layer.map(row => row.map(val => mapping[val - 1]))
  );

  const shuffleBands = () => shuffle([0, 1, 2]);
  const shuffleWithinBands = () => {
    const b0 = shuffle([0, 1, 2]);
    const b1 = shuffle([3, 4, 5]);
    const b2 = shuffle([6, 7, 8]);
    return [...b0, ...b1, ...b2];
  };

  const zBands = shuffleBands();
  const zIndices = shuffleWithinBands();
  const zMapped = [];
  for (const b of zBands) {
    for (let i = 0; i < 3; i++) {
      zMapped.push(zIndices[b * 3 + i]);
    }
  }
  const tempZ = zMapped.map(z => board[z]);

  const yBands = shuffleBands();
  const yIndices = shuffleWithinBands();
  const yMapped = [];
  for (const b of yBands) {
    for (let i = 0; i < 3; i++) {
      yMapped.push(yIndices[b * 3 + i]);
    }
  }
  const tempY = tempZ.map(layer => yMapped.map(y => layer[y]));

  const xBands = shuffleBands();
  const xIndices = shuffleWithinBands();
  const xMapped = [];
  for (const b of xBands) {
    for (let i = 0; i < 3; i++) {
      xMapped.push(xIndices[b * 3 + i]);
    }
  }
  const tempX = tempY.map(layer =>
    layer.map(row => xMapped.map(x => row[x]))
  );

  return tempX;
}

// === Verify all 6 constraints on a complete board ===
function verifyBoard(board) {
  const errors = [];

  function chk(label, vals) {
    const s = new Set(vals);
    if (s.size !== 9) errors.push(label + ': ' + vals.join(','));
  }

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) chk(`Z${z} row${y}`, board[z][y]);
    for (let x = 0; x < 9; x++) {
      const col = []; for (let y = 0; y < 9; y++) col.push(board[z][y][x]);
      chk(`Z${z} col${x}`, col);
    }
    for (let by = 0; by < 3; by++) for (let bx = 0; bx < 3; bx++) {
      const box = [];
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++)
        box.push(board[z][by*3+dy][bx*3+dx]);
      chk(`Z${z} box(${by},${bx})`, box);
    }
  }

  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const p = []; for (let z = 0; z < 9; z++) p.push(board[z][y][x]);
    chk(`Pillar y${y}x${x}`, p);
  }

  for (let x = 0; x < 9; x++) for (let by = 0; by < 3; by++) for (let bz = 0; bz < 3; bz++) {
    const box = [];
    for (let dy = 0; dy < 3; dy++) for (let dz = 0; dz < 3; dz++)
      box.push(board[bz*3+dz][by*3+dy][x]);
    chk(`X${x} box(y${by},z${bz})`, box);
  }

  for (let y = 0; y < 9; y++) for (let bx = 0; bx < 3; bx++) for (let bz = 0; bz < 3; bz++) {
    const box = [];
    for (let dz = 0; dz < 3; dz++) for (let dx = 0; dx < 3; dx++)
      box.push(board[bz*3+dz][y][bx*3+dx]);
    chk(`Y${y} box(x${bx},z${bz})`, box);
  }

  return errors;
}

// === Run 100 shuffle tests ===
console.log('Running 100 shuffle stress tests...\n');
let totalFails = 0;
for (let i = 0; i < 100; i++) {
  const board = getShuffledSolvedBoard();
  const errs = verifyBoard(board);
  if (errs.length > 0) {
    console.log(`Test ${i+1}: ❌ FAIL (${errs.length} errors)`);
    errs.slice(0, 5).forEach(e => console.log('  ' + e));
    totalFails++;
  }
}

if (totalFails === 0) {
  console.log('✅ ALL 100 SHUFFLED BOARDS ARE VALID — Shuffle logic is correct!\n');
} else {
  console.log(`\n❌ ${totalFails}/100 shuffled boards are INVALID — Shuffle logic is broken!\n`);
}
