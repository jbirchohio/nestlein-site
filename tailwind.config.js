/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
    "./public/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        tag: {
          default: '#fee2e2',        // Light red
          coffee: '#fde68a',         // Light yellow
          quiet: '#d1fae5',          // Light green
          vegan: '#fbcfe8',          // Light pink
          study: '#ddd6fe',          // Light purple
          family: '#bfdbfe',         // Light blue
          casual: '#fef3c7',         // Light amber
          group: '#fcd34d',          // Bright yellow
        }
      }
    }
  },
  safelist: [
    'rotate-y-180',
    'perspective',
    'transform-style-preserve-3d',
    'backface-hidden',
    'bg-tag-default',
    'bg-tag-coffee',
    'bg-tag-quiet',
    'bg-tag-vegan',
    'bg-tag-study',
    'bg-tag-family',
    'bg-tag-casual',
    'bg-tag-group',
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ]
}
