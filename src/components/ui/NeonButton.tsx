'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

type NeonButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  tone?: Tone;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
};

/**
 * Premium pill button. The legacy "neon" name is kept so existing callers don't
 * break; the visual is now a soft sky-blue gradient with glassy depth.
 */
const TONE: Record<Tone, string> = {
  // Glossy neon green→cyan ACCEPT-style button. Dark text for max contrast on
  // the bright surface. The `btn-neon` utility (globals.css) owns the gradient
  // + glow so we can keep the Tailwind class list short and readable.
  primary: 'btn-neon font-bold',
  secondary:
    'bg-white/[0.04] text-emerald-200 ring-1 ring-emerald-400/40 shadow-[0_0_22px_-6px_rgba(74,222,128,0.45)] hover:bg-emerald-400/10 hover:ring-emerald-300/70 hover:text-emerald-100',
  ghost:
    'bg-transparent text-cyan-200 hover:bg-white/[0.04] hover:text-cyan-100 ring-1 ring-transparent hover:ring-cyan-400/40',
  danger:
    'bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[0_0_28px_-4px_rgba(244,63,94,0.55)] hover:from-rose-300 hover:to-rose-500 hover:shadow-[0_0_40px_-4px_rgba(244,63,94,0.75)]',
  success:
    'btn-neon font-bold',
};

// Map legacy tones (green/cyan/magenta) onto the new palette so existing callers keep working.
const TONE_ALIAS: Record<string, Tone> = {
  green: 'primary',
  cyan: 'secondary',
  magenta: 'danger',
};

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(function NeonButton(
  {
    tone = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const resolvedTone: Tone = (TONE_ALIAS[tone as string] as Tone) ?? (tone as Tone);
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      disabled={disabled}
      className={[
        'relative inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth ? 'w-full' : '',
        TONE[resolvedTone],
        SIZE[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
