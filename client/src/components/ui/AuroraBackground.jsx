import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Cinematic animated aurora background — softly drifting emerald glow blobs over
 * the app's base color, with a faint grid and edge vignette. Theme-aware (uses
 * --aurora-* / --bg-base tokens) so it reads well in both dark and light mode.
 *
 * Render once as a full-page layer: <AuroraBackground /> inside a `relative` parent.
 * It's an absolute, non-interactive layer that sits behind content.
 */
export function AuroraBackground({ className }) {
  const blob = (style, anim, dur) => (
    <motion.div
      className="absolute rounded-full will-change-transform"
      style={{ filter: 'blur(90px)', ...style }}
      animate={anim}
      transition={{ duration: dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    />
  );

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      {/* emerald — top left */}
      {blob(
        { top: '-6%', left: '-4%', width: 620, height: 620, background: 'radial-gradient(circle, var(--aurora-1) 0%, transparent 70%)' },
        { x: [-60, 80, -60], y: [-40, 40, -40], scale: [1, 1.15, 1] }, 11
      )}
      {/* emerald — bottom right */}
      {blob(
        { bottom: '-10%', right: '-6%', width: 720, height: 720, background: 'radial-gradient(circle, var(--aurora-2) 0%, transparent 70%)' },
        { x: [60, -80, 60], y: [40, -40, 40], scale: [1, 1.2, 1] }, 13
      )}
      {/* violet — center, for depth */}
      {blob(
        { top: '38%', left: '46%', width: 540, height: 540, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, var(--aurora-3) 0%, transparent 70%)' },
        { x: [-40, 50, -40], y: [30, -30, 30], scale: [1, 1.12, 1] }, 9
      )}

      {/* faint engineering grid, masked to fade out */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 35%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 35%, transparent 80%)',
        }}
      />

      {/* edge vignette toward base so glow never hits a hard edge */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 25%, transparent 40%, var(--bg-base) 100%)' }} />
    </div>
  );
}

export default AuroraBackground;
