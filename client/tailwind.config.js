/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base:     'var(--bg-base)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay:  'var(--bg-overlay)',
        accent: {
          DEFAULT:  'var(--accent-primary)',
          muted:    'var(--accent-muted)',
          bright:   'var(--accent-bright)',
          contrast: 'var(--accent-contrast)',
        },
        content: {
          DEFAULT:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
        },
        line: {
          DEFAULT: 'var(--border-subtle)',
          strong:  'var(--border-strong)',
        },
        danger:  'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        info:    'var(--info)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:  'var(--radius-sm)',
        lg:  'var(--radius-lg)',
        xl:  '1.5rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        glass:  'var(--glass-shadow)',
        glow:   '0 0 24px -4px var(--accent-glow)',
        'glow-lg': '0 0 50px -8px var(--accent-glow)',
        'inner-top': 'inset 0 1px 0 0 var(--glass-highlight)',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        'float-y':      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'float-y-slow': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        'fade-up':      { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring':   { '0%': { boxShadow: '0 0 0 0 var(--accent-glow)' }, '70%': { boxShadow: '0 0 0 12px transparent' }, '100%': { boxShadow: '0 0 0 0 transparent' } },
        'spin-slow':    { to: { transform: 'rotate(360deg)' } },
        shimmer:        { '0%': { backgroundPosition: '100% 0' }, '100%': { backgroundPosition: '-100% 0' } },
      },
      animation: {
        'float':      'float-y 6s ease-in-out infinite',
        'float-slow': 'float-y-slow 9s ease-in-out infinite',
        'fade-up':    'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        'spin-slow':  'spin-slow 14s linear infinite',
        'shimmer':    'shimmer 1.4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22,1,0.36,1)',
      },
      maxWidth: { '8xl': '88rem' },
    },
  },
  plugins: [],
}
