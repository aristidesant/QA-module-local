import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactGroupSummary from './ContactGroupSummary';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type ContactGroup from '~/models/ContactGroup';

vi.mock('~/utils/dateUtils', () => ({
	formatExpirationDate: vi.fn((date: string) =>
		date ? `Formatted: ${date}` : ''
	),
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/ContactSection/ContactList/queueStatusConfig',
	() => ({
		getQueueStatusConfig: vi.fn((status: string) => ({
			label: status === 'RUNNING' ? 'Running' : 'Pending',
			color: status === 'RUNNING' ? 'blue' : 'gray',
		})),
	})
);

vi.mock('~/components/RightSectionCard', () => ({
	default: ({
		children,
		title,
		description,
		rightSection,
	}: {
		children: React.ReactNode;
		title: string;
		description: string;
		rightSection?: React.ReactNode;
	}) => (
		<div data-testid={`card-${title.toLowerCase()}`}>
			<div data-testid='card-title'>{title}</div>
			<div data-testid='card-description'>{description}</div>
			{rightSection && (
				<div data-testid='card-right-section'>{rightSection}</div>
			)}
			{children}
		</div>
	),
}));

describe('ContactGroupSummary', () => {
	const mockContactGroup: ContactGroup = {
		id: 1,
		name: 'Test Contact List',
		description: 'A test description for the contact group',
		campaignId: 10,
		createdAt: '2024-01-15T10:00:00Z',
		scheduleId: 5,
		queueStatus: 'RUNNING',
		isActive: true,
		contactCount: 1500,
		expirationDate: '2025-12-31T00:00:00Z',
		maxCallsPerContact: 3,
		maxCallsPerList: 5000,
		humanEquivalent: 12.5,
		maxWaves: 6,
		currentWave: 2,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Details Card', () => {
		it('renders the contact group name', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('Test Contact List')).toBeInTheDocument();
		});

		it('renders the contact group description', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(
				screen.getByText('A test description for the contact group')
			).toBeInTheDocument();
		});

		it('renders fallback name when no name is provided', () => {
			const groupWithoutName = { ...mockContactGroup, name: '' };
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutName} />
			);
			expect(screen.getByText('#1')).toBeInTheDocument();
		});

		it('renders fallback description when no description is provided', () => {
			const groupWithoutDescription = { ...mockContactGroup, description: '' };
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutDescription} />
			);
			expect(screen.getByText('No description provided.')).toBeInTheDocument();
		});

		it('renders Active badge when isActive is true', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('renders Inactive badge when isActive is false', () => {
			const inactiveGroup = { ...mockContactGroup, isActive: false };
			renderWithProviders(<ContactGroupSummary contactGroup={inactiveGroup} />);
			expect(screen.getByText('Inactive')).toBeInTheDocument();
		});

		it('renders the queue status badge', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			// The mock for getQueueStatusConfig returns 'Running' or 'Pending'
			// But the component uses t(config.label)
			// So it should be 'Running' or 'Pending' if the mock returns those strings
			// Wait, let's check the component.
			expect(screen.getByText('Running')).toBeInTheDocument();
		});

		it('renders campaign ID', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('#10')).toBeInTheDocument();
		});

		it('renders campaign placeholder when no campaignId', () => {
			const groupWithoutCampaign = { ...mockContactGroup, campaignId: 0 };
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutCampaign} />
			);
			expect(screen.getByText('-')).toBeInTheDocument();
		});

		it('renders schedule ID', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('#5')).toBeInTheDocument();
		});

		it('renders schedule placeholder when no scheduleId', () => {
			const groupWithoutSchedule = { ...mockContactGroup, scheduleId: 0 };
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutSchedule} />
			);
			expect(screen.getByText('Not set')).toBeInTheDocument();
		});

		it('renders formatted expiration date', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(
				screen.getByText('Formatted: 2025-12-31T00:00:00Z')
			).toBeInTheDocument();
		});

		it('renders placeholder when no expiration date', () => {
			const groupWithoutExpiration = {
				...mockContactGroup,
				expirationDate: '',
			};
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutExpiration} />
			);
			expect(screen.getByText('No expiration defined')).toBeInTheDocument();
		});
	});

	describe('Metrics Card', () => {
		it('renders contact count', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('1,500')).toBeInTheDocument();
		});

		it('renders N/A when contact count is undefined', () => {
			const groupWithoutCount = {
				...mockContactGroup,
				contactCount: undefined as any,
			};
			renderWithProviders(
				<ContactGroupSummary contactGroup={groupWithoutCount} />
			);
			expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
		});

		it('renders max calls per contact', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('3')).toBeInTheDocument();
		});

		it('renders max calls per list', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('5000')).toBeInTheDocument();
		});

		it('renders human equivalent', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('12.5')).toBeInTheDocument();
		});

		it('renders metrics labels', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('Contacts')).toBeInTheDocument();
			expect(screen.getByText('Max calls per contact')).toBeInTheDocument();
			expect(screen.getByText('Max calls per list')).toBeInTheDocument();
			expect(screen.getByText('Human equivalent')).toBeInTheDocument();
			expect(screen.getByText('Waves')).toBeInTheDocument();
		});

		it('renders waves value', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByText('2 / 6')).toBeInTheDocument();
		});
	});

	describe('Card structure', () => {
		it('renders Details card with correct props', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByTestId('card-details')).toBeInTheDocument();
			expect(screen.getByText('Contact list metadata')).toBeInTheDocument();
		});

		it('renders Metrics card with correct props', () => {
			renderWithProviders(
				<ContactGroupSummary contactGroup={mockContactGroup} />
			);
			expect(screen.getByTestId('card-metrics')).toBeInTheDocument();
			expect(
				screen.getByText('Contact list performance metrics')
			).toBeInTheDocument();
		});
	});
});
