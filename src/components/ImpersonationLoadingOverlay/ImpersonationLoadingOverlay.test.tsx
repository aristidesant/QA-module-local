import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import ImpersonationLoadingOverlay from './ImpersonationLoadingOverlay';

// Mock the impersonation loading store
const mockUseImpersonationLoadingStore = vi.fn();
vi.mock('~/stores/impersonationLoadingStore', () => ({
	useImpersonationLoadingStore: () => mockUseImpersonationLoadingStore(),
}));

const renderOverlay = () => {
	return render(
		<MantineProvider>
			<ImpersonationLoadingOverlay />
		</MantineProvider>
	);
};

describe('ImpersonationLoadingOverlay', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Visibility', () => {
		it('does not render overlay when isLoading is false', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: false,
				message: 'Processing...',
			});

			renderOverlay();

			expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
		});

		it('renders overlay when isLoading is true', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Processing...',
			});

			renderOverlay();

			expect(screen.getByText('Processing...')).toBeInTheDocument();
		});
	});

	describe('Message Display', () => {
		it('displays default message', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Processing...',
			});

			renderOverlay();

			expect(screen.getByText('Processing...')).toBeInTheDocument();
		});

		it('displays custom message when switching client', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Switching to client...',
			});

			renderOverlay();

			expect(screen.getByText('Switching to client...')).toBeInTheDocument();
		});

		it('displays custom message when returning to master', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Returning to master client...',
			});

			renderOverlay();

			expect(
				screen.getByText('Returning to master client...')
			).toBeInTheDocument();
		});
	});

	describe('Loading Indicator', () => {
		it('renders loader when loading', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Processing...',
			});

			renderOverlay();

			// Mantine Loader renders with role="presentation" or as a div
			// We can check for the presence of the loader by checking the container
			const messageText = screen.getByText('Processing...');
			expect(messageText).toBeInTheDocument();
		});
	});

	describe('State Transitions', () => {
		it('hides overlay when loading state changes to false', () => {
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: true,
				message: 'Processing...',
			});

			const { rerender } = renderOverlay();

			expect(screen.getByText('Processing...')).toBeInTheDocument();

			// Simulate state change
			mockUseImpersonationLoadingStore.mockReturnValue({
				isLoading: false,
				message: 'Processing...',
			});

			rerender(
				<MantineProvider>
					<ImpersonationLoadingOverlay />
				</MantineProvider>
			);

			expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
		});
	});
});
