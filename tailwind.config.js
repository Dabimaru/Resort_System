/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        resort: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        sand: '#f2efe8',
        sunset: '#d98c5f',
        deep: '#0e1726',
        // Semantic color aliases for consistent theming
        surface: {
          DEFAULT: '#020617',
          elevated: '#0e1726',
          overlay: '#161b2d',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.2)',
          focus: '#06b6d4',
          error: '#ef4444',
          success: '#22c55e',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
          inverse: '#020617',
          link: '#22d3ee',
        },
        state: {
          error: '#ef4444',
          errorBg: 'rgba(239, 68, 68, 0.1)',
          errorBorder: 'rgba(239, 68, 68, 0.3)',
          success: '#22c55e',
          successBg: 'rgba(34, 197, 94, 0.1)',
          successBorder: 'rgba(34, 197, 94, 0.3)',
          warning: '#f59e0b',
          warningBg: 'rgba(245, 158, 11, 0.1)',
          warningBorder: 'rgba(245, 158, 11, 0.3)',
          info: '#06b6d4',
          infoBg: 'rgba(6, 182, 212, 0.1)',
          infoBorder: 'rgba(6, 182, 212, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.35' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '32': '8rem',     // 128px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        'full': '9999px',
      },
      boxShadow: {
        'glow': '0 20px 60px rgba(14, 23, 38, 0.18)',
        'glow-sm': '0 8px 24px rgba(14, 23, 38, 0.12)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'elevation-4': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'focus': '0 0 0 3px rgba(6, 182, 212, 0.4)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(14,23,38,0.72), rgba(14,23,38,0.28))',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'mesh-gradient': 'radial-gradient(ellipse at top right, rgba(6,182,212,0.15), transparent 50%), radial-gradient(ellipse at bottom left, rgba(217,140,95,0.1), transparent 50%)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'modal': '300',
        'popover': '400',
        'tooltip': '500',
        'toast': '600',
      },
    },
  },
  plugins: [],
};