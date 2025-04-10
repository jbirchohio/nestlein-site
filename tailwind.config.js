module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
    './src/pages/**/*.{astro,html}',
    './src/layouts/**/*.{astro,html}'
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
