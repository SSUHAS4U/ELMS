import { cn } from '../../lib/utils';

/**
 * Obsidian ELMS mark — a faceted emerald "O" gem.
 * size in px controls the glyph; `wordmark` shows the text label.
 */
export function Logo({ size = 32, wordmark = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="relative grid place-items-center rounded-xl shrink-0 overflow-hidden"
        style={{
          width: size, height: size,
          background: 'linear-gradient(145deg, var(--accent-bright), var(--accent-muted))',
          boxShadow: '0 6px 18px -6px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none">
          <path d="M12 3l7 4.5v9L12 21l-7-4.5v-9L12 3z" stroke="var(--accent-contrast)" strokeWidth="1.6" strokeLinejoin="round" opacity="0.95" />
          <path d="M12 7.5l3.5 2.25v4.5L12 16.5l-3.5-2.25v-4.5L12 7.5z" fill="var(--accent-contrast)" opacity="0.9" />
        </svg>
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 -translate-x-full animate-shimmer" style={{ animationDuration: '3.5s' }} />
      </span>
      {wordmark && (
        <span className="font-display font-bold tracking-tight text-content leading-none" style={{ fontSize: size * 0.52 }}>
          Obsidian <span className="text-accent">ELMS</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
