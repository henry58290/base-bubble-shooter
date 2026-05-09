import { COLORS, type ColorIndex } from './types';

/** Draw a glossy bubble centered at (x, y) with radius r and the given color. */
export function renderBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: ColorIndex,
  alpha = 1,
) {
  const hex = COLORS[color] ?? '#38bdf8';

  ctx.save();
  ctx.globalAlpha = alpha;

  // Soft drop shadow under the bubble for depth on the bright background.
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  // Body fill — radial gradient from a brighter center to a saturated edge for a 3D feel.
  const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  body.addColorStop(0, lighten(hex, 0.55));
  body.addColorStop(0.6, hex);
  body.addColorStop(1, darken(hex, 0.18));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Subtle outline, no shadow.
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = darken(hex, 0.25) + 'aa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Specular highlight (top-left).
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.32,
    y - r * 0.4,
    r * 0.28,
    r * 0.18,
    -Math.PI / 4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Faint secondary highlight at bottom for "polished" finish.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y + r * 0.42, r * 0.14, 0, Math.PI * 2);
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
  const hex = COLORS[color] ?? '#38bdf8';
  const t = Math.min(1, progress);
  const radius = r * (1 + t * 0.7);
  const alpha = 1 - t;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hex;
  ctx.shadowColor = hex;
  ctx.shadowBlur = 14;
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

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount)),
  );
}
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    Math.max(0, Math.round(r * (1 - amount))),
    Math.max(0, Math.round(g * (1 - amount))),
    Math.max(0, Math.round(b * (1 - amount))),
  );
}
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  );
}
