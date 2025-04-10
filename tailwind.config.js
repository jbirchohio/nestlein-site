module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
    './src/pages/**/*.{astro,html}',
    './src/layouts/**/*.{astro,html}',
    './public/scripts/*.js',
  ],
  safelist: [
    'rotate-y-180',
    'perspective',
    'transform-style-preserve-3d',
    'backface-hidden',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
