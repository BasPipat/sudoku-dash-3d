import type { Difficulty, Sudoku3DBoard, CellState } from '../types';

// Utility to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 100% mathematically valid solved 3D Sudoku board template (729 cells)
// generated using Z3 SAT solver. Satisfies all 27 slices' rows, columns, and boxes.
const TEMPLATE_BOARD: number[][][] = [
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

// Shuffle the template board using isomorphic permutations
function getShuffledSolvedBoard(): number[][][] {
  // 1. Digit Permutation
  const mapping = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let board = TEMPLATE_BOARD.map(layer =>
    layer.map(row =>
      row.map(val => mapping[val - 1])
    )
  );

  const shuffleBands = () => shuffle([0, 1, 2]);
  const shuffleWithinBands = () => {
    const b0 = shuffle([0, 1, 2]);
    const b1 = shuffle([3, 4, 5]);
    const b2 = shuffle([6, 7, 8]);
    return [...b0, ...b1, ...b2];
  };

  // 2. Shuffle Z-layers (bands and layers within bands)
  const zBands = shuffleBands();
  const zIndices = shuffleWithinBands();
  const zMapped: number[] = [];
  for (const b of zBands) {
    for (let i = 0; i < 3; i++) {
      zMapped.push(zIndices[b * 3 + i]);
    }
  }
  const tempZ = zMapped.map(z => board[z]);

  // 3. Shuffle Y-rows (bands and rows within bands)
  const yBands = shuffleBands();
  const yIndices = shuffleWithinBands();
  const yMapped: number[] = [];
  for (const b of yBands) {
    for (let i = 0; i < 3; i++) {
      yMapped.push(yIndices[b * 3 + i]);
    }
  }
  const tempY = tempZ.map(layer =>
    yMapped.map(y => layer[y])
  );

  // 4. Shuffle X-cols (bands and cols within bands)
  const xBands = shuffleBands();
  const xIndices = shuffleWithinBands();
  const xMapped: number[] = [];
  for (const b of xBands) {
    for (let i = 0; i < 3; i++) {
      xMapped.push(xIndices[b * 3 + i]);
    }
  }
  const tempX = tempY.map(layer =>
    layer.map(row =>
      xMapped.map(x => row[x])
    )
  );

  return tempX;
}

// Get valid candidates for cell (z, y, x) in a 9x9x9 grid under all 6 constraints
export function getCandidates(grid: number[][][], z: number, y: number, x: number): number[] {
  let mask = 0;
  
  // 1. Z-layer row uniqueness (varying x)
  for (let col = 0; col < 9; col++) {
    const val = grid[z][y][col];
    if (val > 0) mask |= (1 << val);
  }
  
  // 2. Z-layer col uniqueness (varying y)
  for (let row = 0; row < 9; row++) {
    const val = grid[z][row][x];
    if (val > 0) mask |= (1 << val);
  }
  
  // 3. Depth pillar uniqueness (varying z)
  for (let layer = 0; layer < 9; layer++) {
    const val = grid[layer][y][x];
    if (val > 0) mask |= (1 << val);
  }
  
  // 4. Z-slice 3x3 Box uniqueness (in x,y)
  const startRow = Math.floor(y / 3) * 3;
  const startCol = Math.floor(x / 3) * 3;
  for (let r = 0; r < 3; r++) {
    const rIdx = startRow + r;
    for (let c = 0; c < 3; c++) {
      const val = grid[z][rIdx][startCol + c];
      if (val > 0) mask |= (1 << val);
    }
  }

  // 5. X-slice 3x3 Box uniqueness (in y,z) for constant x
  const startZ_X = Math.floor(z / 3) * 3;
  const startY_X = Math.floor(y / 3) * 3;
  for (let dz = 0; dz < 3; dz++) {
    for (let dy = 0; dy < 3; dy++) {
      const val = grid[startZ_X + dz][startY_X + dy][x];
      if (val > 0) mask |= (1 << val);
    }
  }

  // 6. Y-slice 3x3 Box uniqueness (in x,z) for constant y
  const startZ_Y = Math.floor(z / 3) * 3;
  const startX_Y = Math.floor(x / 3) * 3;
  for (let dz = 0; dz < 3; dz++) {
    for (let dx = 0; dx < 3; dx++) {
      const val = grid[startZ_Y + dz][y][startX_Y + dx];
      if (val > 0) mask |= (1 << val);
    }
  }
  
  const candidates: number[] = [];
  for (let val = 1; val <= 9; val++) {
    if ((mask & (1 << val)) === 0) {
      candidates.push(val);
    }
  }
  return candidates;
}

// Backtracking solver using MRV (Minimum Remaining Values) heuristic
function solve3DBacktrack(
  grid: number[][][],
  emptyCells: { z: number; y: number; x: number }[],
  index: number
): boolean {
  if (index === emptyCells.length) {
    return true;
  }

  let minCandidatesCount = 10;
  let bestIdxInRemaining = -1;
  let bestCandidates: number[] = [];

  for (let i = index; i < emptyCells.length; i++) {
    const { z, y, x } = emptyCells[i];
    const candidates = getCandidates(grid, z, y, x);
    if (candidates.length < minCandidatesCount) {
      minCandidatesCount = candidates.length;
      bestIdxInRemaining = i;
      bestCandidates = candidates;
      if (minCandidatesCount === 0) {
        return false;
      }
    }
  }

  if (bestIdxInRemaining === -1) {
    return false;
  }

  const temp = emptyCells[index];
  emptyCells[index] = emptyCells[bestIdxInRemaining];
  emptyCells[bestIdxInRemaining] = temp;

  const { z, y, x } = emptyCells[index];

  for (const val of bestCandidates) {
    grid[z][y][x] = val;
    if (solve3DBacktrack(grid, emptyCells, index + 1)) {
      return true;
    }
    grid[z][y][x] = 0;
  }

  emptyCells[bestIdxInRemaining] = emptyCells[index];
  emptyCells[index] = temp;

  return false;
}

export function solve3D(grid: number[][][]): boolean {
  const emptyCells: { z: number; y: number; x: number }[] = [];
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (grid[z][y][x] === 0) {
          emptyCells.push({ z, y, x });
        }
      }
    }
  }
  return solve3DBacktrack(grid, emptyCells, 0);
}

// Constraint propagation solver to verify unique solvability without guessing
function solveByPropagation(puzzle: number[][][]): number[][][] | null {
  const grid = puzzle.map(layer => layer.map(row => [...row]));
  
  let progress = true;
  while (progress) {
    progress = false;
    let nakedSingleFound = false;

    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (grid[z][y][x] === 0) {
            const c = getCandidates(grid, z, y, x);
            if (c.length === 0) return null;
            if (c.length === 1) {
              grid[z][y][x] = c[0];
              progress = true;
              nakedSingleFound = true;
            }
          }
        }
      }
    }
    if (nakedSingleFound) continue;
  }

  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (grid[z][y][x] === 0) return null;
      }
    }
  }
  return grid;
}

/**
 * Internal QC check: verifies that all given clues in a puzzle (non-zero cells)
 * do NOT conflict with each other across all 6 constraint types.
 * Throws an Error if any violation is found — this is a hard guard.
 */
function assertPuzzleCluesValid(puzzle: number[][][], solved: number[][][]): void {
  const errors: string[] = [];

  function chkGroup(label: string, vals: number[]): void {
    const filled = vals.filter((v) => v > 0);
    const seen = new Set<number>();
    for (const v of filled) {
      if (seen.has(v)) {
        errors.push(`Duplicate ${v} in ${label}`);
        break;
      }
      seen.add(v);
    }
  }

  // 1. Z-slice rows & cols & boxes
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) chkGroup(`Z${z} row${y}`, puzzle[z][y]);
    for (let x = 0; x < 9; x++) {
      const col: number[] = [];
      for (let y = 0; y < 9; y++) col.push(puzzle[z][y][x]);
      chkGroup(`Z${z} col${x}`, col);
    }
    for (let by = 0; by < 3; by++) {
      for (let bx = 0; bx < 3; bx++) {
        const box: number[] = [];
        for (let dy = 0; dy < 3; dy++)
          for (let dx = 0; dx < 3; dx++)
            box.push(puzzle[z][by * 3 + dy][bx * 3 + dx]);
        chkGroup(`Z${z} box(${by},${bx})`, box);
      }
    }
  }

  // 2. Depth pillars
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const p: number[] = [];
      for (let z = 0; z < 9; z++) p.push(puzzle[z][y][x]);
      chkGroup(`Pillar y${y}x${x}`, p);
    }
  }

  // 3. X-slice 3x3 boxes
  for (let x = 0; x < 9; x++) {
    for (let by = 0; by < 3; by++) {
      for (let bz = 0; bz < 3; bz++) {
        const box: number[] = [];
        for (let dz = 0; dz < 3; dz++)
          for (let dy = 0; dy < 3; dy++)
            box.push(puzzle[bz * 3 + dz][by * 3 + dy][x]);
        chkGroup(`X${x} box(y${by},z${bz})`, box);
      }
    }
  }

  // 4. Y-slice 3x3 boxes
  for (let y = 0; y < 9; y++) {
    for (let bx = 0; bx < 3; bx++) {
      for (let bz = 0; bz < 3; bz++) {
        const box: number[] = [];
        for (let dz = 0; dz < 3; dz++)
          for (let dx = 0; dx < 3; dx++)
            box.push(puzzle[bz * 3 + dz][y][bx * 3 + dx]);
        chkGroup(`Y${y} box(x${bx},z${bz})`, box);
      }
    }
  }

  // 5. Also verify every clue matches the solved board (safety net)
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const clue = puzzle[z][y][x];
        if (clue > 0 && clue !== solved[z][y][x]) {
          errors.push(`Clue mismatch at (z=${z},y=${y},x=${x}): clue=${clue} but solved=${solved[z][y][x]}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('[QC FAILED] Puzzle has constraint violations:', errors.slice(0, 5));
    throw new Error(`[QC FAILED] Generated puzzle is invalid (${errors.length} violations). First: ${errors[0]}`);
  }
}

/**
 * Generates a 9x9x9 multi-layered Sudoku board.
 * Uses isomorphic templates and constraint propagation to guarantee unique, logical solvability.
 * Includes a hard QC check that throws if the output is ever invalid.
 */
export function generatePuzzle(difficulty: Difficulty): Sudoku3DBoard {
  const solved = getShuffledSolvedBoard();
  const puzzle = solved.map(layer => layer.map(row => [...row]));

  let targetClues = 350; // Easy
  if (difficulty === 'medium') targetClues = 280;
  if (difficulty === 'hard') targetClues = 200;

  let coords: { z: number; y: number; x: number }[] = [];
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        coords.push({ z, y, x });
      }
    }
  }
  coords = shuffle(coords);

  let cluesCount = 729;
  for (const { z, y, x } of coords) {
    if (cluesCount <= targetClues) break;

    const originalValue = puzzle[z][y][x];
    puzzle[z][y][x] = 0;

    const result = solveByPropagation(puzzle);
    if (result) {
      cluesCount--;
    } else {
      puzzle[z][y][x] = originalValue;
    }
  }

  // ===== HARD QC GATE: This will throw if puzzle is ever invalid =====
  assertPuzzleCluesValid(puzzle, solved);

  // Construct game board state
  const board: Sudoku3DBoard = [];
  for (let z = 0; z < 9; z++) {
    const layerCells: CellState[][] = [];
    for (let y = 0; y < 9; y++) {
      const rowCells: CellState[] = [];
      for (let x = 0; x < 9; x++) {
        const val = puzzle[z][y][x];
        const isOriginal = val > 0;
        rowCells.push({
          value: val,
          isOriginal,
          isError: false,
          solvedValue: solved[z][y][x],
          notes: [],
        });
      }
      layerCells.push(rowCells);
    }
    board.push(layerCells);
  }

  return board;
}


/**
 * Checks all cells for rule violations (duplicates along Z-slice rows/cols/boxes, Depth, X-slice boxes, Y-slice boxes).
 * Marks isError = true for violating cells.
 */
export function checkSudokuRules(board: Sudoku3DBoard): Sudoku3DBoard {
  const newBoard: Sudoku3DBoard = board.map((layer) =>
    layer.map((row) =>
      row.map((cell) => ({
        ...cell,
        isError: false,
        notes: [...cell.notes],
      }))
    )
  );

  const markError = (z: number, y: number, x: number) => {
    newBoard[z][y][x].isError = true;
  };

  // 1. Z-slice Rows & Columns
  for (let z = 0; z < 9; z++) {
    // Check Row (varying x)
    for (let y = 0; y < 9; y++) {
      const counts: { [val: number]: number[] } = {};
      for (let x = 0; x < 9; x++) {
        const val = newBoard[z][y][x].value;
        if (val > 0) {
          if (!counts[val]) counts[val] = [];
          counts[val].push(x);
        }
      }
      Object.keys(counts).forEach((valStr) => {
        const indices = counts[parseInt(valStr, 10)];
        if (indices.length > 1) {
          indices.forEach((xIdx) => markError(z, y, xIdx));
        }
      });
    }

    // Check Col (varying y)
    for (let x = 0; x < 9; x++) {
      const counts: { [val: number]: number[] } = {};
      for (let y = 0; y < 9; y++) {
        const val = newBoard[z][y][x].value;
        if (val > 0) {
          if (!counts[val]) counts[val] = [];
          counts[val].push(y);
        }
      }
      Object.keys(counts).forEach((valStr) => {
        const indices = counts[parseInt(valStr, 10)];
        if (indices.length > 1) {
          indices.forEach((yIdx) => markError(z, yIdx, x));
        }
      });
    }
  }

  // 2. Depth pillars (varying z)
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const counts: { [val: number]: number[] } = {};
      for (let z = 0; z < 9; z++) {
        const val = newBoard[z][y][x].value;
        if (val > 0) {
          if (!counts[val]) counts[val] = [];
          counts[val].push(z);
        }
      }
      Object.keys(counts).forEach((valStr) => {
        const layers = counts[parseInt(valStr, 10)];
        if (layers.length > 1) {
          layers.forEach((zIdx) => markError(zIdx, y, x));
        }
      });
    }
  }

  // 3. Z-slice 3x3 Boxes
  for (let z = 0; z < 9; z++) {
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let boxX = 0; boxX < 3; boxX++) {
        const startY = boxY * 3;
        const startX = boxX * 3;
        const counts: { [val: number]: { y: number; x: number }[] } = {};

        for (let dy = 0; dy < 3; dy++) {
          for (let dx = 0; dx < 3; dx++) {
            const y = startY + dy;
            const x = startX + dx;
            const val = newBoard[z][y][x].value;
            if (val > 0) {
              if (!counts[val]) counts[val] = [];
              counts[val].push({ y, x });
            }
          }
        }

        Object.keys(counts).forEach((valStr) => {
          const cells = counts[parseInt(valStr, 10)];
          if (cells.length > 1) {
            cells.forEach((c) => markError(z, c.y, c.x));
          }
        });
      }
    }
  }

  // 4. X-slice 3x3 Boxes (varying dy, dz for constant x)
  for (let x = 0; x < 9; x++) {
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let boxZ = 0; boxZ < 3; boxZ++) {
        const startY = boxY * 3;
        const startZ = boxZ * 3;
        const counts: { [val: number]: { z: number; y: number }[] } = {};

        for (let dz = 0; dz < 3; dz++) {
          for (let dy = 0; dy < 3; dy++) {
            const y = startY + dy;
            const z = startZ + dz;
            const val = newBoard[z][y][x].value;
            if (val > 0) {
              if (!counts[val]) counts[val] = [];
              counts[val].push({ z, y });
            }
          }
        }

        Object.keys(counts).forEach((valStr) => {
          const cells = counts[parseInt(valStr, 10)];
          if (cells.length > 1) {
            cells.forEach((c) => markError(c.z, c.y, x));
          }
        });
      }
    }
  }

  // 5. Y-slice 3x3 Boxes (varying dx, dz for constant y)
  for (let y = 0; y < 9; y++) {
    for (let boxX = 0; boxX < 3; boxX++) {
      for (let boxZ = 0; boxZ < 3; boxZ++) {
        const startX = boxX * 3;
        const startZ = boxZ * 3;
        const counts: { [val: number]: { z: number; x: number }[] } = {};

        for (let dz = 0; dz < 3; dz++) {
          for (let dx = 0; dx < 3; dx++) {
            const x = startX + dx;
            const z = startZ + dz;
            const val = newBoard[z][y][x].value;
            if (val > 0) {
              if (!counts[val]) counts[val] = [];
              counts[val].push({ z, x });
            }
          }
        }

        Object.keys(counts).forEach((valStr) => {
          const cells = counts[parseInt(valStr, 10)];
          if (cells.length > 1) {
            cells.forEach((c) => markError(c.z, y, c.x));
          }
        });
      }
    }
  }

  return newBoard;
}

/**
 * Checks if the board has been solved.
 */
export function checkWinCondition(board: Sudoku3DBoard): boolean {
  for (let z = 0; z < 9; z++) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = board[z][y][x];
        if (cell.value === 0 || cell.isError) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Identifies all cells that belong to completed, error-free lines or 3D sub-boxes.
 */
export function getGlowingCells(board: Sudoku3DBoard): Set<string> {
  const glowing = new Set<string>();
  const validatedBoard = checkSudokuRules(board);

  const checkGroup = (coords: { x: number; y: number; z: number }[]) => {
    const hasZero = coords.some((c) => validatedBoard[c.z][c.y][c.x].value === 0);
    const hasError = coords.some((c) => validatedBoard[c.z][c.y][c.x].isError);
    if (!hasZero && !hasError) {
      coords.forEach((c) => glowing.add(`${c.x}-${c.y}-${c.z}`));
    }
  };

  // 1. Z-slice rows, columns, and 3x3 boxes
  for (let z = 0; z < 9; z++) {
    // Rows
    for (let y = 0; y < 9; y++) {
      const coords = [];
      for (let x = 0; x < 9; x++) coords.push({ x, y, z });
      checkGroup(coords);
    }
    // Columns
    for (let x = 0; x < 9; x++) {
      const coords = [];
      for (let y = 0; y < 9; y++) coords.push({ x, y, z });
      checkGroup(coords);
    }
    // Boxes
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let boxX = 0; boxX < 3; boxX++) {
        const coords = [];
        for (let dy = 0; dy < 3; dy++) {
          for (let dx = 0; dx < 3; dx++) {
            coords.push({ x: boxX * 3 + dx, y: boxY * 3 + dy, z });
          }
        }
        checkGroup(coords);
      }
    }
  }

  // 2. Depth pillars (Z-axis)
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const coords = [];
      for (let z = 0; z < 9; z++) coords.push({ x, y, z });
      checkGroup(coords);
    }
  }

  // 3. X-slice 3x3 boxes (constant x, varying dy, dz)
  for (let x = 0; x < 9; x++) {
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let boxZ = 0; boxZ < 3; boxZ++) {
        const coords = [];
        for (let dz = 0; dz < 3; dz++) {
          for (let dy = 0; dy < 3; dy++) {
            coords.push({ x, y: boxY * 3 + dy, z: boxZ * 3 + dz });
          }
        }
        checkGroup(coords);
      }
    }
  }

  // 4. Y-slice 3x3 boxes (constant y, varying dx, dz)
  for (let y = 0; y < 9; y++) {
    for (let boxX = 0; boxX < 3; boxX++) {
      for (let boxZ = 0; boxZ < 3; boxZ++) {
        const coords = [];
        for (let dz = 0; dz < 3; dz++) {
          for (let dx = 0; dx < 3; dx++) {
            coords.push({ x: boxX * 3 + dx, y, z: boxZ * 3 + dz });
          }
        }
        checkGroup(coords);
      }
    }
  }

  return glowing;
}
