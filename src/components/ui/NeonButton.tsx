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
  primary:
    'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[0_8px_24px_-8px_rgba(14,165,233,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(14,165,233,0.7)] hover:from-sky-500 hover:to-sky-700 disabled:from-sky-300 disabled:to-sky-400',
  secondary:
    'bg-white/80 text-sky-700 ring-1 ring-sky-200 shadow-[0_4px_14px_-4px_rgba(2,132,199,0.18)] hover:bg-white hover:ring-sky-300 hover:shadow-[0_8px_22px_-6px_rgba(2,132,199,0.28)]',
  ghost:
    'bg-transparent text-sky-700 hover:bg-sky-50 hover:text-sky-900 ring-1 ring-transparent hover:ring-sky-200',
  danger:
    'bg-gradient-to-b from-bubble-pink to-rose-500 text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(244,63,94,0.7)]',
  success:
    'bg-gradient-to-b from-bubble-mint to-emerald-500 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.65)]',
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
