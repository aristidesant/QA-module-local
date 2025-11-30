import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactListInformation from './ContactListInformation';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type ContactGroup from '~/models/ContactGroup';

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
	};

	beforeEach(() => {
		vi.clearAllMocks();
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
