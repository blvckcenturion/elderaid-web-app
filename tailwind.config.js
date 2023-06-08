/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          'bg-color': '#F3FFF7',
          'text-color': '#0A1A15',
          'accent-color': '#5BBF94',
          'accent-text-color': '#A8E0C1',
          'accent-hover-color': '#2A8663',
          "base":"#FAFFFB",
        }
      },
      keyframes: {
        'radial-gradient': {
          '0%': { 'background-position': '100% 50%' },
          '50%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'radial-gradient': 'radial-gradient 4s linear infinite',
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#5BBF94",
          "secondary": "#2A8663",
          "accent": "#81CFAA",
          "neutral": "#A8E0C1",
          "base-100": "#F3FFF7",
         
          "info": "#123B2C",
          "success": "#14ad94",
          "warning": "#FFB547",
          "error": "#F54242",
        },
      },
    ],
  },
  plugins: [
    require('daisyui')
  ]
}
