'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Tone = 'green' | 'cyan' | 'magenta';
type Size = 'sm' | 'md' | 'lg';

type NeonButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  tone?: Tone;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
};

const TONE: Record<Tone, string> = {
  green:
    'border-neon-green/60 text-neon-green hover:bg-neon-green/10 hover:shadow-[0_0_24px_rgba(0,255,157,0.45)] disabled:hover:bg-transparent',
  cyan: 'border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] disabled:hover:bg-transparent',
  magenta:
    'border-neon-magenta/60 text-neon-magenta hover:bg-neon-magenta/10 hover:shadow-[0_0_24px_rgba(255,45,149,0.45)] disabled:hover:bg-transparent',
};

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-sm',
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(function NeonButton(
  { tone = 'green', size = 'md', fullWidth = false, className = '', disabled, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      disabled={disabled}
      className={[
        'relative rounded-md border bg-panel/60 font-mono uppercase tracking-[0.3em] transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        fullWidth ? 'w-full' : '',
        TONE[tone],
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
