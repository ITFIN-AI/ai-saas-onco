module.exports = {
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '380px',
      },
    },
  },
  variants: {
    extend: {
      textOverflow: ['hover', 'focus'],
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
