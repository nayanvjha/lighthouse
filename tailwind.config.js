/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'space-black': '#050510',
        'accent-blue': '#00A3FF',
        'stark-gold': '#FFD700',
        'portal-green': '#39FF14',
        'nebula-purple': '#7B2FBE',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 163, 255, 0.45)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 163, 255, 0.8)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'data-stream': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 120px' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        'data-stream': 'data-stream 6s linear infinite',
      },
    },
  },
  plugins: [],
}