# Directive: Build Premium MERN ELMS — "Obsidian & Emerald" Edition v2

## Vision
A production-ready Employee Leave Management System that feels like a AAA SaaS product — not a template. Every surface should feel alive: particles drift, cards tilt with the cursor, buttons have magnetic pull, charts animate on scroll, and the entire system shifts between a deep obsidian dark mode and a crisp off-white light mode with zero visual compromise.

---

## Architecture & Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Component System | Shadcn/UI (Radix primitives) |
| Theme Engine | `vite-plugin-theme` + CSS variable switching (NOT next-themes — wrong ecosystem) |

### Animation & Motion
| Purpose | Library |
|---|---|
| Page/component transitions | Framer Motion v11 |
| Scroll-triggered animations | GSAP v3 + ScrollTrigger plugin |
| Physics / anti-gravity | `@react-spring/web` + `use-gesture` |
| Magnetic buttons / cursor | Framer Motion `useMotionValue` + `useSpring` |
| Tilt cards | `react-parallax-tilt` |
| Particle background | `tsParticles` / `@tsparticles/react` |

### 3D & Canvas
| Purpose | Library |
|---|---|
| 3D scene | `@react-three/fiber` + `@react-three/drei` |
| Postprocessing FX | `@react-three/postprocessing` (Bloom, ChromaticAberration) |
| 3D text/floating icons | `drei` Text + Float components |
| Shader effects | Custom GLSL via `@react-three/fiber` shaderMaterial |

### Charts & Data Visualization
| Purpose | Library |
|---|---|
| Line/bar/area charts | `recharts` |
| Animated donut/pie | `recharts` PieChart with custom label |
| Heatmap calendar | `react-calendar-heatmap` |
| Gauge / radial progress | `react-circular-progressbar` |
| Sparklines | `recharts` mini LineChart |
| Animated counters | `react-countup` + Intersection Observer |

### UI Extras
| Purpose | Library |
|---|---|
| Command palette | `cmdk` |
| Date picker | `react-day-picker` v8 |
| Toast notifications | `sonner` |
| Table | `@tanstack/react-table` v8 |
| Icons | `lucide-react` |
| PDF export | `jspdf` + `html2canvas` |
| Drag & drop | `@dnd-kit/core` |

### Backend
- Node.js 20, Express 5, Mongoose 8, Socket.io 4
- Nodemailer + `handlebars` HTML email templates
- JWT auth + RBAC middleware (Employee / Manager / Admin)
- Rate limiting: `express-rate-limit`
- Validation: `zod`

### DevOps
- Docker + Docker Compose
- GitHub Actions CI/CD
- `.env.example` only — never hardcode secrets

---

## Color System (Non-Negotiable)

```css
/* DARK MODE — Obsidian */
--bg-base:        #0A0A0B;   /* near-black canvas */
--bg-surface:     #111114;   /* card surfaces */
--bg-elevated:    #1A1A1F;   /* modals, dropdowns */
--bg-overlay:     #22222A;   /* hover states */
--accent-primary: #00FF87;   /* neon emerald — primary CTA */
--accent-glow:    #00FF8730; /* emerald glow/shadow */
--accent-muted:   #00C96B;   /* secondary emerald */
--text-primary:   #F0F0F5;
--text-secondary: #8888A0;
--border-subtle:  #2A2A35;
--danger:         #FF4466;
--warning:        #FFAA00;
--info:           #7B61FF;   /* violet — replaces any blue */

/* LIGHT MODE — Alabaster */
--bg-base:        #F5F5F2;
--bg-surface:     #FFFFFF;
--bg-elevated:    #FAFAF8;
--accent-primary: #008A4A;   /* darker emerald for contrast */
--accent-glow:    #008A4A20;
--text-primary:   #0A0A0B;
--text-secondary: #55556A;
--border-subtle:  #E2E2E8;
```

---

## Step-by-Step Execution

### Step 1: Project Scaffolding
1. Init monorepo: `/client` (Vite React) and `/server` (Node).
2. Root `package.json` with `concurrently` for dev.
3. Create `.env.example` for both.
4. **STOP → Ask user for actual `.env` values before proceeding.**

---

### Step 2: Backend — Models, Routes, Real-time

**Models:**
- `User`: `{ name, email, passwordHash, role: enum[employee,manager,admin], department, avatar, leaveBalance: { annual, sick, casual } }`
- `LeaveRequest`: `{ employeeId, type, startDate, endDate, reason, status: enum[pending,approved,rejected], approvedBy, createdAt }`

**Routes:**
- `POST /api/auth/register|login|logout`
- `GET/POST /api/leaves` — employee create, list own
- `GET /api/leaves/all` — admin/manager see all (RBAC guarded)
- `PATCH /api/leaves/:id/status` — approve/reject
- `GET /api/analytics/summary` — leave stats by department, type, month
- `GET /api/users/me` — profile + leave balance

**Socket.io Events:**
- `newLeaveRequest` → notify managers
- `leaveStatusChanged` → notify employee
- `onlineUsers` → presence indicator

**Email Templates (Handlebars):**
- `leave-submitted.hbs` — confirmation to employee (dark-styled HTML)
- `leave-action-required.hbs` — alert to manager
- `leave-approved.hbs` / `leave-rejected.hbs` — status updates

---

### Step 3: Frontend Foundation

**Folder structure:**
```
/client/src
  /components
    /ui          ← shadcn components
    /3d          ← Three.js scenes
    /charts      ← recharts wrappers
    /motion      ← reusable animated wrappers
  /pages
    Dashboard, Leaves, Calendar, Analytics, Settings, Profile
  /hooks
    useSocket, useTheme, useLeaves, useAnimatedCounter, useMagneticRef
  /lib
    api.js, socket.js, utils.js, cn.js
  /styles
    globals.css   ← CSS variables for both themes
```

**Theme setup (Vite, NOT next-themes):**
```js
// themeStore.js (Zustand)
const useThemeStore = create(set => ({
  theme: 'dark',
  toggle: () => set(s => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  })
}));
```
`tailwind.config.js` uses `darkMode: ['attribute', '[data-theme="dark"]']`.

---

### Step 4: Anti-Gravity & Physics UI

#### 4.1 Magnetic Buttons
Every primary CTA uses a `useMagneticRef` hook:
```js
// hooks/useMagneticRef.js
// On mouse move near the button, use Framer Motion useSpring to
// translate x/y toward the cursor — creates magnetic pull effect.
// On mouse leave, springs back to origin.
```

#### 4.2 Anti-Gravity Floating Cards
Use `@react-spring/web` + `use-gesture` for drag:
- Leave request cards float with `useSpring` for idle bobbing animation
- On drag: card follows cursor with physics (mass, tension, friction)
- On release: card snaps back with spring overshoot

#### 4.3 Tilt Cards (Parallax depth)
Wrap every dashboard bento card with `react-parallax-tilt`:
```jsx
<Tilt tiltMaxAngleDeg={8} glareEnable={true} glareMaxOpacity={0.08}
      glareColor="#00FF87" perspective={1200}>
  <BentoCard>...</BentoCard>
</Tilt>
```

#### 4.4 Particle Background
```jsx
// tsParticles with emerald color, slow drift, mouse repulsion
// Particles: small dots + occasional geometric wireframe shapes
// On dark mode: #00FF87 at 15% opacity
// On light mode: #008A4A at 8% opacity
```

---

### Step 5: 3D Interactive Canvas

Place a `<Canvas>` (pointer-events: none) as a fixed background layer:
- **FloatingGeometry**: 3–5 slowly rotating `IcosahedronGeometry` + `TorusKnotGeometry` with `MeshTransmissionMaterial` (glass/crystal shader from drei)
- **MouseParallax**: Geometries shift position based on normalized mouse coordinates using `useFrame`
- **Bloom postprocessing**: Subtle bloom on emerald emissive surfaces via `@react-three/postprocessing`
- **Performance**: Use `<PerformanceMonitor>` from drei — auto-downgrade quality on low-end devices

---

### Step 6: Dashboard — Bento Layout

```
┌─────────────────┬──────────┬──────────┐
│ Welcome + stats │  Leave   │  Quick   │
│ (animated count)│ Balance  │  Apply   │
│                 │ (gauge)  │ (modal)  │
├────────┬────────┴──────────┤          │
│ Chart  │  Recent Requests  ├──────────┤
│ (area) │  (tanstack table) │ Calendar │
│        │                   │ (mini)   │
├────────┴───────────────────┴──────────┤
│        Department Analytics (bar)      │
└───────────────────────────────────────┘
```

All cells: `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`

---

### Step 7: Charts & Analytics Page

Build a dedicated `/analytics` page with:

1. **Leave Trends** — Recharts `<AreaChart>` with gradient fill (emerald → transparent), animated on mount
2. **Leave by Type** — Recharts `<PieChart>` with custom animated labels + legend
3. **Department Heatmap** — `react-calendar-heatmap` styled with CSS variable overrides
4. **Approval Rate** — `react-circular-progressbar` radial gauge
5. **Monthly Bar Chart** — Recharts `<BarChart>` with rounded bars (custom shape)
6. **Top Leavers** — Horizontal bar with avatar + animated fill

All charts: no default borders, use `--accent-primary` palette, animate via `isAnimationActive={true}`.

---

### Step 8: Button Catalog

Build a `<Button>` component with these variants:

| Variant | Effect |
|---|---|
| `magnetic` | Pulls toward cursor on hover (Framer Motion spring) |
| `shimmer` | CSS gradient sweeps across on hover |
| `glow` | Box shadow pulses with emerald glow on hover |
| `liquid` | SVG blob morphs on click (GSAP morphSVG) |
| `ripple` | Material-style radial ripple on click |
| `pill` | Fully rounded, filled/outline |
| `ghost` | Transparent with border, fills on hover |
| `icon-float` | Icon floats upward 3px on hover (transform) |
| `destructive` | Red variant with shake animation on confirm |

---

### Step 9: Micro-Interactions Checklist

- [ ] Page transitions: Framer Motion `<AnimatePresence>` with slide+fade
- [ ] Skeleton loaders on all data-fetching states (pulse animation)
- [ ] Table rows: stagger-animate in on load (GSAP `stagger`)
- [ ] Number counters: animate from 0 on scroll (`react-countup`)
- [ ] Toast notifications: `sonner` styled to match theme
- [ ] Empty states: custom illustrated SVG + subtle bounce
- [ ] Form fields: label floats up on focus (CSS transition)
- [ ] Status badges: color-coded pills with pulsing dot for "pending"
- [ ] Avatar: ring glows emerald when user is online (Socket.io presence)
- [ ] Sidebar: collapses with smooth width transition, icons tooltip on collapse

---

### Step 10: Calendar View

Replace `@fullcalendar` (too heavy, hard to style) with a **custom-built calendar** using:
- `react-day-picker` v8 for base date logic
- Custom monthly grid rendered with `date-fns`
- Leave events as colored pills overlaid on date cells
- Colors: `pending` = amber, `approved` = emerald, `rejected` = red
- Hover on a date shows a popover (`@radix-ui/react-popover`) with leave details

---

### Step 11: Command Palette (Cmd+K)

Using `cmdk`:
- Groups: Navigation, Actions, Recent Leaves, Team
- Commands: "Apply for leave", "View my history", "Go to analytics", "Export PDF", "Toggle theme"
- Styled: dark glass modal, emerald highlight on selected item, fuzzy search

---

### Step 12: DevOps

Generate:
- `/client/Dockerfile` — multi-stage: build → nginx:alpine
- `/server/Dockerfile` — node:20-alpine, non-root user
- `docker-compose.yml` — client + server + MongoDB services, named volumes
- `.github/workflows/deploy.yml` — lint → test → build → push to GHCR → SSH deploy

---

## Constraints
1. **Never hardcode secrets** — always `.env.example` + prompt user.
2. **No blue anywhere** — violet (`#7B61FF`) is the only cool accent allowed besides emerald.
3. **No `next-themes`** — use Zustand + `data-theme` attribute instead.
4. **Self-heal on errors** — read stack trace, fix version conflicts, retry.
5. **Performance budget** — Lighthouse score target ≥ 85 on mobile.
6. **Accessibility** — all interactive elements keyboard-navigable, ARIA labels on icon buttons.