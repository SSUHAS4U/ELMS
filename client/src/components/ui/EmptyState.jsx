import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Friendly empty state with optional action. */
export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{ background: 'var(--accent-glow)' }} />
        <div className="relative w-16 h-16 rounded-2xl grid place-items-center bg-overlay border border-line text-content-secondary">
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold text-content">{title}</h3>
      {description && <p className="text-content-secondary mt-1.5 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
