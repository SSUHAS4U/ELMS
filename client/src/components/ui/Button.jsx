import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary:  'btn-primary font-semibold',
  secondary:'bg-overlay text-content border border-line hover:border-accent/40 hover:text-accent',
  ghost:    'text-content-secondary hover:text-content hover:bg-overlay border border-transparent',
  outline:  'border border-line text-content hover:border-accent/50 hover:text-accent bg-transparent',
  danger:   'bg-[color:var(--danger)]/12 text-[color:var(--danger)] border border-[color:var(--danger)]/25 hover:bg-[color:var(--danger)]/20',
};

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-11 px-5 text-sm gap-2 rounded-[var(--radius)]',
  lg: 'h-12 px-6 text-base gap-2 rounded-[var(--radius)]',
  icon: 'h-10 w-10 rounded-[var(--radius-sm)]',
};

/** Unified button. Handles loading + disabled states accessibly. */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none cursor-pointer',
        'transition-all duration-200 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
