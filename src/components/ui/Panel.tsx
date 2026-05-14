import type { HTMLAttributes, ReactNode } from 'react';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  /** `glass` is the default premium frosted card. `solid` is fully opaque white. `dark` is a deep glass for canvas/playfield. */
  variant?: 'glass' | 'solid' | 'dark';
  tone?: 'sky' | 'pink' | 'mint' | 'violet';
  children: ReactNode;
};

const VARIANT: Record<NonNullable<PanelProps['variant']>, string> = {
  glass: 'glass shadow-glass text-ink-900',
  solid: 'bg-ink-100 border border-emerald-400/15 shadow-glass text-ink-900',
  dark: 'glass-dark text-ink-900 shadow-glass-lg',
};

const TONE: Record<NonNullable<PanelProps['tone']>, string> = {
  sky: 'ring-1 ring-emerald-400/20',
  pink: 'ring-1 ring-rose-400/30',
  mint: 'ring-1 ring-emerald-400/30',
  violet: 'ring-1 ring-violet-400/30',
};

export function Panel({
  variant = 'glass',
  tone = 'sky',
  className = '',
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      className={['rounded-2xl', VARIANT[variant], TONE[tone], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
