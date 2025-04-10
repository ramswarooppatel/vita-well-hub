
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				health: {
					50: '#e6f7f7',
					100: '#ccefef',
					200: '#99dfde',
					300: '#66cfce',
					400: '#33bfbd',
					500: '#00afad', // Primary health color
					600: '#008c8b',
					700: '#006968',
					800: '#004646',
					900: '#002323',
					DEFAULT: 'hsl(var(--health))',
					foreground: 'hsl(var(--health-foreground))',
				},
				wellness: {
					50: '#ebf8f2',
					100: '#d7f1e5',
					200: '#afe3cb',
					300: '#87d6b1',
					400: '#5fc897',
					500: '#37ba7d', // Wellness color
					600: '#2c9564',
					700: '#21704b',
					800: '#164a32',
					900: '#0b2519',
					DEFAULT: 'hsl(var(--wellness))',
					foreground: 'hsl(var(--wellness-foreground))',
				},
				urgent: {
					50: '#fdf4f4',
					100: '#fbe9e9',
					200: '#f7d3d3',
					300: '#f3bdbd',
					400: '#efa7a7',
					500: '#eb9191', // Urgent color
					600: '#bc7474',
					700: '#8d5757',
					800: '#5e3a3a',
					900: '#2f1d1d',
					DEFAULT: 'hsl(var(--urgent))',
					foreground: 'hsl(var(--urgent-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite',
				'float': 'float 6s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
