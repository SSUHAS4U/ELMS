import { Check, Clock, X, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const tones = {
  approved: 'pill-approved',
  pending:  'pill-pending',
  rejected: 'pill-rejected',
  neutral:  'text-content-secondary bg-overlay',
  accent:   'text-accent bg-[color:var(--accent-glow)]',
  info:     'text-[color:var(--info)] bg-[color:var(--info)]/12',
};

const icons = {
  approved: Check,
  pending: Clock,
  rejected: X,
  neutral: Minus,
};

/** Status pill. Pass `status` ('approved'|'pending'|'rejected') or `tone`. */
export function Badge({ status, tone, icon: IconProp, children, className, ...props }) {
  const key = status?.toLowerCase();
  const resolvedTone = tones[key] || tones[tone] || tones.neutral;
  const Icon = IconProp || (key && icons[key]);
  return (
    <span className={cn('pill capitalize', resolvedTone, className)} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children || status}
    </span>
  );
}

export default Badge;
