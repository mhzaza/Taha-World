/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#00b3ff',
          600: '#0099e6',
          700: '#0080cc',
          800: '#0066b3',
          900: '#004d99',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'hero': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'subtitle': ['1.25rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'blob': 'blob 7s infinite',
      },
      animationDelay: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
        '4000': '4000ms',
      },
      keyframes: {
         fadeIn: {
           '0%': { opacity: '0' },
           '100%': { opacity: '1' },
         },
         fadeInUp: {
           '0%': { opacity: '0', transform: 'translateY(30px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
         },
         scaleIn: {
           '0%': { opacity: '0', transform: 'scale(0.9)' },
           '100%': { opacity: '1', transform: 'scale(1)' },
         },
         slideUp: {
           '0%': { transform: 'translateY(20px)', opacity: '0' },
           '100%': { transform: 'translateY(0)', opacity: '1' },
         },
         blob: {
           '0%': { transform: 'translate(0px, 0px) scale(1)' },
           '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
           '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
           '100%': { transform: 'translate(0px, 0px) scale(1)' },
         },
         shimmer: {
           '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(0, 179, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 179, 255, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      gradientColorStops: {
        'primary-gradient': 'var(--gradient-primary)',
        'hero-gradient': 'var(--gradient-hero)',
      },
    },
  },
  plugins: [
    // Animation delay plugin
    function({ addUtilities, theme }) {
      const delays = theme('animationDelay');
      const delayUtilities = Object.keys(delays).reduce((acc, key) => {
        acc[`.animation-delay-${key}`] = {
          'animation-delay': delays[key],
        };
        return acc;
      }, {});
      addUtilities(delayUtilities);
    },
    // RTL support plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        '.float-start': {
          float: 'inline-start',
        },
        '.float-end': {
          float: 'inline-end',
        },
        '.border-start': {
          'border-inline-start-width': '1px',
        },
        '.border-end': {
          'border-inline-end-width': '1px',
        },
        '.rounded-start': {
          'border-start-start-radius': '0.375rem',
          'border-end-start-radius': '0.375rem',
        },
        '.rounded-end': {
          'border-start-end-radius': '0.375rem',
          'border-end-end-radius': '0.375rem',
        },
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        '.ms-4': {
          'margin-inline-start': '1rem',
        },
        '.me-4': {
          'margin-inline-end': '1rem',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}