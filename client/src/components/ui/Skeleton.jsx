import { cn } from '../../lib/utils';

/** Shimmer skeleton block. Use for >300ms loads instead of blank/spinner. */
export function Skeleton({ className, ...props }) {
  return <div className={cn('shimmer rounded-[var(--radius-sm)]', className)} {...props} />;
}

/** Convenience card-shaped skeleton. */
export function SkeletonCard({ className }) {
  return (
    <div className={cn('glass-panel p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-11 h-11 rounded-[var(--radius-sm)]" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <Skeleton className="w-2/3 h-8" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export default Skeleton;
