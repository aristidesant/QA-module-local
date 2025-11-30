import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { Header } from './Header';

// Mock react-router
vi.mock('react-router', () => ({
	useNavigate: () => vi.fn(),
}));

// Mock useImpersonationState
const mockIsImpersonating = vi.fn();
vi.mock('~/hooks/useImpersonationState', () => ({
	useImpersonationState: () => ({
		isImpersonating: mockIsImpersonating(),
		originalClientId: null,
		currentClientId: null,
	}),
}));

// Mock useEndImpersonation
const mockMutate = vi.fn();
vi.mock('~/queries/authQueries', () => ({
	useEndImpersonation: () => ({
		mutate: mockMutate,
		isPending: false,
	}),
}));

// Mock mantine modals
const mockOpenConfirmModal = vi.fn();
vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: (args: any) => mockOpenConfirmModal(args),
	},
}));

const renderHeader = (props: { opened: boolean; toggle: () => void }) => {
	return render(
		<MantineProvider>
			<Header {...props} />
		</MantineProvider>
	);
};

describe('Header', () => {
	const mockToggle = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsImpersonating.mockReturnValue(false);
	});

	describe('Rendering', () => {
		it('renders the header with menu button', () => {
			renderHeader({ opened: true, toggle: mockToggle });

			expect(
				screen.getByRole('button', { name: /close menu/i })
			).toBeInTheDocument();
		});

		it('renders the notification bell icon', () => {
			renderHeader({ opened: true, toggle: mockToggle });

			// The bell icon is in an ActionIcon
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('shows chevron left icon when opened is true', () => {
			renderHeader({ opened: true, toggle: mockToggle });

			expect(
				screen.getByRole('button', { name: /close menu/i })
			).toBeInTheDocument();
		});

		it('shows menu icon when opened is false', () => {
			renderHeader({ opened: false, toggle: mockToggle });

			expect(
				screen.getByRole('button', { name: /open menu/i })
			).toBeInTheDocument();
		});
	});

	describe('Menu Toggle', () => {
		it('calls toggle when menu button is clicked', () => {
			renderHeader({ opened: true, toggle: mockToggle });

			const menuButton = screen.getByRole('button', { name: /close menu/i });
			fireEvent.click(menuButton);

			expect(mockToggle).toHaveBeenCalledTimes(1);
		});
	});

	describe('Impersonation State', () => {
		it('does not show return button when not impersonating', () => {
			mockIsImpersonating.mockReturnValue(false);
			renderHeader({ opened: true, toggle: mockToggle });

			expect(
				screen.queryByRole('button', { name: /return to master client/i })
			).not.toBeInTheDocument();
		});

		it('shows return button when impersonating', () => {
			mockIsImpersonating.mockReturnValue(true);
			renderHeader({ opened: true, toggle: mockToggle });

			expect(
				screen.getByRole('button', { name: /return to master client/i })
			).toBeInTheDocument();
		});

		it('opens confirmation modal when return button is clicked', () => {
			mockIsImpersonating.mockReturnValue(true);
			renderHeader({ opened: true, toggle: mockToggle });

			const returnButton = screen.getByRole('button', {
				name: /return to master client/i,
			});
			fireEvent.click(returnButton);

			expect(mockOpenConfirmModal).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Return to Master Client',
					labels: { confirm: 'Return to Master', cancel: 'Cancel' },
					confirmProps: { color: 'blue' },
				})
			);
		});

		it('calls endImpersonation mutation when confirmed', () => {
			mockIsImpersonating.mockReturnValue(true);
			mockOpenConfirmModal.mockImplementation(({ onConfirm }: any) => {
				onConfirm();
			});

			renderHeader({ opened: true, toggle: mockToggle });

			const returnButton = screen.getByRole('button', {
				name: /return to master client/i,
			});
			fireEvent.click(returnButton);

			expect(mockMutate).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('has correct aria-label on menu button when opened', () => {
			renderHeader({ opened: true, toggle: mockToggle });

			const menuButton = screen.getByRole('button', { name: /close menu/i });
			expect(menuButton).toHaveAttribute('aria-pressed', 'true');
		});

		it('has correct aria-label on menu button when closed', () => {
			renderHeader({ opened: false, toggle: mockToggle });

			const menuButton = screen.getByRole('button', { name: /open menu/i });
			expect(menuButton).toHaveAttribute('aria-pressed', 'false');
		});
	});
});
