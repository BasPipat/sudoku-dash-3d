import React from 'react';
import type { FocusAxis, SelectedCell, Sudoku3DBoard, CellState } from '../types';

interface Board2DProps {
  board: Sudoku3DBoard;
  selectedCell: SelectedCell | null;
  activeLayer: number | 'all';
  focusAxis: FocusAxis;
  onSelectCell: (x: number, y: number, z: number) => void;
  glowingCells: Set<string>;
  isAssistMode: boolean;
}

export const Board2D: React.FC<Board2DProps> = ({
  board,
  selectedCell,
  activeLayer,
  focusAxis,
  onSelectCell,
  glowingCells,
  isAssistMode,
}) => {
  // Helper to map 2D cell click/coords to 3D cell coords
  const map2DTo3D = (row: number, col: number): { x: number; y: number; z: number } => {
    const layerIdx = activeLayer === 'all' ? 0 : activeLayer;
    if (focusAxis === 'X') {
      return { x: layerIdx, y: row, z: col };
    } else if (focusAxis === 'Y') {
      return { x: col, y: layerIdx, z: row };
    } else {
      return { x: col, y: row, z: layerIdx };
    }
  };

  const getCellState = (row: number, col: number): CellState => {
    const { x, y, z } = map2DTo3D(row, col);
    return board[z][y][x];
  };

  const getSelected2DCoords = (): { row: number; col: number } | null => {
    if (!selectedCell) return null;
    if (focusAxis === 'X') {
      return { row: selectedCell.y, col: selectedCell.z };
    } else if (focusAxis === 'Y') {
      return { row: selectedCell.z, col: selectedCell.x };
    } else {
      return { row: selectedCell.y, col: selectedCell.x };
    }
  };

  const isSelectedInActiveLayer = selectedCell && (
    activeLayer !== 'all' && (
      (focusAxis === 'X' && selectedCell.x === activeLayer) ||
      (focusAxis === 'Y' && selectedCell.y === activeLayer) ||
      (focusAxis === 'Z' && selectedCell.z === activeLayer)
    )
  );

  const selected2DCoords = getSelected2DCoords();
  const selectedValue = isSelectedInActiveLayer && selectedCell
    ? board[selectedCell.z][selectedCell.y][selectedCell.x].value
    : 0;

  const isCellSelected = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const { x, y, z } = map2DTo3D(row, col);
    return selectedCell.x === x && selectedCell.y === y && selectedCell.z === z;
  };

  const handleCellClick = (row: number, col: number) => {
    const { x, y, z } = map2DTo3D(row, col);
    onSelectCell(x, y, z);
  };

  const renderNotes = (notes: number[]) => {
    if (!notes || notes.length === 0) return null;
    return (
      <div className="notes-grid-2d">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className={`note-num-2d ${notes.includes(n) ? 'visible' : ''}`}>
            {n}
          </span>
        ))}
      </div>
    );
  };

  // Label for active layer
  const activeLabel = activeLayer === 'all' ? 'All' : `${focusAxis}${activeLayer + 1}`;

  return (
    <div className="board-2d-pane glass-panel">
      {/* Selected Slice Header */}
      <div className="board-2d-header">
        <h2>Slice View: <span className="active-slice-name">{activeLabel}</span></h2>
        {activeLayer === 'all' && (
          <p className="fallback-message">Select a specific slice to play or edit cells.</p>
        )}
      </div>

      {activeLayer !== 'all' && (
        <div className="board-2d-grid">
          {Array.from({ length: 9 }).map((_, rowIdx) => (
            <div key={rowIdx} className="board-2d-row">
              {Array.from({ length: 9 }).map((_, colIdx) => {
                const cell = getCellState(rowIdx, colIdx);
                const isSelected = isCellSelected(rowIdx, colIdx);
                const hasValue = cell.value > 0;
                
                // Border styles for 3x3 blocks
                const borderClasses = [
                  colIdx === 2 || colIdx === 5 ? 'border-right-thick' : '',
                  rowIdx === 2 || rowIdx === 5 ? 'border-bottom-thick' : '',
                ].join(' ');

                const { x, y, z } = map2DTo3D(rowIdx, colIdx);
                const isGlowing = glowingCells.has(`${x}-${y}-${z}`);

                // Assist Mode class names
                const isCrosshair = isAssistMode && isSelectedInActiveLayer && selected2DCoords && !isSelected &&
                  (rowIdx === selected2DCoords.row || colIdx === selected2DCoords.col);
                const isSameValue = isAssistMode && isSelectedInActiveLayer && selectedValue > 0 && cell.value === selectedValue && !isSelected;

                const assistClasses = [
                  isCrosshair ? 'crosshair' : '',
                  isSameValue ? 'same-value' : '',
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={colIdx}
                    className={`cell-2d ${isSelected ? 'selected' : ''} ${cell.isOriginal ? 'original' : ''} ${cell.isError ? 'error' : ''} ${isGlowing ? 'glowing' : ''} ${assistClasses} ${borderClasses}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                  >
                    {hasValue ? (
                      <span className="cell-value-2d">{cell.value}</span>
                    ) : (
                      renderNotes(cell.notes)
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
