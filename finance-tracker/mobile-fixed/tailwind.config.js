/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#9b59b6',
        danger: '#e74c3c',
        warning: '#f39c12',
        info: '#1abc9c',
        dark: '#34495e',
        light: '#ecf0f1'
      },
    },
  },
  plugins: [],
}

