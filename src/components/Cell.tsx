import React, { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { BOARD_CELL_DEPTH, BOARD_CELL_SIZE } from './boardConfig';
import type { FocusAxis } from '../types';

interface CellProps {
  x: number;
  y: number;
  z: number;
  value: number;
  isOriginal: boolean;
  isError: boolean;
  isSelected: boolean;
  isGlowing: boolean;
  activeLayer: number | 'all';
  focusAxis: FocusAxis;
  hoveredSlice: { axis: FocusAxis; index: number } | null;
  onHoverSlice: (axis: FocusAxis | null, index: number | null) => void;
  notes: number[];
  onClick: (x: number, y: number, z: number, axis: FocusAxis, index: number) => void;
  position: [number, number, number];
  isTransitioning?: boolean;
  transitionProgress?: number;
  globalTransitionActive?: boolean;
}

const EDGE_GEOMETRY = new THREE.EdgesGeometry(
  new THREE.BoxGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE, BOARD_CELL_DEPTH)
);

export const Cell: React.FC<CellProps> = ({
  x,
  y,
  z,
  value,
  isOriginal,
  isError,
  isSelected,
  isGlowing,
  activeLayer,
  focusAxis,
  hoveredSlice,
  onHoverSlice,
  notes,
  onClick,
  position,
  isTransitioning = false,
  transitionProgress = 0,
  globalTransitionActive = false,
}) => {
  const isHiddenBySlicing =
    activeLayer !== 'all' &&
    ((focusAxis === 'X' && x < activeLayer) ||
      (focusAxis === 'Y' && y < activeLayer) ||
      (focusAxis === 'Z' && z < activeLayer));

  if (isHiddenBySlicing) return null;

  // Determine if this cell is part of the active slice (only relevant if a specific slice is chosen)
  const isActiveSlice =
    (focusAxis === 'X' && x === activeLayer) ||
    (focusAxis === 'Y' && y === activeLayer) ||
    (focusAxis === 'Z' && z === activeLayer);

  // Determine if this cell is part of the hovered slice
  const isHoveredSlice =
    hoveredSlice !== null &&
    ((hoveredSlice.axis === 'X' && x === hoveredSlice.index) ||
      (hoveredSlice.axis === 'Y' && y === hoveredSlice.index) ||
      (hoveredSlice.axis === 'Z' && z === hoveredSlice.index));

  // Determine styling
  const visual = useMemo(() => {
    if (isSelected) {
      return {
        cellColor: '#2dd4bf', // vibrant cyan
        edgeColor: '#ccfbf1',
        emissive: '#0f766e',
        emissiveIntensity: 0.8,
        opacity: 0.95,
        textColor: '#041014',
        transparent: false,
      };
    }

    if (isError) {
      return {
        cellColor: '#ff4d6d', // warm red
        edgeColor: '#ffd1dc',
        emissive: '#881337',
        emissiveIntensity: 0.55,
        opacity: 0.95,
        textColor: '#ffffff',
        transparent: false,
      };
    }

    if (isGlowing) {
      return {
        cellColor: '#10b981', // glowing emerald/neon green
        edgeColor: '#a7f3d0',
        emissive: '#059669',
        emissiveIntensity: 1.5,
        opacity: 0.95,
        textColor: '#ffffff',
        transparent: false,
      };
    }

    // Transparent cube styling in 'All' layers view
    if (activeLayer === 'all') {
      if (isHoveredSlice) {
        return {
          cellColor: '#ffedd5', // light amber hover color
          edgeColor: '#f97316', // orange border
          emissive: '#7c2d12',
          emissiveIntensity: 0.25,
          opacity: 0.45,
          textColor: '#f97316',
          transparent: true,
        };
      }
      return {
        cellColor: isOriginal ? '#f7f2e8' : '#e5eef2',
        edgeColor: isOriginal ? 'rgba(212, 180, 106, 0.4)' : 'rgba(167, 183, 196, 0.3)',
        emissive: '#000000',
        emissiveIntensity: 0,
        opacity: isOriginal ? 0.32 : 0.16,
        textColor: isOriginal ? '#e2e8f0' : '#94a3b8',
        transparent: true,
      };
    }

    // Styling when a specific layer is active
    if (isActiveSlice) {
      return {
        cellColor: isOriginal ? '#f7f2e8' : '#e5eef2',
        edgeColor: isOriginal ? '#d4b46a' : '#a7b7c4',
        emissive: '#000000',
        emissiveIntensity: 0,
        opacity: 0.85,
        textColor: isOriginal ? '#151a21' : '#25315a',
        transparent: false,
      };
    }

    if (isHoveredSlice) {
      return {
        cellColor: '#ffedd5', // light amber hover color
        edgeColor: '#f97316', // orange border
        emissive: '#7c2d12',
        emissiveIntensity: 0.25,
        opacity: 0.55,
        textColor: '#7c2d12',
        transparent: true,
      };
    }

    // Ghosted cell (not active, not hovered, in focused layer mode)
    return {
      cellColor: '#1e293b',
      edgeColor: 'rgba(51, 65, 85, 0.22)',
      emissive: '#000000',
      emissiveIntensity: 0,
      opacity: 0.04,
      textColor: 'transparent',
      transparent: true,
    };
  }, [isSelected, isError, isGlowing, activeLayer, isActiveSlice, isHoveredSlice, isOriginal]);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const normal = event.face?.normal;
    if (!normal) return;

    // Detect hovered slice based on which face normal was intersected
    let hoverAxis: FocusAxis = 'Y';
    let sliceIndex = 0;

    if (Math.abs(normal.x) > 0.8) {
      // Left/Right face -> X slice (perpendicular to X-axis)
      hoverAxis = 'X';
      sliceIndex = x;
    } else if (Math.abs(normal.y) > 0.8) {
      // Top/Bottom face -> Y slice (perpendicular to Y-axis)
      hoverAxis = 'Y';
      sliceIndex = y;
    } else if (Math.abs(normal.z) > 0.8) {
      // Front/Back face -> Z slice (perpendicular to Z-axis)
      hoverAxis = 'Z';
      sliceIndex = z;
    }

    onHoverSlice(hoverAxis, sliceIndex);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverSlice(null, null);
  };

  const handleMeshClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    const normal = event.face?.normal;
    let clickedAxis: FocusAxis = focusAxis;
    let sliceIndex = 0;
    
    if (normal) {
      if (Math.abs(normal.x) > 0.8) {
        clickedAxis = 'X';
        sliceIndex = x;
      } else if (Math.abs(normal.y) > 0.8) {
        clickedAxis = 'Y';
        sliceIndex = y;
      } else if (Math.abs(normal.z) > 0.8) {
        clickedAxis = 'Z';
        sliceIndex = z;
      }
    }
    
    onClick(x, y, z, clickedAxis, sliceIndex);
  };

  const notesText = useMemo(() => {
    if (notes.length === 0 || value > 0) return '';
    const row1 = `${notes.includes(1) ? '1' : ' '} ${notes.includes(2) ? '2' : ' '} ${notes.includes(3) ? '3' : ' '}`;
    const row2 = `${notes.includes(4) ? '4' : ' '} ${notes.includes(5) ? '5' : ' '} ${notes.includes(6) ? '6' : ' '}`;
    const row3 = `${notes.includes(7) ? '7' : ' '} ${notes.includes(8) ? '8' : ' '} ${notes.includes(9) ? '9' : ' '}`;
    return `${row1}\n${row2}\n${row3}`;
  }, [notes, value]);

  // Show values on outer visible faces depending on theme / plane coordinates
  const showFrontValue =
    value > 0 &&
    (isGlowing ||
      (activeLayer === 'all' && z === 0) ||
      (activeLayer !== 'all' && focusAxis === 'Z' && z === activeLayer));

  const showTopValue =
    value > 0 &&
    (isGlowing ||
      (activeLayer === 'all' && y === 0) ||
      (activeLayer !== 'all' && focusAxis === 'Y' && y === activeLayer));

  const showRightValue =
    value > 0 &&
    (isGlowing ||
      (activeLayer === 'all' && x === 8) ||
      (activeLayer !== 'all' && focusAxis === 'X' && x === activeLayer));

  const showNotes =
    value === 0 &&
    notesText.length > 0 &&
    activeLayer !== 'all' &&
    isActiveSlice;

  // Let selected, glowing, active or hovered cells sit on top of transparent background cells
  const renderOrder = isSelected
    ? 50
    : isGlowing
    ? 40
    : isActiveSlice && activeLayer !== 'all'
    ? 20
    : isHoveredSlice
    ? 10
    : 1;

  // Calculate animated position when pulling slice out
  const animatedPosition = useMemo(() => {
    if (!isTransitioning || !transitionProgress) return position;
    
    const pos = [...position] as [number, number, number];
    const pullDistance = transitionProgress * 4.8; // slide out by 4.8 units

    if (focusAxis === 'X') {
      pos[0] += pullDistance;
    } else if (focusAxis === 'Y') {
      // Y is inverted in getBoardCoord, so let's pull upward
      pos[1] += pullDistance;
    } else if (focusAxis === 'Z') {
      // Z is inverted, pull towards camera (positive Z)
      pos[2] += pullDistance;
    }
    return pos;
  }, [position, isTransitioning, transitionProgress, focusAxis]);

  // Calculate animated opacity based on whether we are in a transition phase
  const opacity = useMemo(() => {
    let baseOpacity = visual.opacity;
    if (globalTransitionActive && transitionProgress !== undefined) {
      if (isTransitioning) {
        baseOpacity = visual.opacity; // Keep the active sliding slice visible
      } else {
        baseOpacity = visual.opacity * (1 - transitionProgress); // Fade others out
      }
    }
    return baseOpacity;
  }, [visual.opacity, globalTransitionActive, transitionProgress, isTransitioning]);

  return (
    <group
      position={animatedPosition}
      renderOrder={renderOrder}
      scale={isSelected ? [1.05, 1.05, 1.05] : [1, 1, 1]}
    >
      <mesh
        onClick={handleMeshClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        renderOrder={renderOrder}
      >
        <boxGeometry args={[BOARD_CELL_SIZE, BOARD_CELL_SIZE, BOARD_CELL_DEPTH]} />
        <meshStandardMaterial
          color={visual.cellColor}
          depthWrite={!visual.transparent}
          emissive={visual.emissive}
          emissiveIntensity={visual.emissiveIntensity}
          metalness={0.05}
          opacity={opacity}
          roughness={0.4}
          transparent={visual.transparent || globalTransitionActive}
        />
      </mesh>

      {/* Grid lines outlines - very faint for ghosted cells */}
      <lineSegments renderOrder={renderOrder + 1}>
        <primitive object={EDGE_GEOMETRY} attach="geometry" />
        <lineBasicMaterial
          color={visual.edgeColor}
          depthWrite={false}
          opacity={visual.transparent ? opacity * 0.5 : opacity * 0.8}
          transparent
        />
      </lineSegments>

      {/* Front Face Text */}
      {(showFrontValue || (showNotes && focusAxis === 'Z')) && (
        <Text
          position={[0, 0, BOARD_CELL_DEPTH / 2 + 0.015]}
          fontSize={0.42}
          color={visual.textColor}
          fillOpacity={opacity}
          anchorX="center"
          anchorY="middle"
          outlineColor={isGlowing ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}
          outlineWidth={isSelected || isGlowing ? 0.01 : 0}
          renderOrder={renderOrder + 2}
        >
          {value > 0 ? value.toString() : notesText}
        </Text>
      )}

      {/* Top Face Text */}
      {(showTopValue || (showNotes && focusAxis === 'Y')) && (
        <Text
          position={[0, BOARD_CELL_SIZE / 2 + 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.42}
          color={visual.textColor}
          fillOpacity={opacity}
          anchorX="center"
          anchorY="middle"
          outlineColor={isGlowing ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}
          outlineWidth={isSelected || isGlowing ? 0.01 : 0}
          renderOrder={renderOrder + 2}
        >
          {value > 0 ? value.toString() : notesText}
        </Text>
      )}

      {/* Right Face Text */}
      {(showRightValue || (showNotes && focusAxis === 'X')) && (
        <Text
          position={[BOARD_CELL_SIZE / 2 + 0.015, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.42}
          color={visual.textColor}
          fillOpacity={opacity}
          anchorX="center"
          anchorY="middle"
          outlineColor={isGlowing ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}
          outlineWidth={isSelected || isGlowing ? 0.01 : 0}
          renderOrder={renderOrder + 2}
        >
          {value > 0 ? value.toString() : notesText}
        </Text>
      )}
    </group>
  );
};
