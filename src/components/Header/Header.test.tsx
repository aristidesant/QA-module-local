import { render, screen } from '@testing-library/react';
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

const renderHeader = () => {
	return render(
		<MantineProvider>
			<Header />
		</MantineProvider>
	);
};

describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsImpersonating.mockReturnValue(false);
	});

	describe('Rendering', () => {
		it('renders the header', () => {
			renderHeader();

			expect(screen.getByRole('banner')).toBeInTheDocument();
		});

		it('renders the notification bell icon', () => {
			renderHeader();

			// The bell icon is in an ActionIcon
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});

	describe('Impersonation State', () => {
		it('does not show return button when not impersonating', () => {
			mockIsImpersonating.mockReturnValue(false);
			renderHeader();

			expect(
				screen.queryByRole('button', { name: /return to master client/i })
			).not.toBeInTheDocument();
		});

		it('shows return button when impersonating', () => {
			mockIsImpersonating.mockReturnValue(true);
			renderHeader();

			expect(
				screen.getByRole('button', { name: /return to master client/i })
			).toBeInTheDocument();
		});

		it('opens confirmation modal when return button is clicked', async () => {
			mockIsImpersonating.mockReturnValue(true);
			renderHeader();

			const returnButton = screen.getByRole('button', {
				name: /return to master client/i,
			});
			returnButton.click();

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

			renderHeader();

			const returnButton = screen.getByRole('button', {
				name: /return to master client/i,
			});
			returnButton.click();

			expect(mockMutate).toHaveBeenCalledTimes(1);
		});
	});
});
