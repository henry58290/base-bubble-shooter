import { COLORS, type ColorIndex } from './types';

/** Draw a neon bubble centered at (x, y) with radius r and the given color. */
export function renderBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: ColorIndex,
  alpha = 1,
) {
  const hex = COLORS[color] ?? '#00ff9d';

  ctx.save();
  ctx.globalAlpha = alpha;

  // Outer halo via radial gradient (gives the neon glow).
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
  grad.addColorStop(0, hex + 'CC');
  grad.addColorStop(0.65, hex + '40');
  grad.addColorStop(1, hex + '00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Crisp outline ring.
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  ctx.shadowColor = hex;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Specular highlight (tiny dot, top-left).
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Pop animation: expanding ring + radial sparkle shards, fading out. */
export function renderPop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: ColorIndex,
  progress: number,
) {
  const hex = COLORS[color] ?? '#00ff9d';
  const t = Math.min(1, progress);
  const radius = r * (1 + t * 0.7);
  const alpha = 1 - t;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hex;
  ctx.shadowColor = hex;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  const shards = 6;
  for (let i = 0; i < shards; i++) {
    const angle = (i / shards) * Math.PI * 2;
    const inner = r * (0.6 + t * 0.4);
    const outer = r * (1.1 + t * 0.9);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.restore();
}
