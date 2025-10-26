/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6D28D9', // Roxo vibrante para botões e destaques
        background: '#F7F8FC', // Cinza muito claro para o fundo principal
        sidebar: '#1A202C',   // Cinza escuro para a barra lateral
        card: '#FFFFFF',        // Branco para os cartões
        'text-primary': '#2D3748', // Cinza escuro para texto principal
        'text-secondary': '#A0AEC0', // Cinza mais claro para texto secundário
        'border-color': '#E2E8F0',  // Cinza claro para bordas
      },
    },
  },
  plugins: [],
}
