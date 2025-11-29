import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import SuspenseFallback from './SuspenseFallback';

const renderSuspenseFallback = (
	props: Parameters<typeof SuspenseFallback>[0]
) => {
	return render(
		<MantineProvider>
			<SuspenseFallback {...props} />
		</MantineProvider>
	);
};

describe('SuspenseFallback', () => {
	describe('Rendering', () => {
		it('renders the message', () => {
			renderSuspenseFallback({ message: 'Loading...' });

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('renders the description when provided', () => {
			renderSuspenseFallback({
				message: 'Loading',
				description: 'Please wait while we fetch your data',
			});

			expect(
				screen.getByText('Please wait while we fetch your data')
			).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			renderSuspenseFallback({ message: 'Loading' });

			const wrapper = screen.getByRole('status');
			expect(wrapper).not.toHaveTextContent('undefined');
		});

		it('renders a loader', () => {
			const { container } = renderSuspenseFallback({ message: 'Loading' });

			const loader = container.querySelector('[class*="Loader"]');
			expect(loader).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has role="status"', () => {
			renderSuspenseFallback({ message: 'Loading' });

			expect(screen.getByRole('status')).toBeInTheDocument();
		});

		it('has aria-live="polite"', () => {
			renderSuspenseFallback({ message: 'Loading' });

			const status = screen.getByRole('status');
			expect(status).toHaveAttribute('aria-live', 'polite');
		});
	});

	describe('Complete Example', () => {
		it('renders message and description together', () => {
			renderSuspenseFallback({
				message: 'Loading campaigns',
				description: 'This may take a few seconds',
			});

			expect(screen.getByText('Loading campaigns')).toBeInTheDocument();
			expect(
				screen.getByText('This may take a few seconds')
			).toBeInTheDocument();
		});
	});
});
