export interface CellState {
  value: number; // 0 represents empty, 1-9 for filled
  isOriginal: boolean; // pre-filled/clue cell
  isError: boolean; // highlights red when duplicate is found
  solvedValue: number; // reference solution for checking completion
  notes: number[]; // pencil marks/candidates (1-9)
}

export type Sudoku3DBoard = CellState[][][]; // [z][y][x]

export interface SelectedCell {
  x: number; // 0-8
  y: number; // 0-8
  z: number; // 0-8
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type FocusAxis = 'X' | 'Y' | 'Z';
