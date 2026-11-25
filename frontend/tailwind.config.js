
/** @type {import('tailwindcss').Config} */
// Brand: espresso / linen / brass.
// slate + gray are remapped to the warm neutral ramp, indigo + blue to brass,
// so every page inherits the palette without per-file edits.
const ink = {
  50: '#FAF6EF',
  100: '#F3ECE0',
  200: '#E6DBC9',
  300: '#D2C2AA',
  400: '#B3A087',
  500: '#978469',
  600: '#6E5C48',
  700: '#524536',
  800: '#352B22',
  900: '#211A14',
  950: '#14100C',
}

const brass = {
  50: '#FBF4E6',
  100: '#F5E6C8',
  200: '#EBCE99',
  300: '#DFB066',
  400: '#CE9139',
  500: '#B4762A',
  600: '#8F5A1D',
  700: '#6F4618',
  800: '#523414',
  900: '#39240F',
  950: '#23160A',
}

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: brass,
        ink,
        brass,
        slate: ink,
        gray: ink,
        indigo: brass,
        blue: brass,
      },
      fontFamily: {
        sans: ['Karla', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
      },
      // Editorial edges: small radii everywhere, pills keep rounded-full.
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '3px',
        lg: '4px',
        xl: '5px',
        '2xl': '6px',
        '3xl': '10px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(28,22,17,0.06)',
        DEFAULT: '0 1px 3px rgba(28,22,17,0.08)',
        md: '0 8px 20px -12px rgba(28,22,17,0.35)',
        lg: '0 18px 40px -24px rgba(28,22,17,0.5)',
        xl: '0 24px 60px -32px rgba(28,22,17,0.55)',
        '2xl': '0 32px 80px -40px rgba(28,22,17,0.6)',
      },
    },
  },
  plugins: [],
}
