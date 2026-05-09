import type { HTMLAttributes, ReactNode } from 'react';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'green' | 'cyan' | 'magenta';
  children: ReactNode;
};

const TONE = {
  green: 'border-neon-green/30 shadow-[0_0_30px_rgba(0,255,157,0.10)]',
  cyan: 'border-neon-cyan/30 shadow-[0_0_30px_rgba(0,229,255,0.10)]',
  magenta: 'border-neon-magenta/30 shadow-[0_0_30px_rgba(255,45,149,0.10)]',
} as const;

export function Panel({ tone = 'green', className = '', children, ...rest }: PanelProps) {
  return (
    <div
      className={['rounded-lg border bg-panel/70 backdrop-blur-sm', TONE[tone], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
