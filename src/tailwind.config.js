/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',       // App directory
    './pages/**/*.{js,ts,jsx,tsx}',     // Pages directory (if used)
    './components/**/*.{js,ts,jsx,tsx}',// Custom components
    './src/**/*.{js,ts,jsx,tsx}',       // Optional: include src if used
  ],
  theme: {
    extend: {
      colors: {
        // Optional: aliasing your CSS variables to Tailwind
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        destructive: 'hsl(var(--destructive))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),       // Optional: for better form styling
    require('@tailwindcss/typography'),  // Optional: for prose/text content
  ],
}
