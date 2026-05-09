import type { HTMLAttributes, ReactNode } from 'react';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  /** `glass` is the default premium frosted card. `solid` is fully opaque white. `dark` is a deep glass for canvas/playfield. */
  variant?: 'glass' | 'solid' | 'dark';
  tone?: 'sky' | 'pink' | 'mint' | 'violet';
  children: ReactNode;
};

const VARIANT: Record<NonNullable<PanelProps['variant']>, string> = {
  glass: 'glass shadow-glass',
  solid: 'bg-white border border-sky-100 shadow-glass',
  dark: 'glass-dark text-sky-50 shadow-glass-lg',
};

const TONE: Record<NonNullable<PanelProps['tone']>, string> = {
  sky: 'ring-1 ring-sky-200/60',
  pink: 'ring-1 ring-bubble-pink/30',
  mint: 'ring-1 ring-bubble-mint/30',
  violet: 'ring-1 ring-bubble-violet/30',
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
