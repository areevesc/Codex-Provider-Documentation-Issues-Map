import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft Obsidian-ish palette used across nodes and panels.
        surface: {
          DEFAULT: '#0f1115',
          raised: '#161a22',
          panel: '#1c2230',
          subtle: '#232a3a',
        },
        line: '#2a3245',
        ink: {
          DEFAULT: '#e6ecf5',
          muted: '#8b96ad',
          faint: '#55607a',
        },
        accent: {
          specialist: '#a78bfa', // purple
          clinic: '#60a5fa',     // blue
          provider: '#34d399',   // green
          label: '#fbbf24',      // amber
        },
        status: {
          active: '#f87171',
          improving: '#fbbf24',
          resolved: '#34d399',
          archived: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
