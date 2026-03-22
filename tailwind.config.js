/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace']
      },
      colors: {
        obsidian: {
          50: '#f0f0f5',
          100: '#dddde8',
          200: '#bbbbd4',
          300: '#9898bf',
          400: '#7676aa',
          500: '#545495',
          600: '#424280',
          700: '#30306b',
          800: '#1e1e56',
          900: '#0c0c41',
          950: '#06060d'
        },
        neon: {
          cyan: '#00f5ff',
          green: '#00ff94',
          purple: '#bf00ff',
          pink: '#ff00a8'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'typing': 'typing 1.2s steps(3) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        },
        glow: {
          'from': { textShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff' },
          'to': { textShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff, 0 0 80px #00f5ff' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
