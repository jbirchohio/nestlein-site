module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
    './src/pages/**/*.{astro,html}',
    './src/layouts/**/*.{astro,html}'
  ],
  theme: {
    extend: {},
  },
 plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
],
}
