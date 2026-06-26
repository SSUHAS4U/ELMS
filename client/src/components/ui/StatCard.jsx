import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Premium KPI tile with animated count-up, icon chip, and optional trend.
 * Used across every dashboard.
 */
export function StatCard({ icon: Icon, label, value, suffix = '', prefix = '', trend, delay = 0, accent = 'accent', className }) {
  const isNumeric = typeof value === 'number';
  const trendUp = trend != null && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('glass-panel hover-lift p-5 relative overflow-hidden group', className)}
    >
      {/* glow blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70"
           style={{ background: 'var(--accent-glow)' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-[var(--radius-sm)] grid place-items-center bg-[color:var(--accent-glow)] text-accent ring-1 ring-inset ring-accent/15">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend != null && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            trendUp ? 'text-[color:var(--success)] bg-[color:var(--success)]/12' : 'text-[color:var(--danger)] bg-[color:var(--danger)]/12'
          )}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="font-display text-3xl font-bold text-content tabular-nums tracking-tight">
        {prefix}
        {isNumeric ? <CountUp end={value} duration={1.4} separator="," /> : value}
        {suffix}
      </div>
      <div className="text-sm text-content-secondary mt-1">{label}</div>
    </motion.div>
  );
}

export default StatCard;
