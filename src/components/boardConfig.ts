export const BOARD_CELL_SIZE = 0.78;
export const BOARD_CELL_DEPTH = 0.78;
export const BOARD_CELL_GAP = 0.045;
export const BOARD_BLOCK_GAP = 0.22;
export const BOARD_CELL_STEP = BOARD_CELL_SIZE + BOARD_CELL_GAP;
export const BOARD_SIZE =
  8 * BOARD_CELL_STEP + 2 * BOARD_BLOCK_GAP + BOARD_CELL_SIZE;
export const BOARD_HALF_SIZE = BOARD_SIZE / 2;

export function getBoardCoord(index: number, invert = false): number {
  const visualIndex = invert ? 8 - index : index;
  return (
    (visualIndex - 4) * BOARD_CELL_STEP +
    (Math.floor(visualIndex / 3) - 1) * BOARD_BLOCK_GAP
  );
}
