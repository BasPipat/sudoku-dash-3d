import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LayeredBoard } from './LayeredBoard';
import type { FocusAxis, SelectedCell, Sudoku3DBoard } from '../types';

interface GameCanvasProps {
  board: Sudoku3DBoard;
  selectedCell: SelectedCell | null;
  activeLayer: number | 'all';
  focusAxis: FocusAxis;
  onSelectCell: (x: number, y: number, z: number) => void;
  hoveredSlice: { axis: FocusAxis; index: number } | null;
  onHoverSlice: (axis: FocusAxis | null, index: number | null) => void;
  glowingCells: Set<string>;
  theme: 'dark' | 'light';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  board,
  selectedCell,
  activeLayer,
  focusAxis,
  onSelectCell,
  hoveredSlice,
  onHoverSlice,
  glowingCells,
  theme,
}) => {
  const planeLabel = {
    Z: 'X / Y plane (Z slices)',
    Y: 'X / Z plane (Y slices)',
    X: 'Z / Y plane (X slices)',
  }[focusAxis];
  const layerLabel =
    activeLayer === 'all' ? 'All layers' : `${focusAxis}${activeLayer + 1}`;

  return (
    <div
      className="canvas-container"
      onMouseLeave={() => onHoverSlice(null, null)}
    >
      <div className="scene-hud" aria-hidden="true">
        <span>{planeLabel}</span>
        <strong>{layerLabel}</strong>
      </div>
      <Canvas
        camera={{ position: [9, 10, 15], fov: 38, near: 0.1, far: 80 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => onHoverSlice(null, null)}
      >
        <color attach="background" args={[theme === 'light' ? '#f1f5f9' : '#07090d']} />
        <fog attach="fog" args={[theme === 'light' ? '#f1f5f9' : '#07090d', 18, 36]} />
        <ambientLight intensity={theme === 'light' ? 1.15 : 0.75} />
        <directionalLight position={[8, 12, 10]} intensity={theme === 'light' ? 1.45 : 1.3} />
        <pointLight position={[-8, -6, 8]} intensity={theme === 'light' ? 0.9 : 0.8} color="#22d3ee" />
        <pointLight position={[8, 6, 6]} intensity={theme === 'light' ? 0.5 : 0.4} color="#f8c14a" />

        <LayeredBoard
          board={board}
          selectedCell={selectedCell}
          activeLayer={activeLayer}
          focusAxis={focusAxis}
          onSelectCell={onSelectCell}
          hoveredSlice={hoveredSlice}
          onHoverSlice={onHoverSlice}
          glowingCells={glowingCells}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.07}
          enablePan={false}
          makeDefault
          maxDistance={30}
          minDistance={8}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};
