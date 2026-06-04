import React from 'react';
import type { Difficulty, FocusAxis, SelectedCell } from '../types';

interface SidebarProps {
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  timer: number;
  moves: number;
  selectedCell: SelectedCell | null;
  activeLayer: number | 'all';
  setActiveLayer: (layer: number | 'all') => void;
  focusAxis: FocusAxis;
  setFocusAxis: (axis: FocusAxis) => void;
  isNotesMode: boolean;
  setIsNotesMode: (mode: boolean) => void;
  onNumberInput: (num: number) => void;
  onNewGame: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  mistakes: number;
  onBackToMenu: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const PLANE_LABELS: Record<FocusAxis, string> = {
  Z: 'X / Y',
  Y: 'X / Z',
  X: 'Z / Y',
};

export const Sidebar: React.FC<SidebarProps> = ({
  difficulty,
  setDifficulty,
  timer,
  moves,
  selectedCell,
  activeLayer,
  setActiveLayer,
  focusAxis,
  setFocusAxis,
  isNotesMode,
  setIsNotesMode,
  onNumberInput,
  onNewGame,
  theme,
  setTheme,
  mistakes,
  onBackToMenu,
}) => {
  const selectedCellText = selectedCell ? (
    <div className="selected-cell-readout">
      <span className="selected-cell-title">Cell Selected</span>
      <span>
        X{selectedCell.x + 1} / Y{selectedCell.y + 1} / Z{selectedCell.z + 1}
      </span>
      <span>View {PLANE_LABELS[focusAxis]}</span>
    </div>
  ) : (
    <span style={{ color: 'var(--text-muted)' }}>Click a cell on the board</span>
  );
  const activeLayerTitle =
    activeLayer === 'all'
      ? `${focusAxis} Layers: All`
      : `${focusAxis} Layer: ${activeLayer + 1}`;

  return (
    <aside className="sidebar glass-panel">
      <div className="brand-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="game-title">SUDOKU DASH 3D</h1>
          <div className="game-subtitle">9x9x9 Multi-Layer Sudoku</div>
        </div>
        <button
          className="icon-btn theme-toggle-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Difficulty</div>
        <div className="controls-grid">
          <button
            className={`btn ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </button>
          <button
            className={`btn ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </button>
          <button
            className={`btn ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            Hard
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="hud-grid">
          <div className="hud-item">
            <span className="hud-label">Time</span>
            <span className="hud-value glow-cyan">{formatTime(timer)}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Moves</span>
            <span className="hud-value">{moves}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Mistakes</span>
            <span className="hud-value" style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '24px', fontSize: '16px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ opacity: i < 3 - mistakes ? 1 : 0.25, filter: i < 3 - mistakes ? 'none' : 'grayscale(100%)', transition: 'all 0.3s ease' }}>❤️</span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Focus Axis</div>
        <div className="controls-grid">
          <button
            className={`btn ${focusAxis === 'Z' ? 'active' : ''}`}
            onClick={() => setFocusAxis('Z')}
          >
            Z Plane
          </button>
          <button
            className={`btn ${focusAxis === 'Y' ? 'active' : ''}`}
            onClick={() => setFocusAxis('Y')}
          >
            Y Plane
          </button>
          <button
            className={`btn ${focusAxis === 'X' ? 'active' : ''}`}
            onClick={() => setFocusAxis('X')}
          >
            X Plane
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">{activeLayerTitle}</div>
        <div className="layer-grid">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((layerIdx) => (
            <button
              key={layerIdx}
              className={`btn layer-btn ${activeLayer === layerIdx ? 'active' : ''}`}
              onClick={() => setActiveLayer(layerIdx)}
            >
              {focusAxis}{layerIdx + 1}
            </button>
          ))}
          <button
            className={`btn layer-btn ${activeLayer === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLayer('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Selected Cell</div>
        <div className="hud-item selected-cell-card">{selectedCellText}</div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Input Mode</div>
        <div className="mode-grid">
          <button
            className={`btn mode-btn ${!isNotesMode ? 'active' : ''}`}
            onClick={() => setIsNotesMode(false)}
          >
            Normal
          </button>
          <button
            className={`btn mode-btn notes ${isNotesMode ? 'active' : ''}`}
            onClick={() => setIsNotesMode(true)}
          >
            Notes
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-title">Number Keypad</div>
        <div className="keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-button"
              onClick={() => onNumberInput(num)}
              disabled={!selectedCell}
            >
              {num}
            </button>
          ))}
          <button
            className="keypad-button clear-btn"
            onClick={() => onNumberInput(0)}
            disabled={!selectedCell}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="action-stack">
        <button className="btn primary" onClick={onNewGame}>
          New Game
        </button>
        <button className="btn secondary" onClick={onBackToMenu}>
          Quit to Menu
        </button>
      </div>
    </aside>
  );
};
