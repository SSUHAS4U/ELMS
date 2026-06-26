import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Accessible glass modal. Renders in a portal, scrim dismiss, Esc to close,
 * spatial scale-in animation from center.
 */
export function Modal({ isOpen, onClose, title, description, icon: Icon, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={cn('relative glass-panel w-full p-0 overflow-hidden', widths[size])}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-line/60">
              <div className="flex items-center gap-3 min-w-0">
                {Icon && <div className="w-10 h-10 rounded-[var(--radius-sm)] grid place-items-center bg-[color:var(--accent-glow)] text-accent ring-1 ring-inset ring-accent/15 shrink-0"><Icon className="w-5 h-5" /></div>}
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-semibold text-content truncate">{title}</h2>
                  {description && <p className="text-sm text-content-secondary truncate">{description}</p>}
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary hover:text-content hover:bg-overlay transition-colors shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="p-5 pt-0 flex gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
