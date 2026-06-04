import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { Cell } from './Cell';
import type { FocusAxis, SelectedCell, Sudoku3DBoard } from '../types';
import { BOARD_HALF_SIZE, getBoardCoord } from './boardConfig';

interface LayeredBoardProps {
  board: Sudoku3DBoard;
  selectedCell: SelectedCell | null;
  activeLayer: number | 'all';
  focusAxis: FocusAxis;
  onSelectCell: (x: number, y: number, z: number) => void;
  hoveredSlice: { axis: FocusAxis; index: number } | null;
  onHoverSlice: (axis: FocusAxis | null, index: number | null) => void;
  glowingCells: Set<string>;
}

export const LayeredBoard: React.FC<LayeredBoardProps> = ({
  board,
  selectedCell,
  activeLayer,
  focusAxis,
  onSelectCell,
  hoveredSlice,
  onHoverSlice,
  glowingCells,
}) => {
  // Generate 729 cells in a perfect 9x9x9 cube structure
  const gridCells = useMemo(() => {
    const cellsList = [];
    for (let z = 0; z < 9; z++) {
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const posX = getBoardCoord(x);
          const posY = getBoardCoord(y, true); // Invert Y so index 0 is at top
          const posZ = getBoardCoord(z, true); // Invert Z so index 0 is at front

          cellsList.push({
            x,
            y,
            z,
            pos: [posX, posY, posZ] as [number, number, number],
          });
        }
      }
    }
    return cellsList;
  }, []);

  // Compute position for the floating 3D label of the hovered slice
  const hoverLabelProps = useMemo(() => {
    if (!hoveredSlice) return null;

    const { axis, index } = hoveredSlice;
    const label = `${axis}${index + 1}`;
    
    let labelPos: [number, number, number] = [0, 0, 0];
    let anchorX: 'center' | 'left' | 'right' = 'center';
    let anchorY: 'middle' | 'top' | 'bottom' = 'middle';

    if (axis === 'X') {
      // X slice -> vertical slab at X coordinate
      const posX = getBoardCoord(index);
      // Float above the front-top edge of the slab
      labelPos = [posX, BOARD_HALF_SIZE + 0.4, BOARD_HALF_SIZE + 0.3];
      anchorY = 'bottom';
    } else if (axis === 'Y') {
      // Y slice -> horizontal slab at Y coordinate
      const posY = getBoardCoord(index, true);
      // Float to the left-front edge of the slab
      labelPos = [-BOARD_HALF_SIZE - 0.4, posY, BOARD_HALF_SIZE + 0.3];
      anchorX = 'right';
    } else if (axis === 'Z') {
      // Z slice -> depth slab at Z coordinate
      const posZ = getBoardCoord(index, true);
      // Float to the right of the slab, centered vertically
      labelPos = [BOARD_HALF_SIZE + 0.4, 0, posZ];
      anchorX = 'left';
    }

    return { label, labelPos, anchorX, anchorY };
  }, [hoveredSlice]);

  return (
    <group>
      {gridCells.map(({ x, y, z, pos }) => {
        const cellState = board[z][y][x];
        const isSelected =
          selectedCell !== null &&
          selectedCell.x === x &&
          selectedCell.y === y &&
          selectedCell.z === z;

        return (
          <Cell
            key={`${z}-${y}-${x}`}
            x={x}
            y={y}
            z={z}
            position={pos}
            value={cellState.value}
            isOriginal={cellState.isOriginal}
            isError={cellState.isError}
            isSelected={isSelected}
            isGlowing={glowingCells.has(`${x}-${y}-${z}`)}
            activeLayer={activeLayer}
            focusAxis={focusAxis}
            hoveredSlice={hoveredSlice}
            onHoverSlice={onHoverSlice}
            notes={cellState.notes || []}
            onClick={() => onSelectCell(x, y, z)}
          />
        );
      })}

      {/* Floating 3D label for hovered slice */}
      {hoverLabelProps && (
        <Text
          position={hoverLabelProps.labelPos}
          fontSize={0.48}
          color="#f97316"
          anchorX={hoverLabelProps.anchorX}
          anchorY={hoverLabelProps.anchorY}
          renderOrder={100}
          outlineColor="#ffedd5"
          outlineWidth={0.01}
          outlineOpacity={0.7}
        >
          {hoverLabelProps.label}
        </Text>
      )}
    </group>
  );
};
