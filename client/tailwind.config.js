/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-orange': '#FF6B35',
        'claude-dark': '#1E1E1E',
        'claude-light': '#F8F8F8',
        'thinking': '#6B7280',
        'user-bg': '#F3F4F6',
        'assistant-bg': '#FFFFFF',
      },
      animation: {
        'pulse-slow': 'pulse 2s infinite',
        'typing': 'typing 1.5s infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}