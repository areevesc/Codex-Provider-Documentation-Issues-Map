import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft Obsidian-ish palette used across nodes and panels.
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          panel: 'rgb(var(--color-surface-panel) / <alpha-value>)',
          subtle: 'rgb(var(--color-surface-subtle) / <alpha-value>)',
        },
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        accent: {
          specialist: 'rgb(var(--color-accent-specialist) / <alpha-value>)',
          clinic: 'rgb(var(--color-accent-clinic) / <alpha-value>)',
          provider: 'rgb(var(--color-accent-provider) / <alpha-value>)',
          label: 'rgb(var(--color-accent-label) / <alpha-value>)',
        },
        status: {
          active: 'rgb(var(--color-status-active) / <alpha-value>)',
          improving: 'rgb(var(--color-status-improving) / <alpha-value>)',
          resolved: 'rgb(var(--color-status-resolved) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
