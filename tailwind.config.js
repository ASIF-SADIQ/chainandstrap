/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-tertiary': '#1a1a1a',
        'gold': '#c9a96e',
        'gold-light': '#e8c98a',
        'text-primary': '#ffffff',
        'text-secondary': '#aaaaaa',
        'text-muted': '#666666',
        'border-color': '#222222',
        brand: {
          gucci: '#c8a951',
          lv: '#f0b90b',
          prada: '#ffffff',
          chanel: '#c9a96e',
          balenciaga: '#ff3300',
          dior: '#a8b5a0',
          default: '#c9a96e',
        }
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        luxury: '0.4em',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
};
