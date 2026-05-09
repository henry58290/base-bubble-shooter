export type Vec2 = { x: number; y: number };

/** Index into COLORS — every bubble carries one of these. */
export type ColorIndex = number;

/** Neon palette. Five colors keeps matching tractable while preserving the cyberpunk vibe. */
export const COLORS: readonly string[] = [
  '#00ff9d', // neon green
  '#00e5ff', // neon cyan
  '#ff2d95', // neon magenta
  '#ffd166', // amber
  '#a78bfa', // violet
];

/**
 * Bubble engine constants. Distances are in *virtual* world units (the canvas
 * scales them to fit). Hexagonal grid: even rows have COLS bubbles, odd rows
 * have COLS-1 (and are shifted right by one radius).
 */
export const PHYS = {
  worldWidth: 360,
  worldHeight: 480,
  bubbleRadius: 16,
  cols: 11, // bubbles per even row
  rowHeight: 16 * Math.sqrt(3), // ≈ 27.71
  cannonY: 460,
  dangerY: 410,
  shotSpeed: 720, // px/sec
  initialRows: 6,
  descendSpeedStart: 0.35, // px/sec
  /** Misses tolerated before the ceiling jolts down by one row. */
  maxMissesBeforeJolt: 3,
} as const;

export type GridBubble = {
  row: number;
  col: number;
  color: ColorIndex;
};

export type Shot = {
  pos: Vec2;
  vel: Vec2;
  color: ColorIndex;
};

export type FallingBubble = {
  pos: Vec2;
  vel: Vec2;
  color: ColorIndex;
  rotation: number;
  spin: number;
};

export type PoppingBubble = {
  pos: Vec2;
  color: ColorIndex;
  /** 0 → 1, then culled. */
  progress: number;
};

/** Number of bubbles that fit in `row` (even rows are full, odd rows shifted by `r`). */
export function colsInRow(row: number): number {
  return row % 2 === 0 ? PHYS.cols : PHYS.cols - 1;
}

/** Convert (row, col) hex coords to world (px, py), accounting for the descended ceiling. */
export function gridToWorld(row: number, col: number, descend: number): Vec2 {
  const r = PHYS.bubbleRadius;
  const x = r + col * 2 * r + (row % 2 === 1 ? r : 0);
  const y = r + row * PHYS.rowHeight + descend;
  return { x, y };
}

/**
 * Hex-grid neighbor offsets in offset coordinates. Even rows and odd rows
 * use different deltas because of the half-cell horizontal shift.
 */
export const HEX_NEIGHBORS = {
  even: [
    [-1, -1],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
  ],
  odd: [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
} as const;

export function neighborsOf(row: number, col: number): [number, number][] {
  const offsets = row % 2 === 0 ? HEX_NEIGHBORS.even : HEX_NEIGHBORS.odd;
  return offsets.map(([dr, dc]) => [row + dr, col + dc] as [number, number]);
}
