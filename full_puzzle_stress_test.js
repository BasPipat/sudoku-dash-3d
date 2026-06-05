// full_puzzle_stress_test.js — Tests entire puzzle generation pipeline: 
// verifies that every given clue does NOT create a duplicate in any of the 6 constraint groups.
// Run with: node full_puzzle_stress_test.js

const TEMPLATE_BOARD = [
  [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]],
  [[8,6,4,9,7,2,5,3,1],[2,9,7,3,1,5,8,6,4],[5,3,1,6,4,8,2,9,7],[6,7,8,1,2,9,3,4,5],[9,1,2,4,5,3,6,7,8],[3,4,5,7,8,6,9,1,2],[1,2,9,5,3,4,7,8,6],[4,5,3,8,6,7,1,2,9],[7,8,6,2,9,1,4,5,3]],
  [[9,7,5,8,3,1,6,4,2],[3,1,8,2,6,4,9,7,5],[6,4,2,5,9,7,3,1,8],[1,5,9,3,4,8,7,2,6],[4,8,3,6,7,2,1,5,9],[7,2,6,9,1,5,4,8,3],[8,6,7,1,2,9,5,3,4],[2,9,1,4,5,3,8,6,7],[5,3,4,7,8,6,2,9,1]],
  [[2,4,6,5,1,9,3,7,8],[5,7,9,8,4,3,6,1,2],[8,1,3,2,7,6,9,4,5],[4,6,2,7,9,5,1,8,3],[7,9,5,1,3,8,4,2,6],[1,3,8,4,6,2,7,5,9],[9,8,4,3,5,7,2,6,1],[3,2,7,6,8,1,5,9,4],[6,5,1,9,2,4,8,3,7]],
  [[3,5,1,7,6,8,2,9,4],[6,8,4,1,9,2,5,3,7],[9,2,7,4,3,5,8,6,1],[5,1,3,6,8,4,9,7,2],[8,4,6,9,2,7,3,1,5],[2,7,9,3,5,1,6,4,8],[7,3,2,8,1,6,4,5,9],[1,6,5,2,4,9,7,8,3],[4,9,8,5,7,3,1,2,6]],
  [[7,9,8,3,2,4,1,5,6],[1,3,2,6,5,7,4,8,9],[4,6,5,9,8,1,7,2,3],[9,8,7,2,1,3,5,6,4],[3,2,1,5,4,6,8,9,7],[6,5,4,8,7,9,2,3,1],[5,1,6,4,9,2,3,7,8],[8,4,9,7,3,5,6,1,2],[2,7,3,1,6,8,9,4,5]],
  [[4,3,2,1,9,5,8,6,7],[7,6,5,4,3,8,2,9,1],[1,9,8,7,6,2,5,3,4],[3,2,1,8,7,6,4,5,9],[6,5,4,2,1,9,7,8,3],[9,8,7,5,4,3,1,2,6],[2,7,3,9,8,1,6,4,5],[5,1,6,3,2,4,9,7,8],[8,4,9,6,5,7,3,1,2]],
  [[6,8,7,2,4,3,9,1,5],[9,2,1,5,7,6,3,4,8],[3,5,4,8,1,9,6,7,2],[8,4,6,9,5,1,2,3,7],[2,7,9,3,8,4,5,6,1],[5,1,3,6,2,7,8,9,4],[4,9,8,7,6,5,1,2,3],[7,3,2,1,9,8,4,5,6],[1,6,5,4,3,2,7,8,9]],
  [[5,1,9,6,8,7,4,2,3],[8,4,3,9,2,1,7,5,6],[2,7,6,3,5,4,1,8,9],[7,9,5,4,3,2,6,1,8],[1,3,8,7,6,5,9,4,2],[4,6,2,1,9,8,3,7,5],[6,5,1,2,4,3,8,9,7],[9,8,4,5,7,6,2,3,1],[3,2,7,8,1,9,5,6,4]]
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getShuffledSolvedBoard() {
  const mapping = shuffle([1,2,3,4,5,6,7,8,9]);
  let board = TEMPLATE_BOARD.map(layer => layer.map(row => row.map(val => mapping[val-1])));

  const shuffleBands = () => shuffle([0,1,2]);
  const shuffleWithinBands = () => {
    const b0 = shuffle([0,1,2]), b1 = shuffle([3,4,5]), b2 = shuffle([6,7,8]);
    return [...b0,...b1,...b2];
  };

  const zBands = shuffleBands(), zIndices = shuffleWithinBands();
  const zMapped = [];
  for (const b of zBands) for (let i = 0; i < 3; i++) zMapped.push(zIndices[b*3+i]);
  const tempZ = zMapped.map(z => board[z]);

  const yBands = shuffleBands(), yIndices = shuffleWithinBands();
  const yMapped = [];
  for (const b of yBands) for (let i = 0; i < 3; i++) yMapped.push(yIndices[b*3+i]);
  const tempY = tempZ.map(layer => yMapped.map(y => layer[y]));

  const xBands = shuffleBands(), xIndices = shuffleWithinBands();
  const xMapped = [];
  for (const b of xBands) for (let i = 0; i < 3; i++) xMapped.push(xIndices[b*3+i]);
  return tempY.map(layer => layer.map(row => xMapped.map(x => row[x])));
}

function getCandidates(grid, z, y, x) {
  let mask = 0;
  for (let col = 0; col < 9; col++) if (grid[z][y][col]) mask |= (1 << grid[z][y][col]);
  for (let row = 0; row < 9; row++) if (grid[z][row][x]) mask |= (1 << grid[z][row][x]);
  for (let layer = 0; layer < 9; layer++) if (grid[layer][y][x]) mask |= (1 << grid[layer][y][x]);
  const sR = Math.floor(y/3)*3, sC = Math.floor(x/3)*3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (grid[z][sR+r][sC+c]) mask |= (1 << grid[z][sR+r][sC+c]);
  const sZX = Math.floor(z/3)*3, sYX = Math.floor(y/3)*3;
  for (let dz = 0; dz < 3; dz++) for (let dy = 0; dy < 3; dy++) if (grid[sZX+dz][sYX+dy][x]) mask |= (1 << grid[sZX+dz][sYX+dy][x]);
  const sZY = Math.floor(z/3)*3, sXY = Math.floor(x/3)*3;
  for (let dz = 0; dz < 3; dz++) for (let dx = 0; dx < 3; dx++) if (grid[sZY+dz][y][sXY+dx]) mask |= (1 << grid[sZY+dz][y][sXY+dx]);
  const cands = [];
  for (let v = 1; v <= 9; v++) if (!(mask & (1<<v))) cands.push(v);
  return cands;
}

// Strict uniqueness check using full backtracking (count solutions, stop at 2)
function countSolutions(grid, maxCount = 2) {
  let count = 0;
  function bt(cells, idx) {
    if (count >= maxCount) return;
    if (idx === cells.length) { count++; return; }
    // MRV: find cell with fewest candidates
    let minLen = 10, bestIdx = idx, bestCands = [];
    for (let i = idx; i < cells.length; i++) {
      const {z,y,x} = cells[i];
      const c = getCandidates(grid, z, y, x);
      if (c.length < minLen) {
        minLen = c.length; bestIdx = i; bestCands = c;
        if (minLen === 0) return; // dead end
      }
    }
    [cells[idx], cells[bestIdx]] = [cells[bestIdx], cells[idx]];
    const {z,y,x} = cells[idx];
    for (const v of bestCands) {
      grid[z][y][x] = v;
      bt(cells, idx+1);
      if (count >= maxCount) { grid[z][y][x] = 0; break; }
      grid[z][y][x] = 0;
    }
    [cells[idx], cells[bestIdx]] = [cells[bestIdx], cells[idx]];
  }
  const empties = [];
  for (let z = 0; z < 9; z++) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++)
    if (!grid[z][y][x]) empties.push({z,y,x});
  bt(empties, 0);
  return count;
}

// Simplified: also check that given clues themselves don't conflict
function checkCluesConflict(puzzle) {
  const errors = [];
  function chkGroup(label, vals) {
    const filled = vals.filter(v => v > 0);
    const s = new Set(filled);
    if (s.size !== filled.length) errors.push(`DUPLICATE in ${label}: [${vals.join(',')}]`);
  }

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) chkGroup(`Z${z} row y${y}`, puzzle[z][y]);
    for (let x = 0; x < 9; x++) {
      const col = []; for (let y = 0; y < 9; y++) col.push(puzzle[z][y][x]);
      chkGroup(`Z${z} col x${x}`, col);
    }
    for (let by = 0; by < 3; by++) for (let bx = 0; bx < 3; bx++) {
      const box = [];
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++)
        box.push(puzzle[z][by*3+dy][bx*3+dx]);
      chkGroup(`Z${z} box(${by},${bx})`, box);
    }
  }
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const p = []; for (let z = 0; z < 9; z++) p.push(puzzle[z][y][x]);
    chkGroup(`Pillar y${y}x${x}`, p);
  }
  for (let x = 0; x < 9; x++) for (let by = 0; by < 3; by++) for (let bz = 0; bz < 3; bz++) {
    const box = [];
    for (let dy = 0; dy < 3; dy++) for (let dz = 0; dz < 3; dz++)
      box.push(puzzle[bz*3+dz][by*3+dy][x]);
    chkGroup(`X${x} box(y${by},z${bz})`, box);
  }
  for (let y = 0; y < 9; y++) for (let bx = 0; bx < 3; bx++) for (let bz = 0; bz < 3; bz++) {
    const box = [];
    for (let dz = 0; dz < 3; dz++) for (let dx = 0; dx < 3; dx++)
      box.push(puzzle[bz*3+dz][y][bx*3+dx]);
    chkGroup(`Y${y} box(x${bx},z${bz})`, box);
  }
  return errors;
}

function solveByPropagation(puzzle) {
  const grid = puzzle.map(l => l.map(r => [...r]));
  let progress = true;
  while (progress) {
    progress = false;
    for (let z = 0; z < 9; z++) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (!grid[z][y][x]) {
        const c = getCandidates(grid, z, y, x);
        if (c.length === 0) return null;
        if (c.length === 1) { grid[z][y][x] = c[0]; progress = true; }
      }
    }
  }
  for (let z = 0; z < 9; z++) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++)
    if (!grid[z][y][x]) return null;
  return grid;
}

function generatePuzzle(targetClues = 350) {
  const solved = getShuffledSolvedBoard();
  const puzzle = solved.map(l => l.map(r => [...r]));
  let coords = [];
  for (let z = 0; z < 9; z++) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++)
    coords.push({z,y,x});
  coords = shuffle(coords);

  let cluesCount = 729;
  for (const {z,y,x} of coords) {
    if (cluesCount <= targetClues) break;
    const orig = puzzle[z][y][x];
    puzzle[z][y][x] = 0;
    if (solveByPropagation(puzzle)) cluesCount--;
    else puzzle[z][y][x] = orig;
  }
  return { puzzle, solved, cluesCount };
}

// === Main stress test ===
console.log('=== Full Puzzle Generation Stress Test ===');
console.log('Generating 20 puzzles and checking for:');
console.log('  1. Conflicting given clues (duplicates in groups)');
console.log('  2. Unique solution (exactly 1 solution)\n');

let totalFails = 0;
const N = 20;
for (let i = 0; i < N; i++) {
  const { puzzle, cluesCount } = generatePuzzle(350);

  // Step 1: Check given clues for conflicts
  const clueErrors = checkCluesConflict(puzzle);
  if (clueErrors.length > 0) {
    console.log(`Test ${i+1}: ❌ CLUE CONFLICT (${clueErrors.length} violations, ${cluesCount} clues)`);
    clueErrors.slice(0, 3).forEach(e => console.log('  ' + e));
    totalFails++;
    continue;
  }

  // Step 2: Count solutions (should be exactly 1)
  const gridCopy = puzzle.map(l => l.map(r => [...r]));
  const solCount = countSolutions(gridCopy, 2);
  if (solCount !== 1) {
    console.log(`Test ${i+1}: ❌ SOLUTION COUNT = ${solCount} (${cluesCount} clues) — not unique!`);
    totalFails++;
  } else {
    process.stdout.write(`Test ${i+1}: ✅ OK (${cluesCount} clues, unique)  \r`);
  }
}

console.log('\n');
if (totalFails === 0) {
  console.log(`✅ ALL ${N} PUZZLES PASSED — No conflicts, all have unique solutions!\n`);
} else {
  console.log(`❌ ${totalFails}/${N} PUZZLES FAILED!\n`);
}
