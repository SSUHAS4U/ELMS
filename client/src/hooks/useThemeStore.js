import { create } from 'zustand';

// Detect system preference
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

// Load from localStorage, fallback to system preference
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('elms-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return getSystemTheme();
};

const initialTheme = getInitialTheme();
// Apply immediately so there's no flash
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (newTheme) => set((state) => {
    let targetTheme = newTheme;
    if (newTheme === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
    if (newTheme === 'system') {
      localStorage.removeItem('elms-theme');
    } else {
      localStorage.setItem('elms-theme', newTheme);
    }
    return { theme: newTheme };
  }),
  toggle: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('elms-theme', next);
    return { theme: next };
  }),
}));

export default useThemeStore;
