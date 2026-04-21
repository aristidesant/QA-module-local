import { createTheme } from '@mantine/core';

export const theme = createTheme({
	/* Brand */
	primaryColor: 'green',
	primaryShade: { light: 5, dark: 4 },
	defaultRadius: 'md',

	/* Typography */
	fontFamily:
		"'DM Sans', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
	fontFamilyMonospace:
		"'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",

	headings: {
		fontFamily:
			"'DM Sans', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
		fontWeight: '700',
		sizes: {
			h1: { fontSize: '2rem', lineHeight: '1.1' },
			h2: { fontSize: '1.5rem', lineHeight: '1.2' },
			h3: { fontSize: '1.25rem', lineHeight: '1.3' },
			h4: { fontSize: '1.125rem', lineHeight: '1.35' },
			h5: { fontSize: '1rem', lineHeight: '1.4' },
			h6: { fontSize: '0.875rem', lineHeight: '1.45' },
		},
	},

	fontSizes: {
		xs: '0.75rem', // 12px
		sm: '0.8125rem', // 13px
		md: '0.9375rem', // 15px
		lg: '1rem', // 16px
		xl: '1.125rem', // 18px
	},

	lineHeights: {
		xs: '1.4',
		sm: '1.45',
		md: '1.5',
		lg: '1.55',
		xl: '1.6',
	},

	/* Radius — design system scale */
	radius: {
		xs: '4px',
		sm: '6px',
		md: '8px',
		lg: '12px',
		xl: '16px',
	},

	/* Shadows — design system scale */
	shadows: {
		xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
		sm: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
		md: '0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)',
		lg: '0 12px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)',
		xl: '0 24px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.06)',
	},

	/* Colors — mapped from design system tokens */
	colors: {
		green: [
			'#ecfdf2', // 0  – 50
			'#d1fae0', // 1  – 100
			'#a4f0c0', // 2  – 200
			'#6ee29a', // 3  – 300
			'#3ccd77', // 4  – 400
			'#1bb54a', // 5  – 500  (PRIMARY)
			'#11933b', // 6  – 600
			'#0d7530', // 7  – 700
			'#0c5d29', // 8  – 800
			'#0a4a22', // 9  – 900
		],
		blue: [
			'#ecf8fd', // 0  – 50
			'#d0eefa', // 1  – 100
			'#a3ddf4', // 2  – 200
			'#6cc6eb', // 3  – 300
			'#33addf', // 4  – 400
			'#0098d4', // 5  – 500  (ACCENT)
			'#007aae', // 6  – 600
			'#00618b', // 7  – 700
			'#014e70', // 8  – 800
			'#04415d', // 9  – 900
		],
		gray: [
			'#f7f8fa', // 0  – 50
			'#eef0f3', // 1  – 100
			'#dde2e8', // 2  – 200
			'#c3cad4', // 3  – 300
			'#9aa4b2', // 4  – 400
			'#6b7684', // 5  – 500
			'#4b5563', // 6  – 600
			'#333c48', // 7  – 700
			'#1f2731', // 8  – 800
			'#141a22', // 9  – 900
		],
		dark: [
			'#ffffff', // 0  – text primary in dark mode
			'#e8eaed', // 1  – light accent (darker than ink-50 for dark-mode use)
			'#b8c0cc', // 2  – text secondary in dark mode
			'#8892a0', // 3  – text muted in dark mode
			'#333c48', // 4  – borders / dividers (softer than previous #6b7684)
			'#232c38', // 5  – strong borders (matches DS --surface-border)
			'#1f2731', // 6  – elevated surfaces
			'#1a1f26', // 7  – subtle surface variation
			'#141a22', // 8  – cards / panels in dark mode
			'#0b0f14', // 9  – body background dark
		],
	},

	components: {
		Combobox: {
			defaultProps: {
				zIndex: 400,
			},
		},
		Popover: {
			defaultProps: {
				zIndex: 400,
			},
		},
		Button: {
			defaultProps: {
				radius: 'md',
			},
		},
		Tabs: {
			defaultProps: {
				variant: 'default',
				radius: 'md',
			},
		},
		ActionIcon: {
			defaultProps: {
				variant: 'light',
				radius: 'md',
			},
			styles: {
				root: {
					cursor: 'pointer',
					width: '38px',
					height: '38px',
					'&:disabled': {
						opacity: 0.6,
						cursor: 'not-allowed',
					},
				},
			},
		},
		SegmentedControl: {
			styles: {
				root: {
					backgroundColor:
						'color-mix(in srgb, var(--nt-ink-0) 70%, transparent)',
					border:
						'1px solid color-mix(in srgb, var(--nt-green-500) 20%, transparent)',
					borderRadius: 'var(--r-xl, 16px)',
					padding: '3px',
				},
				control: {
					borderRadius: 'var(--r-lg, 12px)',
				},
				label: {
					fontWeight: 600,
					color: 'var(--nt-ink-600)',
					textTransform: 'none',
				},
				indicator: {
					borderRadius: 'var(--r-lg, 12px)',
					backgroundColor:
						'color-mix(in srgb, var(--nt-green-500) 12%, transparent)',
					border:
						'1px solid color-mix(in srgb, var(--nt-green-500) 28%, transparent)',
				},
			},
		},
		Modal: {
			defaultProps: {
				radius: 'xl',
			},
			styles: {
				body: {
					height: '90%',
				},
			},
		},
		Card: {
			defaultProps: {
				radius: 'lg',
			},
		},
		Textarea: {
			defaultProps: {
				radius: 'md',
			},
		},
		Input: {
			defaultProps: {
				radius: 'md',
			},
		},
		Select: {
			defaultProps: {
				radius: 'md',
			},
		},
		NativeSelect: {
			defaultProps: {
				radius: 'md',
			},
		},
	},
});
