import { createTheme } from '@mantine/core';

export const theme = createTheme({
	fontFamily:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
	fontFamilyMonospace:
		"'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace",

	headings: {
		fontFamily:
			"'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		fontWeight: '600',
		sizes: {
			h1: { fontSize: '1.5rem', lineHeight: '1.3' },
			h2: { fontSize: '1.25rem', lineHeight: '1.35' },
			h3: { fontSize: '1.125rem', lineHeight: '1.4' },
			h4: { fontSize: '1rem', lineHeight: '1.4' },
			h5: { fontSize: '0.875rem', lineHeight: '1.45' },
			h6: { fontSize: '0.8125rem', lineHeight: '1.5' },
		},
	},

	fontSizes: {
		xs: '0.6875rem', // 11px
		sm: '0.8125rem', // 13px — primary UI size
		md: '0.875rem', // 14px
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
					borderRadius: '12px',
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
						'color-mix(in srgb, var(--mantine-color-white) 70%, transparent)',
					border:
						'1px solid color-mix(in srgb, var(--mantine-color-blue-6) 20%, transparent)',
					borderRadius: '16px',
					padding: '4px',
				},
				control: {
					borderRadius: '12px',
				},
				label: {
					fontWeight: 600,
					color: 'var(--mantine-color-gray-7)',
					textTransform: 'none',
				},
				indicator: {
					borderRadius: '12px',
					backgroundColor:
						'color-mix(in srgb, var(--mantine-color-blue-5) 26%, transparent)',
					border:
						'1px solid color-mix(in srgb, var(--mantine-color-blue-6) 30%, transparent)',
				},
			},
		},
		Modal: {
			defaultProps: {
				radius: 'md',
			},
			styles: {
				body: {
					height: '90%',
				},
			},
		},
		Card: {
			defaultProps: {
				radius: 'md',
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
