import { motion } from 'framer-motion';
import {
  CalendarCheck, CheckCircle2, Clock, Users, FileCheck, Plane, UserCheck,
} from 'lucide-react';

/**
 * Decorative, animated "Employee Management" scene used on Login & Landing.
 * Built from layered glass artifacts (org-chart constellation, leave card,
 * approval ring, attendance pulse, calendar chips). Pure transform/opacity
 * animations for 60fps; respects prefers-reduced-motion via global CSS.
 */

const float = (d = 0, y = 12) => ({
  animate: { y: [0, -y, 0] },
  transition: { duration: 6 + d, repeat: Infinity, ease: 'easeInOut', delay: d },
});

function OrgConstellation() {
  // Connection lines between people nodes (an org chart, abstracted)
  const nodes = [
    { x: 50, y: 18 }, { x: 22, y: 50 }, { x: 78, y: 50 },
    { x: 12, y: 82 }, { x: 38, y: 82 }, { x: 64, y: 82 }, { x: 90, y: 82 },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="var(--accent-primary)" strokeWidth="0.4" strokeOpacity="0.35"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.4, delay: 0.4 + i * 0.15, ease: 'easeOut' }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x} cy={n.y} r={i === 0 ? 2.4 : 1.8}
          fill="var(--accent-primary)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 + i * 0.12 }}
          style={{ transformOrigin: `${n.x}px ${n.y}px` }}
        />
      ))}
    </svg>
  );
}

function FloatingChip({ icon: Icon, label, sub, className, delay = 0, tone = 'accent' }) {
  const toneColor =
    tone === 'success' ? 'var(--success)' :
    tone === 'warning' ? 'var(--warning)' :
    tone === 'info' ? 'var(--info)' : 'var(--accent-primary)';
  return (
    <motion.div
      className={`absolute glass-panel px-3.5 py-2.5 flex items-center gap-2.5 shadow-glass ${className}`}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div {...float(delay, 6)} className="contents">
        <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
             style={{ background: `color-mix(in srgb, ${toneColor} 16%, transparent)`, color: toneColor }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold text-content whitespace-nowrap">{label}</div>
          {sub && <div className="text-[10px] text-content-secondary whitespace-nowrap">{sub}</div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HRArtifactScene() {
  return (
    <div className="relative w-full h-full bg-aurora bg-grid">
      {/* Central org constellation */}
      <motion.div
        {...float(1.5, 14)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-square"
      >
        <OrgConstellation />
      </motion.div>

      {/* Hero glass artifact — a leave request being approved */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64"
      >
        <motion.div {...float(0.8, 10)} className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent font-bold">A</div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-content">Annual Leave</div>
                <div className="text-[11px] text-content-secondary">3 days · Apr 12–14</div>
              </div>
            </div>
            <span className="pill pill-approved"><CheckCircle2 className="w-3 h-3" /> Approved</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-overlay overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent-bright), var(--accent-primary))' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, delay: 1, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-content-secondary">
            <span>Manager review</span>
            <span className="text-accent font-semibold">Done</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Orbiting / floating themed chips */}
      <FloatingChip icon={CalendarCheck} label="14 days left" sub="Leave balance" delay={0.6} tone="accent" className="left-[6%] top-[16%]" />
      <FloatingChip icon={Users} label="248 employees" sub="Active today" delay={0.9} tone="info" className="right-[5%] top-[12%]" />
      <FloatingChip icon={Clock} label="On time" sub="Swipe 09:02" delay={1.1} tone="success" className="left-[4%] bottom-[20%]" />
      <FloatingChip icon={Plane} label="On leave" sub="6 teammates" delay={1.3} tone="warning" className="right-[6%] bottom-[24%]" />
      <FloatingChip icon={FileCheck} label="Payslip ready" sub="March 2026" delay={1.5} tone="accent" className="right-[16%] bottom-[8%]" />
      <FloatingChip icon={UserCheck} label="Onboarded" sub="2 new hires" delay={1.7} tone="info" className="left-[14%] top-[6%]" />

      {/* Pulsing attendance ring bottom-left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute left-[18%] bottom-[34%] w-14 h-14 rounded-full grid place-items-center glass-panel animate-pulse-ring"
      >
        <span className="font-display text-sm font-bold text-accent">96%</span>
      </motion.div>
    </div>
  );
}
