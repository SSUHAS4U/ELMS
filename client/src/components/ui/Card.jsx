import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Glass / surface card primitive used across the whole app.
 * variant: 'glass' (translucent liquid-glass) | 'surface' (solid) | 'plain'
 */
export function Card({ as = 'div', variant = 'glass', hover = false, className, children, ...props }) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        variant === 'glass' && 'glass-panel',
        variant === 'surface' && 'card-surface',
        variant === 'plain' && 'rounded-[var(--radius)] border border-line',
        hover && 'hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Animated card that fades/slides in — drop-in for grids & lists. */
export function MotionCard({ delay = 0, hover = true, variant = 'glass', className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        variant === 'glass' && 'glass-panel',
        variant === 'surface' && 'card-surface',
        hover && 'hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('flex items-center justify-between gap-3 p-5 pb-3', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('font-display text-base font-semibold text-content', className)} {...props}>{children}</h3>;
}

export function CardBody({ className, children, ...props }) {
  return <div className={cn('p-5 pt-0', className)} {...props}>{children}</div>;
}

export default Card;
