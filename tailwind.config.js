/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'liquid-container': {
          '0%, 100%': { 
            transform: 'scale(1) translateY(0)',
            opacity: 0.8,
            borderColor: 'rgba(255, 255, 255, 0.1)'
          },
          '50%': { 
            transform: 'scale(1.02) translateY(-2px)',
            opacity: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          },
        },
        'liquid-ring': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          },
        },
        'inner-glow': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
        'icon-float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.05)' },
        },
        'icon-reflection': {
          '0%, 100%': { opacity: 0.1 },
          '50%': { opacity: 0.3 },
        },
        'text-container': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            opacity: 0.6 
          },
          '50%': { 
            transform: 'translateY(-1px)',
            opacity: 0.8 
          },
        },
        'cursor-blink': {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 },
        },
        'liquid-dot-1': {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 0.6 
          },
          '25%': { 
            transform: 'translateY(-12px) scale(1.2)',
            opacity: 1 
          },
          '50%': { 
            transform: 'translateY(-6px) scale(1.1)',
            opacity: 0.8 
          },
          '75%': { 
            transform: 'translateY(-3px) scale(1.05)',
            opacity: 0.9 
          },
        },
        'liquid-dot-2': {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 0.6 
          },
          '33%': { 
            transform: 'translateY(-15px) scale(1.3)',
            opacity: 1 
          },
          '66%': { 
            transform: 'translateY(-8px) scale(1.15)',
            opacity: 0.8 
          },
        },
        'liquid-dot-3': {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 0.6 
          },
          '40%': { 
            transform: 'translateY(-10px) scale(1.25)',
            opacity: 1 
          },
          '80%': { 
            transform: 'translateY(-5px) scale(1.1)',
            opacity: 0.9 
          },
        },
        'accent-dot-1': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.6 
          },
          '50%': { 
            transform: 'translate(2px, -4px) scale(1.2)',
            opacity: 1 
          },
        },
        'accent-dot-2': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.4 
          },
          '60%': { 
            transform: 'translate(-2px, 3px) scale(1.1)',
            opacity: 0.8 
          },
        },
        'accent-dot-3': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.5 
          },
          '70%': { 
            transform: 'translate(-3px, -2px) scale(1.15)',
            opacity: 0.9 
          },
        },
        'liquid-ring-subtle': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          },
        },
        'inner-glow-subtle': {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.4 },
        },
        'icon-float-subtle': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-3px) scale(1.02)' },
        },
        'icon-reflection-subtle': {
          '0%, 100%': { opacity: 0.05 },
          '50%': { opacity: 0.15 },
        },
        'accent-dot-subtle-1': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.3 
          },
          '50%': { 
            transform: 'translate(1px, -2px) scale(1.1)',
            opacity: 0.6 
          },
        },
        'accent-dot-subtle-2': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.2 
          },
          '60%': { 
            transform: 'translate(-1px, 1px) scale(1.05)',
            opacity: 0.5 
          },
        },
        'accent-dot-subtle-3': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.25 
          },
          '70%': { 
            transform: 'translate(-1px, -1px) scale(1.08)',
            opacity: 0.55 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'liquid-container': 'liquid-container 4s ease-in-out infinite',
        'liquid-ring': 'liquid-ring 3s ease-in-out infinite',
        'inner-glow': 'inner-glow 2s ease-in-out infinite',
        'icon-float': 'icon-float 3s ease-in-out infinite',
        'icon-reflection': 'icon-reflection 2s ease-in-out infinite',
        'text-container': 'text-container 2.5s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'liquid-dot-1': 'liquid-dot-1 1.5s ease-in-out infinite',
        'liquid-dot-2': 'liquid-dot-2 1.8s ease-in-out infinite 0.2s',
        'liquid-dot-3': 'liquid-dot-3 1.6s ease-in-out infinite 0.4s',
        'accent-dot-1': 'accent-dot-1 2.2s ease-in-out infinite',
        'accent-dot-2': 'accent-dot-2 2.8s ease-in-out infinite 0.5s',
        'accent-dot-3': 'accent-dot-3 2.5s ease-in-out infinite 1s',
        'liquid-ring-subtle': 'liquid-ring-subtle 4s ease-in-out infinite',
        'inner-glow-subtle': 'inner-glow-subtle 3s ease-in-out infinite',
        'icon-float-subtle': 'icon-float-subtle 4s ease-in-out infinite',
        'icon-reflection-subtle': 'icon-reflection-subtle 3s ease-in-out infinite',
        'accent-dot-subtle-1': 'accent-dot-subtle-1 3s ease-in-out infinite',
        'accent-dot-subtle-2': 'accent-dot-subtle-2 3.5s ease-in-out infinite 0.5s',
        'accent-dot-subtle-3': 'accent-dot-subtle-3 3.2s ease-in-out infinite 1s',
      },
    },
  },
  plugins: [],
}