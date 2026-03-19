import { createTheme } from '@mantine/core';

export const theme = createTheme({
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
	},
});
