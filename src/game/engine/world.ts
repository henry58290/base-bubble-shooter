import { renderBubble, renderPop } from './render';
import {
  COLORS,
  PHYS,
  colsInRow,
  gridToWorld,
  neighborsOf,
  type ColorIndex,
  type FallingBubble,
  type GridBubble,
  type PoppingBubble,
  type Shot,
  type Vec2,
} from './types';

export type WorldCallbacks = {
  onPop?: () => void;
  onMiss?: () => void;
  onScoreChange?: (score: number) => void;
  /** Repurposed for Bubble Shooter: misses-remaining-before-jolt countdown. */
  onLivesChange?: (lives: number) => void;
  onGameOver?: () => void;
};

const cannonOrigin = (): Vec2 => ({ x: PHYS.worldWidth / 2, y: PHYS.cannonY });

/**
 * Classic Bubble Shooter world.
 *
 *   - Hex grid of colored bubbles at the top.
 *   - Cannon at the bottom-center fires the loaded bubble along the aim vector.
 *   - Shot bounces off side walls; on collision it snaps to the closest empty
 *     hex cell adjacent to whatever it hit (or row 0 on a clean ceiling shot).
 *   - Cluster of ≥3 same-color connected bubbles → pop, then any bubbles that
 *     are no longer reachable from the ceiling fall.
 *   - Ceiling descends slowly and jolts down a row every N missed shots.
 *   - Game over fires when any bubble crosses `dangerY`.
 */
export class World {
  /** Sparse 2D grid keyed by [row][col]. Empty cells are null. */
  grid: (GridBubble | null)[][] = [];
  shot: Shot | null = null;
  fallingBubbles: FallingBubble[] = [];
  poppingBubbles: PoppingBubble[] = [];

  loaded: ColorIndex = 0;
  next: ColorIndex = 0;
  aim: Vec2 = { x: PHYS.worldWidth / 2, y: 0 };

  /** Continuous descent, pixels. Grows monotonically until cleared. */
  descend = 0;
  descendSpeed: number = PHYS.descendSpeedStart;

  score = 0;
  combo = 0;
  comboTimer = 0;

  shotsFired = 0;
  missesSinceJolt = 0;

  elapsed = 0;
  gameOver = false;

  /** Cached trajectory polyline; recomputed once per update tick. */
  private trajectoryCache: Vec2[] = [];

  callbacks: WorldCallbacks;

  constructor(callbacks: WorldCallbacks = {}) {
    this.callbacks = callbacks;
  }

  // -- lifecycle ----------------------------------------------------------

  reset() {
    this.grid = [];
    this.shot = null;
    this.fallingBubbles = [];
    this.poppingBubbles = [];
    this.aim = { x: PHYS.worldWidth / 2, y: 0 };
    this.descend = 0;
    this.descendSpeed = PHYS.descendSpeedStart;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.shotsFired = 0;
    this.missesSinceJolt = 0;
    this.elapsed = 0;
    this.gameOver = false;
    this.trajectoryCache = [];

    this.spawnInitialGrid();
    this.loaded = this.pickColorFromGrid();
    this.next = this.pickColorFromGrid();

    this.callbacks.onScoreChange?.(0);
    this.callbacks.onLivesChange?.(PHYS.maxMissesBeforeJolt);
  }

  isGameOver() {
    return this.gameOver;
  }

  setAim(x: number, y: number) {
    // Clamp aim so the player can't fire flat or downward.
    this.aim = { x, y: Math.min(y, PHYS.cannonY - 30) };
  }

  // -- update -------------------------------------------------------------

  update(dt: number) {
    if (!this.gameOver) {
      this.elapsed += dt;
      // Descent ramps with elapsed time but is intentionally gentle so good
      // play (low miss rate) yields longer rounds.
      this.descendSpeed = PHYS.descendSpeedStart + Math.min(2.5, this.elapsed * 0.012);
      this.descend += this.descendSpeed * dt;

      if (this.combo > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) this.combo = 0;
      }
    }

    this.updateAnimations(dt);
    if (this.shot) this.advanceShot(dt);

    if (!this.gameOver) {
      // Refresh trajectory preview for the next render (only when no shot in flight).
      this.trajectoryCache = this.shot ? [] : this.computeTrajectory();
      this.checkGameOver();
      this.checkCleared();
    }
  }

  private updateAnimations(dt: number) {
    for (let i = this.poppingBubbles.length - 1; i >= 0; i--) {
      this.poppingBubbles[i].progress += dt * 4;
      if (this.poppingBubbles[i].progress >= 1) this.poppingBubbles.splice(i, 1);
    }
    for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
      const f = this.fallingBubbles[i];
      f.vel.y += 720 * dt; // gravity
      f.pos.x += f.vel.x * dt;
      f.pos.y += f.vel.y * dt;
      f.rotation += f.spin * dt;
      if (f.pos.y - PHYS.bubbleRadius > PHYS.worldHeight + 60) this.fallingBubbles.splice(i, 1);
    }
  }

  // -- shooting & collision ----------------------------------------------

  shoot(): boolean {
    if (this.shot || this.gameOver) return false;
    const { vx, vy } = this.aimVelocity();
    this.shot = {
      pos: cannonOrigin(),
      vel: { x: vx, y: vy },
      color: this.loaded,
    };
    this.shotsFired += 1;
    return true;
  }

  private aimVelocity(): { vx: number; vy: number } {
    const origin = cannonOrigin();
    let dx = this.aim.x - origin.x;
    let dy = this.aim.y - origin.y;
    if (dy > -10) dy = -10; // never fire flat or downward
    const len = Math.max(1, Math.hypot(dx, dy));
    return { vx: (dx / len) * PHYS.shotSpeed, vy: (dy / len) * PHYS.shotSpeed };
  }

  private advanceShot(dt: number) {
    if (!this.shot) return;
    // Sub-step to avoid tunneling at high speeds.
    const subSteps = 5;
    const sdt = dt / subSteps;
    const r = PHYS.bubbleRadius;

    for (let i = 0; i < subSteps; i++) {
      if (!this.shot) return;

      this.shot.pos.x += this.shot.vel.x * sdt;
      this.shot.pos.y += this.shot.vel.y * sdt;

      // Bounce off side walls.
      if (this.shot.pos.x - r < 0) {
        this.shot.pos.x = r;
        this.shot.vel.x = Math.abs(this.shot.vel.x);
      } else if (this.shot.pos.x + r > PHYS.worldWidth) {
        this.shot.pos.x = PHYS.worldWidth - r;
        this.shot.vel.x = -Math.abs(this.shot.vel.x);
      }

      // Reached the descended ceiling? Snap to row 0.
      if (this.shot.pos.y - r <= this.descend) {
        this.snapShot(null);
        return;
      }

      // Collided with an existing grid bubble?
      const hit = this.findColliding(this.shot.pos);
      if (hit) {
        this.snapShot(hit);
        return;
      }
    }
  }

  private findColliding(p: Vec2): GridBubble | null {
    const touchDist2 = (PHYS.bubbleRadius * 2) ** 2;
    let best: GridBubble | null = null;
    let bestDist = Infinity;
    for (let row = 0; row < this.grid.length; row++) {
      const cells = this.grid[row];
      for (let col = 0; col < cells.length; col++) {
        const b = cells[col];
        if (!b) continue;
        const wp = gridToWorld(row, col, this.descend);
        const dx = wp.x - p.x;
        const dy = wp.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < touchDist2 && d2 < bestDist) {
          bestDist = d2;
          best = b;
        }
      }
    }
    return best;
  }

  /** Snap the active shot to the closest empty grid cell, then resolve matches. */
  private snapShot(hit: GridBubble | null) {
    if (!this.shot) return;
    const shotPos = this.shot.pos;
    const shotColor = this.shot.color;
    this.shot = null;

    // Build candidate empty cells: neighbors of `hit`, or row 0 if ceiling shot.
    const candidates: [number, number][] = [];
    if (hit) {
      for (const [r, c] of neighborsOf(hit.row, hit.col)) {
        if (r < 0) continue;
        if (c < 0 || c >= colsInRow(r)) continue;
        if (!this.getCell(r, c)) candidates.push([r, c]);
      }
    } else {
      for (let c = 0; c < colsInRow(0); c++) {
        if (!this.getCell(0, c)) candidates.push([0, c]);
      }
    }

    if (candidates.length === 0) {
      // Edge case: nowhere to land. Treat as miss.
      this.registerMiss();
      this.cycleCannon();
      return;
    }

    // Pick the empty cell whose world position is closest to the shot.
    let best: [number, number] = candidates[0];
    let bestDist = Infinity;
    for (const [r, c] of candidates) {
      const wp = gridToWorld(r, c, this.descend);
      const dx = wp.x - shotPos.x;
      const dy = wp.y - shotPos.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        best = [r, c];
      }
    }

    const placed: GridBubble = { row: best[0], col: best[1], color: shotColor };
    this.setCell(best[0], best[1], placed);

    // Check for a matching cluster ≥ 3.
    const cluster = this.findColorCluster(placed);
    if (cluster.length >= 3) {
      this.popCluster(cluster);
      const dropped = this.dropDisconnected();
      this.scoreMatch(cluster.length, dropped);
      this.callbacks.onPop?.();
      this.missesSinceJolt = 0;
      this.callbacks.onLivesChange?.(PHYS.maxMissesBeforeJolt);
    } else {
      this.registerMiss();
    }

    this.cycleCannon();
  }

  private registerMiss() {
    this.combo = 0;
    this.missesSinceJolt += 1;
    this.callbacks.onMiss?.();
    const remaining = Math.max(0, PHYS.maxMissesBeforeJolt - this.missesSinceJolt);
    this.callbacks.onLivesChange?.(remaining);

    if (this.missesSinceJolt >= PHYS.maxMissesBeforeJolt) {
      // Jolt ceiling down by one row.
      this.descend += PHYS.rowHeight;
      this.missesSinceJolt = 0;
      this.callbacks.onLivesChange?.(PHYS.maxMissesBeforeJolt);
    }
  }

  private cycleCannon() {
    this.loaded = this.next;
    this.next = this.pickColorFromGrid();
  }

  // -- cluster matching ---------------------------------------------------

  /** Flood-fill same-color connected component starting at `start`. */
  private findColorCluster(start: GridBubble): GridBubble[] {
    const visited = new Set<string>();
    const stack: GridBubble[] = [start];
    const result: GridBubble[] = [];
    while (stack.length > 0) {
      const b = stack.pop()!;
      const key = `${b.row},${b.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (b.color !== start.color) continue;
      result.push(b);
      for (const [r, c] of neighborsOf(b.row, b.col)) {
        const n = this.getCell(r, c);
        if (n && !visited.has(`${r},${c}`)) stack.push(n);
      }
    }
    return result;
  }

  private popCluster(cluster: GridBubble[]) {
    for (const b of cluster) {
      const wp = gridToWorld(b.row, b.col, this.descend);
      this.poppingBubbles.push({ pos: wp, color: b.color, progress: 0 });
      this.setCell(b.row, b.col, null);
    }
  }

  /** Anything not reachable from row 0 detaches and falls. Returns the dropped count. */
  private dropDisconnected(): number {
    const connected = new Set<string>();
    const stack: [number, number][] = [];
    for (let c = 0; c < colsInRow(0); c++) {
      if (this.getCell(0, c)) stack.push([0, c]);
    }
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      const key = `${r},${c}`;
      if (connected.has(key)) continue;
      const b = this.getCell(r, c);
      if (!b) continue;
      connected.add(key);
      for (const [nr, nc] of neighborsOf(r, c)) {
        if (!connected.has(`${nr},${nc}`)) stack.push([nr, nc]);
      }
    }

    let dropped = 0;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const b = this.grid[r][c];
        if (b && !connected.has(`${r},${c}`)) {
          const wp = gridToWorld(r, c, this.descend);
          this.fallingBubbles.push({
            pos: wp,
            vel: { x: (Math.random() - 0.5) * 60, y: 40 + Math.random() * 60 },
            color: b.color,
            rotation: 0,
            spin: (Math.random() - 0.5) * 6,
          });
          this.setCell(r, c, null);
          dropped += 1;
        }
      }
    }
    return dropped;
  }

  private scoreMatch(clusterSize: number, droppedCount: number) {
    this.combo += 1;
    this.comboTimer = 1.5;
    const popPoints = clusterSize * 100 * this.combo;
    const dropPoints = droppedCount * 200 * this.combo;
    this.score += popPoints + dropPoints;
    this.callbacks.onScoreChange?.(this.score);
  }

  // -- end conditions -----------------------------------------------------

  private checkGameOver() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const b = this.grid[r][c];
        if (!b) continue;
        const wp = gridToWorld(r, c, this.descend);
        if (wp.y + PHYS.bubbleRadius >= PHYS.dangerY) {
          this.gameOver = true;
          this.callbacks.onGameOver?.();
          return;
        }
      }
    }
  }

  /** When the board is cleared, award a bonus and respawn a fresh wave at the top. */
  private checkCleared() {
    if (this.shot || this.poppingBubbles.length > 0) return;
    let any = false;
    outer: for (const row of this.grid) {
      for (const b of row) {
        if (b) {
          any = true;
          break outer;
        }
      }
    }
    if (any) return;
    if (this.fallingBubbles.length > 0) return; // wait for fall-out polish

    this.score += 5000;
    this.callbacks.onScoreChange?.(this.score);
    this.descend = 0;
    this.spawnInitialGrid();
  }

  // -- grid helpers -------------------------------------------------------

  private getCell(row: number, col: number): GridBubble | null {
    if (row < 0 || row >= this.grid.length) return null;
    const cells = this.grid[row];
    if (col < 0 || col >= cells.length) return null;
    return cells[col];
  }

  private setCell(row: number, col: number, value: GridBubble | null) {
    while (this.grid.length <= row) {
      this.grid.push(new Array(colsInRow(this.grid.length)).fill(null));
    }
    if (col < 0 || col >= this.grid[row].length) return;
    this.grid[row][col] = value;
  }

  private spawnInitialGrid() {
    this.grid = [];
    for (let r = 0; r < PHYS.initialRows; r++) {
      const cells: (GridBubble | null)[] = [];
      const cols = colsInRow(r);
      for (let c = 0; c < cols; c++) {
        cells.push({ row: r, col: c, color: Math.floor(Math.random() * COLORS.length) });
      }
      this.grid.push(cells);
    }
  }

  private pickColorFromGrid(): ColorIndex {
    const set = new Set<ColorIndex>();
    for (const row of this.grid) {
      for (const b of row) if (b) set.add(b.color);
    }
    if (set.size === 0) return Math.floor(Math.random() * COLORS.length);
    const arr = Array.from(set);
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // -- trajectory preview -------------------------------------------------

  /**
   * March a virtual shot from the cannon along the current aim vector,
   * bouncing off walls, and stop at the first grid bubble or the ceiling.
   * Returns a polyline including each bounce point.
   */
  private computeTrajectory(): Vec2[] {
    const points: Vec2[] = [];
    const origin = cannonOrigin();
    points.push({ ...origin });

    const { vx, vy } = this.aimVelocity();
    if (vy >= 0) return points;

    const r = PHYS.bubbleRadius;
    let x = origin.x;
    let y = origin.y;
    let dx = vx;
    let dy = vy;
    const stepDt = 0.005;
    const maxSteps = 1500;

    for (let i = 0; i < maxSteps; i++) {
      x += dx * stepDt;
      y += dy * stepDt;

      if (x - r < 0) {
        x = r;
        dx = Math.abs(dx);
        points.push({ x, y });
      } else if (x + r > PHYS.worldWidth) {
        x = PHYS.worldWidth - r;
        dx = -Math.abs(dx);
        points.push({ x, y });
      }

      if (y - r <= this.descend) {
        points.push({ x, y });
        return points;
      }
      if (this.findColliding({ x, y })) {
        points.push({ x, y });
        return points;
      }
    }

    points.push({ x, y });
    return points;
  }

  // -- rendering ----------------------------------------------------------

  render(ctx: CanvasRenderingContext2D) {
    // Soft sky-blue gradient backdrop matching the page theme.
    const bg = ctx.createLinearGradient(0, 0, 0, PHYS.worldHeight);
    bg.addColorStop(0, '#bae6fd');
    bg.addColorStop(0.5, '#e0f2fe');
    bg.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, PHYS.worldWidth, PHYS.worldHeight);

    // Subtle grid lines for depth.
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= PHYS.worldWidth; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, PHYS.worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= PHYS.worldHeight; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(PHYS.worldWidth, y);
      ctx.stroke();
    }

    // Ceiling line at y = descend (where the grid hangs from).
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.descend);
    ctx.lineTo(PHYS.worldWidth, this.descend);
    ctx.stroke();
    ctx.restore();

    // Danger line.
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(244, 63, 94, 0.45)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, PHYS.dangerY);
    ctx.lineTo(PHYS.worldWidth, PHYS.dangerY);
    ctx.stroke();
    ctx.restore();

    // Trajectory preview (only when no shot in flight).
    if (!this.shot && !this.gameOver) this.renderTrajectory(ctx);

    // Grid bubbles.
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const b = this.grid[row][col];
        if (!b) continue;
        const wp = gridToWorld(row, col, this.descend);
        renderBubble(ctx, wp.x, wp.y, PHYS.bubbleRadius, b.color);
      }
    }

    // Falling bubbles (slight rotation indicated by faint wobble in alpha).
    for (const f of this.fallingBubbles) {
      renderBubble(ctx, f.pos.x, f.pos.y, PHYS.bubbleRadius, f.color, 0.85);
    }

    // Pop animations.
    for (const p of this.poppingBubbles) {
      renderPop(ctx, p.pos.x, p.pos.y, PHYS.bubbleRadius, p.color, p.progress);
    }

    // Active shot.
    if (this.shot) {
      renderBubble(ctx, this.shot.pos.x, this.shot.pos.y, PHYS.bubbleRadius, this.shot.color);
    }

    this.renderCannon(ctx);

    if (this.combo > 1) {
      ctx.save();
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 14px Inter, ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(14, 165, 233, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fillText(`x${this.combo} CHAIN`, PHYS.worldWidth / 2, 24);
      ctx.restore();
    }
  }

  private renderTrajectory(ctx: CanvasRenderingContext2D) {
    const pts = this.trajectoryCache;
    if (pts.length < 2) return;

    const color = COLORS[this.loaded] ?? '#00ff9d';

    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    // Aim reticle at the predicted endpoint.
    const last = pts[pts.length - 1];
    ctx.setLineDash([]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private renderCannon(ctx: CanvasRenderingContext2D) {
    const origin = cannonOrigin();

    // Arc base mount.
    ctx.save();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.10)';
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y + 6, 34, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Aim stub from cannon center toward aim direction.
    if (!this.shot && !this.gameOver) {
      const { vx, vy } = this.aimVelocity();
      const len = Math.max(1, Math.hypot(vx, vy));
      const px = origin.x + (vx / len) * 30;
      const py = origin.y + (vy / len) * 30;
      ctx.save();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();
    }

    // Loaded bubble sits in the cannon when no shot is in flight.
    if (!this.shot) {
      renderBubble(ctx, origin.x, origin.y, PHYS.bubbleRadius, this.loaded);
    }

    // "NEXT" preview (smaller, off to the left).
    const nx = origin.x - 64;
    const ny = origin.y + 4;
    renderBubble(ctx, nx, ny, PHYS.bubbleRadius * 0.65, this.next, 0.75);
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.7)';
    ctx.font = '600 9px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', nx, ny - 18);
    ctx.restore();
  }
}
