'use client';

import { useEffect, useRef } from 'react';

import { AudioManager } from '@/game/engine/audio';
import { PHYS } from '@/game/engine/types';
import { World } from '@/game/engine/world';

type GameCanvasProps = {
  audio: AudioManager;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: () => void;
};

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DT = 0.05; // clamp to avoid catch-up storms after tab visibility

export function GameCanvas({
  audio,
  onScoreChange,
  onLivesChange,
  onGameOver,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep a stable reference to the latest callbacks so the imperative loop
  // doesn't need to be recreated when React re-renders.
  const callbacksRef = useRef({ onScoreChange, onLivesChange, onGameOver });
  callbacksRef.current = { onScoreChange, onLivesChange, onGameOver };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const world = new World({
      onPop: () => audio.play('hit'),
      onScoreChange: (s) => callbacksRef.current.onScoreChange(s),
      onLivesChange: (l) => callbacksRef.current.onLivesChange(l),
      onGameOver: () => {
        audio.play('gameover');
        callbacksRef.current.onGameOver();
      },
    });
    world.reset();

    // -- responsive sizing (DPR-aware, letterboxed virtual aspect) ----------
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = container.getBoundingClientRect();

      const targetAspect = PHYS.worldWidth / PHYS.worldHeight;
      let cssW = rect.width;
      let cssH = rect.width / targetAspect;
      if (cssH > rect.height) {
        cssH = rect.height;
        cssW = rect.height * targetAspect;
      }

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // -- input: aim + shoot -------------------------------------------------
    // Mouse: pointermove updates aim continuously (live preview), pointerdown shoots.
    // Touch / pen: pointerdown begins aim, pointermove drags it, pointerup shoots.
    const toWorld = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * PHYS.worldWidth;
      const y = ((e.clientY - rect.top) / rect.height) * PHYS.worldHeight;
      return { x, y };
    };

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const { x, y } = toWorld(e);
      world.setAim(x, y);
      if (e.pointerType === 'mouse') {
        if (world.shoot()) audio.play('shoot');
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || canvas.hasPointerCapture(e.pointerId)) {
        const { x, y } = toWorld(e);
        world.setAim(x, y);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        const { x, y } = toWorld(e);
        world.setAim(x, y);
        if (world.shoot()) audio.play('shoot');
      }
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);

    // -- main loop with fixed-timestep accumulator -------------------------
    let raf = 0;
    let last = performance.now();
    let accumulator = 0;
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(MAX_FRAME_DT, (now - last) / 1000);
      last = now;

      accumulator += dt;
      let steps = 0;
      while (accumulator >= FIXED_STEP && steps < 5) {
        world.update(FIXED_STEP);
        accumulator -= FIXED_STEP;
        steps += 1;
      }
      if (accumulator > FIXED_STEP * 5) accumulator = 0;

      const sx = canvas.width / PHYS.worldWidth;
      const sy = canvas.height / PHYS.worldHeight;
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      world.render(ctx);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [audio]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl shadow-glass-lg ring-1 ring-white/60 bg-gradient-to-br from-sky-100/80 to-white/60 backdrop-blur-sm lg:max-w-[min(32rem,calc((100vh-12rem)*0.75))] xl:max-w-[min(36rem,calc((100vh-13rem)*0.75))]"
    >
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        // Prevents browser scroll/zoom while the player drags-to-aim on mobile.
        style={{ touchAction: 'none' }}
        aria-label="Neon Pop bubble shooter — aim with the mouse and click, or drag and release on touch"
      />
    </div>
  );
}
