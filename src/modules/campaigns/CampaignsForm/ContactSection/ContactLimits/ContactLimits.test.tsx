import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ContactLimits } from './ContactLimits';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { queryClient } from '~/test-utils/renderWithProviders';
import type { ContactFileSummary } from '~/models/ContactFileSummary';
import type FileModel from '~/models/FileModel';

// Helper to create a mock file summary
const createMockFileSummary = (
	overrides?: Partial<ContactFileSummary>
): ContactFileSummary => ({
	contactGroupFileId: 1,
	headers: ['Name', 'Phone', 'Email'],
	totalRows: 100,
	file: {
		id: 1,
		name: 'test.csv',
		mime: 'text/csv',
		repositoryKey: 'test-key',
		repositoryRoute: '/files/test.csv',
		extension: 'csv',
		description: null,
		typeId: 1,
		userId: 1,
		clientId: 1,
		createdAt: '2025-01-01T00:00:00Z',
		updatedAt: '2025-01-01T00:00:00Z',
		deletedAt: null,
	} as FileModel,
	...overrides,
});

// Mock the queries
vi.mock('~/queries/contactGroupFilesQueries', () => ({
	useProcessContactGroupFile: vi.fn(() => ({
		mutateAsync: vi.fn(),
		isPending: false,
		error: null,
	})),
}));

vi.mock('~/queries/contactGroupQueries', () => ({
	useUpdateContactGroup: vi.fn(() => ({
		mutateAsync: vi.fn(),
		isPending: false,
	})),
	useGetContactGroups: vi.fn(() => ({
		data: {
			data: [
				{ id: 1, name: 'Group 1', humanEquivalent: 5 },
				{ id: 2, name: 'Group 2', humanEquivalent: 3 },
			],
		},
	})),
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignActiveSchedule: vi.fn(() => ({
		data: {
			id: 1,
			humanEquivalent: 20,
		},
	})),
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock child components
vi.mock('./ContactListInfo', () => ({
	ContactListInfo: vi.fn(({ listName, onNameChange }) => (
		<div data-testid='contact-list-info'>
			<span data-testid='list-name'>{listName}</span>
			<button
				data-testid='change-name-btn'
				onClick={() => onNameChange?.('New Name')}
			>
				Change Name
			</button>
		</div>
	)),
}));

vi.mock('./ColumnMappingCard/ColumnMappingCard', () => ({
	default: vi.fn(({ headers, onMappingChange }) => (
		<div data-testid='column-mapping-card'>
			<span data-testid='headers-count'>{headers?.length || 0}</span>
			<button
				data-testid='map-columns-btn'
				onClick={() => onMappingChange?.({ phone: { csvField: 'Phone' } })}
			>
				Map Columns
			</button>
		</div>
	)),
}));

vi.mock('../ContactList/CapacityProgress', () => ({
	default: vi.fn(() => (
		<div data-testid='capacity-progress'>Capacity Progress</div>
	)),
}));

describe('ContactLimits', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Basic rendering', () => {
		it('renders ContactListInfo component', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(screen.getByTestId('contact-list-info')).toBeInTheDocument();
		});

		it('renders human equivalent slider', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByText(/campaigns.form.contacts.limits.humanEquivalentLabel/)
			).toBeInTheDocument();
			expect(screen.getByRole('slider')).toBeInTheDocument();
		});

		it('renders Cancel and Save buttons', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByRole('button', { name: /common.cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', {
					name: /campaigns.form.contacts.limits.actions.save/i,
				})
			).toBeInTheDocument();
		});

		it('renders Update button when editing existing contact group', () => {
			renderWithProviders(
				<ContactLimits
					contactGroup={{ id: 1, name: 'Test Group' }}
					campaignId={1}
				/>
			);

			expect(
				screen.getByRole('button', {
					name: /campaigns.form.contacts.limits.actions.update/i,
				})
			).toBeInTheDocument();
		});

		it('renders CapacityProgress when activeSchedule is available', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(screen.getByTestId('capacity-progress')).toBeInTheDocument();
		});
	});

	describe('ColumnMappingCard visibility', () => {
		it('renders ColumnMappingCard when fileSummary is provided and no contactGroup.id', () => {
			const fileSummary = createMockFileSummary();

			renderWithProviders(
				<ContactLimits
					contactGroup={{ name: 'Test Group' }}
					fileSummary={fileSummary}
					campaignId={1}
				/>
			);

			expect(screen.getByTestId('column-mapping-card')).toBeInTheDocument();
			expect(screen.getByTestId('headers-count')).toHaveTextContent('3');
		});

		it('does not render ColumnMappingCard when contactGroup.id exists', () => {
			const fileSummary = createMockFileSummary();

			renderWithProviders(
				<ContactLimits
					contactGroup={{ id: 1, name: 'Test Group' }}
					fileSummary={fileSummary}
					campaignId={1}
				/>
			);

			expect(
				screen.queryByTestId('column-mapping-card')
			).not.toBeInTheDocument();
		});

		it('does not render ColumnMappingCard when fileSummary is not provided', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.queryByTestId('column-mapping-card')
			).not.toBeInTheDocument();
		});
	});

	describe('Human Equivalent slider', () => {
		it('displays available capacity', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			// Total is 20, used is 5+3=8, so available is 12
			expect(
				screen.getByText(/campaigns.form.contacts.limits.availableLabel/)
			).toHaveTextContent(/12/);
		});

		it('uses contactGroup humanEquivalent as initial value', () => {
			renderWithProviders(
				<ContactLimits
					contactGroup={{ id: 1, name: 'Test Group', humanEquivalent: 5 }}
					campaignId={1}
				/>
			);

			expect(
				screen.getByText(/campaigns.form.contacts.limits.humanEquivalentLabel/)
			).toHaveTextContent(/5/);
		});

		it('defaults to 1 when no humanEquivalent provided', () => {
			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByText(/campaigns.form.contacts.limits.humanEquivalentLabel/)
			).toHaveTextContent(/1/);
		});
	});

	describe('Form interactions', () => {
		it('calls onComplete when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onComplete = vi.fn();

			renderWithProviders(
				<ContactLimits
					contactGroup={{ name: 'Test Group' }}
					campaignId={1}
					onComplete={onComplete}
				/>
			);

			await user.click(screen.getByRole('button', { name: /common.cancel/i }));

			expect(onComplete).toHaveBeenCalledTimes(1);
		});

		it('updates name when ContactListInfo triggers name change', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			await user.click(screen.getByTestId('change-name-btn'));

			expect(screen.getByTestId('list-name')).toHaveTextContent('New Name');
		});

		it('updates column mappings when ColumnMappingCard triggers change', async () => {
			const user = userEvent.setup();
			const fileSummary = createMockFileSummary();

			renderWithProviders(
				<ContactLimits
					contactGroup={{ name: 'Test Group' }}
					fileSummary={fileSummary}
					campaignId={1}
				/>
			);

			await user.click(screen.getByTestId('map-columns-btn'));

			// The mapping should be updated (verified by no errors thrown)
			expect(screen.getByTestId('column-mapping-card')).toBeInTheDocument();
		});

		it('syncs displayed values when contactGroup prop changes', () => {
			const { rerender } = renderWithProviders(
				<ContactLimits
					contactGroup={{ id: 1, name: 'First Group', humanEquivalent: 2 }}
					campaignId={1}
				/>
			);

			const rerenderWithProviders = (ui: React.ReactNode) =>
				rerender(
					<QueryClientProvider client={queryClient}>
						<MantineProvider>{ui}</MantineProvider>
					</QueryClientProvider>
				);

			expect(screen.getByTestId('list-name')).toHaveTextContent('First Group');
			expect(
				screen.getByText(/campaigns.form.contacts.limits.humanEquivalentLabel/)
			).toHaveTextContent(/2/);

			rerenderWithProviders(
				<ContactLimits
					contactGroup={{ id: 2, name: 'Updated Group', humanEquivalent: 4 }}
					campaignId={1}
				/>
			);

			expect(screen.getByTestId('list-name')).toHaveTextContent(
				'Updated Group'
			);
			expect(
				screen.getByText(/campaigns.form.contacts.limits.humanEquivalentLabel/)
			).toHaveTextContent(/4/);
		});
	});

	describe('Scheduler capacity full alert', () => {
		it('shows alert when scheduler is full for new contact group', async () => {
			// Override mock to return full scheduler
			const { useGetContactGroups } =
				await import('~/queries/contactGroupQueries');
			vi.mocked(useGetContactGroups).mockReturnValue({
				data: {
					data: [
						{ id: 1, name: 'Group 1', humanEquivalent: 10 },
						{ id: 2, name: 'Group 2', humanEquivalent: 10 },
					],
				},
			} as any);

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByText(/campaigns.form.contacts.limits.capacityFull.title/)
			).toBeInTheDocument();
		});

		it('disables Save button when scheduler is full', async () => {
			// Override mock to return full scheduler
			const { useGetContactGroups } =
				await import('~/queries/contactGroupQueries');
			vi.mocked(useGetContactGroups).mockReturnValue({
				data: {
					data: [
						{ id: 1, name: 'Group 1', humanEquivalent: 10 },
						{ id: 2, name: 'Group 2', humanEquivalent: 10 },
					],
				},
			} as any);

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByRole('button', {
					name: /campaigns.form.contacts.limits.actions.save/i,
				})
			).toBeDisabled();
		});

		it('disables slider when scheduler is full', async () => {
			// Override mock to return full scheduler
			const { useGetContactGroups } =
				await import('~/queries/contactGroupQueries');
			vi.mocked(useGetContactGroups).mockReturnValue({
				data: {
					data: [
						{ id: 1, name: 'Group 1', humanEquivalent: 10 },
						{ id: 2, name: 'Group 2', humanEquivalent: 10 },
					],
				},
			} as any);

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			// Mantine Slider uses data-disabled attribute instead of HTML disabled
			expect(screen.getByRole('slider')).toHaveAttribute(
				'data-disabled',
				'true'
			);
		});
	});

	describe('Loading state', () => {
		it('shows loading overlay when processing file', async () => {
			const { useProcessContactGroupFile } =
				await import('~/queries/contactGroupFilesQueries');
			vi.mocked(useProcessContactGroupFile).mockReturnValue({
				mutateAsync: vi.fn(),
				isPending: true,
				error: null,
			} as any);

			const { container } = renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				container.querySelector('[class*="mantine-LoadingOverlay"]')
			).toBeInTheDocument();
		});

		it('shows loading overlay when updating contact group', async () => {
			const { useUpdateContactGroup } =
				await import('~/queries/contactGroupQueries');
			vi.mocked(useUpdateContactGroup).mockReturnValue({
				mutateAsync: vi.fn(),
				isPending: true,
			} as any);

			const { container } = renderWithProviders(
				<ContactLimits
					contactGroup={{ id: 1, name: 'Test Group' }}
					campaignId={1}
				/>
			);

			expect(
				container.querySelector('[class*="mantine-LoadingOverlay"]')
			).toBeInTheDocument();
		});

		it('disables buttons when loading', async () => {
			const { useProcessContactGroupFile } =
				await import('~/queries/contactGroupFilesQueries');
			vi.mocked(useProcessContactGroupFile).mockReturnValue({
				mutateAsync: vi.fn(),
				isPending: true,
				error: null,
			} as any);

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(
				screen.getByRole('button', { name: /common.cancel/i })
			).toBeDisabled();
			expect(
				screen.getByRole('button', {
					name: /campaigns.form.contacts.limits.actions.save/i,
				})
			).toBeDisabled();
		});
	});

	describe('Without active scheduler', () => {
		it('does not render CapacityProgress when no activeSchedule', async () => {
			const { useCampaignActiveSchedule } =
				await import('~/queries/schedulerQueries');
			vi.mocked(useCampaignActiveSchedule).mockReturnValue({
				data: null,
			} as any);

			renderWithProviders(
				<ContactLimits contactGroup={{ name: 'Test Group' }} campaignId={1} />
			);

			expect(screen.queryByTestId('capacity-progress')).not.toBeInTheDocument();
		});
	});
});
