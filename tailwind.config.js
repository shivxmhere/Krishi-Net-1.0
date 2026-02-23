/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"DM Sans"', 'sans-serif'],
                display: ['"Playfair Display"', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                // "Living Fields" Palette
                harvest: {
                    green: '#1a6b3c',
                    leaf: '#2d9e5f',
                    sprout: '#4ade80',
                    pale: '#bbf7d0',
                },
                earth: {
                    golden: '#f59e0b',
                    amber: '#d97706',
                    soil: '#78350f',
                    clay: '#c2410c',
                    deep: '#0a1a0f',
                    canopy: '#0f2419',
                },
                sky: {
                    morning: '#0ea5e9',
                    dusk: '#7c3aed',
                    mist: '#f0fdf4',
                },
                glass: {
                    bg: 'rgba(15, 36, 25, 0.6)',
                    border: 'rgba(74, 222, 128, 0.2)',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'float': 'float 8s ease-in-out infinite',
                'sway': 'sway 4s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'scan': 'scan 2s linear infinite',
                'text-shimmer': 'shimmer 3s linear infinite',
                'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                sway: {
                    '0%, 100%': { transform: 'rotate(-4deg)' },
                    '50%': { transform: 'rotate(4deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' },
                    '50%': { opacity: '0.5', boxShadow: '0 0 10px rgba(74, 222, 128, 0.2)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scan: {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                pulseSlow: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '.95', transform: 'scale(1.05)' },
                }
            }
        },
    },
    plugins: [],
}
