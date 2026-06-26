import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

/**
 * Responsive list/table primitive.
 *  - md and up  → a normal data table (visually unchanged from before)
 *  - below md   → each row becomes a stacked card (no horizontal scroll on mobile)
 *
 * columns: array of {
 *   key, header,
 *   render?(row),               // cell content (defaults to row[key])
 *   align?: 'left'|'right',
 *   mobile?: 'title'|'trailing'|'meta'|'hide',  // where it goes in the mobile card (default 'meta')
 *   thClass?, tdClass?,
 * }
 */
export function ResponsiveTable({
  columns,
  data = [],
  rowKey = (r, i) => r._id ?? i,
  loading = false,
  skeletonRows = 4,
  empty = null,
  onRowClick,
  isRowExpanded,
  renderExpanded,
  className,
}) {
  const cell = (col, row) => (col.render ? col.render(row) : row[col.key]);

  if (loading) {
    return (
      <div className={className}>
        {/* desktop skeleton */}
        <div className="hidden md:block overflow-hidden">
          <table className="w-full">
            <tbody>
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-line/40"><td className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* mobile skeleton */}
        <div className="md:hidden p-4 space-y-3">
          {Array.from({ length: skeletonRows }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[var(--radius)]" />)}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return empty;

  const titleCols = columns.filter((c) => c.mobile === 'title');
  const trailingCols = columns.filter((c) => c.mobile === 'trailing');
  const metaCols = columns.filter((c) => !c.mobile || c.mobile === 'meta');

  return (
    <div className={className}>
      {/* ---------- Desktop table ---------- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-content-tertiary border-b border-line/60">
              {columns.map((c) => (
                <th key={c.key} className={cn('px-5 py-3 font-semibold text-[11px] tracking-wider uppercase', c.align === 'right' && 'text-right', c.thClass)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const expanded = isRowExpanded?.(row);
              return (
                <Fragment key={rowKey(row, i)}>
                  <motion.tr
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn('border-b border-line/40 last:border-0 transition-colors', onRowClick && 'cursor-pointer', expanded ? 'bg-overlay/60' : 'hover:bg-overlay/40')}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-5 py-3.5', c.align === 'right' && 'text-right', c.tdClass)}>{cell(c, row)}</td>
                    ))}
                  </motion.tr>
                  {expanded && renderExpanded && (
                    <tr><td colSpan={columns.length} className="p-0 border-b border-line/40"><div className="p-5 bg-overlay/30">{renderExpanded(row)}</div></td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile cards ---------- */}
      <div className="md:hidden p-3 space-y-3">
        {data.map((row, i) => {
          const expanded = isRowExpanded?.(row);
          const clickable = !!onRowClick;
          return (
            <motion.div
              key={rowKey(row, i)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
              onClick={clickable ? () => onRowClick(row) : undefined}
              className={cn('rounded-[var(--radius)] border border-line bg-base/50 p-4', clickable && 'cursor-pointer active:scale-[0.99] transition-transform')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  {clickable && renderExpanded && (expanded ? <ChevronUp className="w-4 h-4 text-content-tertiary shrink-0" /> : <ChevronDown className="w-4 h-4 text-content-tertiary shrink-0" />)}
                  <div className="min-w-0 space-y-0.5">
                    {titleCols.map((c) => <div key={c.key} className="font-semibold text-content truncate">{cell(c, row)}</div>)}
                  </div>
                </div>
                {trailingCols.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {trailingCols.map((c) => <div key={c.key}>{cell(c, row)}</div>)}
                  </div>
                )}
              </div>

              {metaCols.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {metaCols.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary mb-0.5">{c.header}</dt>
                      <dd className="text-sm text-content truncate">{cell(c, row) ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {expanded && renderExpanded && <div className="mt-4 pt-4 border-t border-line/60" onClick={(e) => e.stopPropagation()}>{renderExpanded(row)}</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ResponsiveTable;
