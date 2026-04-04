import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C4673A',
          light: '#D4845A',
          dark: '#A3532E',
        },
        sage: {
          DEFAULT: '#5B7A5E',
          light: '#7A9E7D',
          dark: '#3E5740',
        },
        sand: {
          DEFAULT: '#B89F78',
          light: '#D4BFA0',
          dark: '#8C7554',
        },
        habitat: {
          offwhite: '#F8F7F4',
          warm: '#F5F0E8',
          dark: '#111110',
          'dark-2': '#1A1A18',
          'muted': '#6B6B60',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
