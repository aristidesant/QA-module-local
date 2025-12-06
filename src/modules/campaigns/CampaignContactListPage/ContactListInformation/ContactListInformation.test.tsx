import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactListInformation from './ContactListInformation';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type ContactGroup from '~/models/ContactGroup';
import {
	useExtendContactGroupWaves,
	useCompleteContactGroup,
} from '~/queries/contactGroupQueries';
import { modals } from '@mantine/modals';

vi.mock(
	'~/modules/campaigns/CampaignLiveMetricPage/components/MetricInfoCard/MetricInfoCard',
	() => ({
		MetricInfoCard: ({ label, value }: { label: string; value: string }) => (
			<div data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
				<span data-testid='metric-label'>{label}</span>
				<span data-testid='metric-value'>{value}</span>
			</div>
		),
	})
);

vi.mock('~/queries/contactGroupQueries', () => ({
	useExtendContactGroupWaves: vi.fn(),
	useCompleteContactGroup: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
		openConfirmModal: vi.fn(),
		closeAll: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

describe('ContactListInformation', () => {
	const mockOnReload = vi.fn();

	const mockContactGroup: ContactGroup = {
		id: 1,
		name: 'Test Contact List',
		description: 'A test description',
		campaignId: 10,
		createdAt: '2024-01-15T10:00:00Z',
		scheduleId: 5,
		queueStatus: 'RUNNING',
		isActive: true,
		contactCount: 1500,
		expirationDate: '2025-12-31T00:00:00Z',
		maxCallsPerContact: 3,
		maxCallsPerList: 5000,
		humanEquivalent: 12.8,
		maxWaves: 4,
		currentWave: 2,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useExtendContactGroupWaves as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
		(useCompleteContactGroup as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
	});

	describe('Status Display', () => {
		it('renders RUNNING status correctly', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Running')).toBeInTheDocument();
			expect(
				screen.getByText('Contacts are currently being dialed.')
			).toBeInTheDocument();
		});

		it('renders PENDING status correctly', () => {
			const pendingGroup = { ...mockContactGroup, queueStatus: 'PENDING' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={pendingGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Pending')).toBeInTheDocument();
			expect(
				screen.getByText('Waiting to start. Review settings before launching.')
			).toBeInTheDocument();
		});

		it('renders PAUSED status correctly', () => {
			const pausedGroup = { ...mockContactGroup, queueStatus: 'PAUSED' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={pausedGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Paused')).toBeInTheDocument();
			expect(
				screen.getByText('Processing halted. Resume when ready.')
			).toBeInTheDocument();
		});

		it('renders COMPLETED status correctly', () => {
			const completedGroup = { ...mockContactGroup, queueStatus: 'COMPLETED' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={completedGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Complete')).toBeInTheDocument();
			expect(
				screen.getByText('All contacts processed for this list.')
			).toBeInTheDocument();
		});

		it('renders FAILED status correctly', () => {
			const failedGroup = { ...mockContactGroup, queueStatus: 'FAILED' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={failedGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Failed')).toBeInTheDocument();
			expect(
				screen.getByText('An error stopped the campaign. Try restarting.')
			).toBeInTheDocument();
		});

		it('renders EXECUTED status correctly', () => {
			const executedGroup = { ...mockContactGroup, queueStatus: 'EXECUTED' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={executedGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Executed')).toBeInTheDocument();
			expect(
				screen.getByText(
					'All planned waves are done. Extend waves or mark the list complete.'
				)
			).toBeInTheDocument();
		});

		it('renders UNKNOWN status for unrecognized status', () => {
			const unknownGroup = {
				...mockContactGroup,
				queueStatus: 'INVALID_STATUS',
			};
			renderWithProviders(
				<ContactListInformation
					contactGroup={unknownGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Unknown')).toBeInTheDocument();
			expect(
				screen.getByText('Status unavailable. Reload for the latest update.')
			).toBeInTheDocument();
		});

		it('renders UNKNOWN status when queueStatus is undefined', () => {
			const noStatusGroup = {
				...mockContactGroup,
				queueStatus: undefined as any,
			};
			renderWithProviders(
				<ContactListInformation
					contactGroup={noStatusGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Unknown')).toBeInTheDocument();
		});
	});

	describe('Metrics Display', () => {
		it('renders contact count metric', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByTestId('metric-contacts')).toBeInTheDocument();
		});

		it('renders max calls per contact metric', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(
				screen.getByTestId('metric-max-calls-/-contact')
			).toBeInTheDocument();
		});

		it('renders human equivalent metric', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByTestId('metric-human-equivalent')).toBeInTheDocument();
		});

		it('renders expiration metric', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByTestId('metric-expiration')).toBeInTheDocument();
		});

		it('renders waves metric', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByTestId('metric-waves')).toBeInTheDocument();
			expect(screen.getByText('2 / 4')).toBeInTheDocument();
		});

		it('hides extend/complete actions when not EXECUTED', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.queryByLabelText('Extend waves')).not.toBeInTheDocument();
			expect(screen.queryByLabelText('Complete list')).not.toBeInTheDocument();
		});

		it('displays contact count of 0 when not set', () => {
			const noCountGroup = { ...mockContactGroup, contactCount: 0 };
			renderWithProviders(
				<ContactListInformation
					contactGroup={noCountGroup}
					onReload={mockOnReload}
				/>
			);
			const metricsContainer = screen.getByTestId('metric-contacts');
			expect(metricsContainer).toBeInTheDocument();
		});

		it('displays "Not set" when no expiration date', () => {
			const noExpirationGroup = { ...mockContactGroup, expirationDate: '' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={noExpirationGroup}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByTestId('metric-expiration')).toBeInTheDocument();
		});

		it('rounds human equivalent value', () => {
			const group = { ...mockContactGroup, humanEquivalent: 12.8 };
			renderWithProviders(
				<ContactListInformation contactGroup={group} onReload={mockOnReload} />
			);
			// The component uses Math.round, so 12.8 becomes 13
			expect(screen.getByTestId('metric-human-equivalent')).toBeInTheDocument();
		});

		it('shows extend/complete actions when EXECUTED and triggers extend', async () => {
			const extendMock = vi.fn().mockResolvedValue({});
			(useExtendContactGroupWaves as unknown as any).mockReturnValue({
				mutateAsync: extendMock,
				isPending: false,
			});
			(modals.open as unknown as any).mockImplementation(
				({ children }: any) => {
					children.props.onSubmit(2);
				}
			);

			const executedGroup = { ...mockContactGroup, queueStatus: 'EXECUTED' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={executedGroup}
					onReload={mockOnReload}
				/>
			);

			const extendBtn = screen.getByLabelText('Extend waves');
			expect(extendBtn).toBeInTheDocument();
			fireEvent.click(extendBtn);

			await waitFor(() => expect(extendMock).toHaveBeenCalled());
		});
	});

	describe('Reload Functionality', () => {
		it('renders reload button', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			expect(
				screen.getByRole('button', { name: 'Reload contact list' })
			).toBeInTheDocument();
		});

		it('calls onReload when reload button is clicked', () => {
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={mockOnReload}
				/>
			);
			const reloadButton = screen.getByRole('button', {
				name: 'Reload contact list',
			});
			fireEvent.click(reloadButton);
			expect(mockOnReload).toHaveBeenCalledTimes(1);
		});

		it('handles async onReload function', async () => {
			const asyncReload = vi.fn().mockResolvedValue(undefined);
			renderWithProviders(
				<ContactListInformation
					contactGroup={mockContactGroup}
					onReload={asyncReload}
				/>
			);
			const reloadButton = screen.getByRole('button', {
				name: 'Reload contact list',
			});
			fireEvent.click(reloadButton);
			expect(asyncReload).toHaveBeenCalledTimes(1);
		});
	});

	describe('Case Insensitivity', () => {
		it('handles lowercase status', () => {
			const lowercaseStatus = { ...mockContactGroup, queueStatus: 'running' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={lowercaseStatus}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Running')).toBeInTheDocument();
		});

		it('handles mixed case status', () => {
			const mixedCaseStatus = { ...mockContactGroup, queueStatus: 'PaUsEd' };
			renderWithProviders(
				<ContactListInformation
					contactGroup={mixedCaseStatus}
					onReload={mockOnReload}
				/>
			);
			expect(screen.getByText('Paused')).toBeInTheDocument();
		});
	});
});
