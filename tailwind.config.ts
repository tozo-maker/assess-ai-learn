
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
			// Design System Spacing
			spacing: {
				'xs': 'var(--space-xs)',
				'sm': 'var(--space-sm)',
				'md': 'var(--space-md)',
				'lg': 'var(--space-lg)',
				'xl': 'var(--space-xl)',
				'2xl': 'var(--space-2xl)',
				'3xl': 'var(--space-3xl)',
				'4xl': 'var(--space-4xl)',
				'5xl': 'var(--space-5xl)',
			},
			// Design System Typography
			fontSize: {
				'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-xs)' }],
				'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-sm)' }],
				'base': ['var(--text-base)', { lineHeight: 'var(--leading-base)' }],
				'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-lg)' }],
				'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-xl)' }],
				'2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-2xl)' }],
				'3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-3xl)' }],
				'4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-4xl)' }],
				'5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-5xl)' }],
			},
			// Design System Colors
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Semantic colors using CSS variables
				semantic: {
					primary: {
						DEFAULT: 'var(--color-primary)',
						foreground: 'var(--color-primary-foreground)',
						hover: 'var(--color-primary-hover)',
						light: 'var(--color-primary-light)',
					},
					success: {
						DEFAULT: 'var(--color-success)',
						foreground: 'var(--color-success-foreground)',
						hover: 'var(--color-success-hover)',
						light: 'var(--color-success-light)',
					},
					warning: {
						DEFAULT: 'var(--color-warning)',
						foreground: 'var(--color-warning-foreground)',
						hover: 'var(--color-warning-hover)',
						light: 'var(--color-warning-light)',
					},
					danger: {
						DEFAULT: 'var(--color-danger)',
						foreground: 'var(--color-danger-foreground)',
						hover: 'var(--color-danger-hover)',
						light: 'var(--color-danger-light)',
					},
					info: {
						DEFAULT: 'var(--color-info)',
						foreground: 'var(--color-info-foreground)',
						hover: 'var(--color-info-hover)',
						light: 'var(--color-info-light)',
					},
					neutral: {
						DEFAULT: 'var(--color-neutral)',
						foreground: 'var(--color-neutral-foreground)',
						hover: 'var(--color-neutral-hover)',
						light: 'var(--color-neutral-light)',
					},
				}
			},
			borderRadius: {
				xs: 'var(--radius-xs)',
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				full: 'var(--radius-full)',
			},
			boxShadow: {
				xs: 'var(--shadow-xs)',
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
			},
			transitionDuration: {
				fast: 'var(--duration-fast)',
				normal: 'var(--duration-normal)',
				slow: 'var(--duration-slow)',
				slower: 'var(--duration-slower)',
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
