import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Consistent page title block with eyebrow, gradient-capable title and actions slot.
 */
export function PageHeader({ eyebrow, title, subtitle, icon: Icon, actions, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-glow" />
            {eyebrow}
          </div>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-[var(--radius-sm)] grid place-items-center bg-[color:var(--accent-glow)] text-accent ring-1 ring-inset ring-accent/15 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-content tracking-tight truncate">{title}</h1>
        </div>
        {subtitle && <p className="text-content-secondary mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}

export default PageHeader;
