/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        nihon: {
          bg: '#0C0C14',
          surface: '#14141F',
          card: '#1A1A28',
          border: '#2A2A3C',
          accent: '#E8453C',
          'accent-soft': 'rgba(232,69,60,0.12)',
          'accent-glow': 'rgba(232,69,60,0.25)',
          text: '#F0EDE6',
          'text-soft': '#9A9AAF',
          'text-muted': '#5E5E74',
          romaji: '#6EC8E4',
          kana: '#D4A5E8',
          kanji: '#FFD073',
          french: '#82D9A5',
        },
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        jp: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(232,69,60,0.2)' },
          '100%': { boxShadow: '0 0 24px rgba(232,69,60,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
