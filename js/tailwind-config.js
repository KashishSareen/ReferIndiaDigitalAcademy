// Tailwind CSS settings (loaded on every page right after the Tailwind CDN script).
// Change the brand colours here and they update across the whole website.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FB',
          100: '#DCE4F6',
          200: '#B9C8EC',
          300: '#8EA5DE',
          400: '#5F7DCB',
          500: '#3D5AB4',
          600: '#2D4596',
          700: '#25387A',
          800: '#1F2F63',
          900: '#1B2852',
          950: '#0F1836',
        },
        accent: {
          50: '#FFF6EC',
          100: '#FFE9D1',
          200: '#FFD0A1',
          300: '#FFB066',
          400: '#FD9A3D',
          500: '#F7861C',
          600: '#DB6A0B',
          700: '#B5520C',
          800: '#8F4111',
          900: '#753711',
          950: '#3F1A05',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 24, 54, 0.04), 0 8px 24px -8px rgba(15, 24, 54, 0.10)',
        lift: '0 2px 4px rgba(15, 24, 54, 0.04), 0 24px 48px -16px rgba(15, 24, 54, 0.18)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
    },
  },
};
