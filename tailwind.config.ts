import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand core — sampled from the deck
        green: {
          brand: '#234539', // wordmark green
          deep: '#0C2419', // near-black green backgrounds
          mid: '#1B5E3B',
        },
        lime: {
          brand: '#CBF512', // deck lime
          dark: '#9FCC00',
        },
        cream: '#F4F3EA',
        // Flavour accents
        gochugaru: {
          primary: '#E8253D',
          deep: '#26060C',
          glow: '#FF5C4D',
        },
        soygarlic: {
          primary: '#E8920C',
          deep: '#1D1104',
          glow: '#FFB347',
        },
        periperi: {
          primary: '#FF4D00',
          deep: '#220D02',
          glow: '#FF8A3D',
        },
        offwhite: '#F5F0E8',
        charcoal: '#111111',
      },
      fontFamily: {
        condensed: ['var(--font-barlow)', 'sans-serif'],
        body: ['var(--font-dm)', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 28s linear infinite',
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
