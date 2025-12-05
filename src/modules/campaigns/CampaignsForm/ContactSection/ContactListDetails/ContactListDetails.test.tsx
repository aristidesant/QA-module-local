import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ContactListDetails from './ContactListDetails';
import usePermissions from '~/hooks/usePermissions';
import {
	useDeleteContactGroup,
	useGetContactGroups,
	useToggleContactGroupStatus,
	useUpdateContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';

vi.mock('~/hooks/usePermissions', () => ({ default: vi.fn() }));
vi.mock('~/queries/contactGroupQueries', () => ({
	useDeleteContactGroup: vi.fn(),
	useGetContactGroups: vi.fn(),
	useToggleContactGroupStatus: vi.fn(),
	useUpdateContactGroup: vi.fn(),
}));
vi.mock('~/queries/outboundQueries', () => ({
	useCleanOutboundQueue: vi.fn(),
}));
vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignActiveSchedule: vi.fn(),
}));

const baseContactGroup = {
	id: 1,
	name: 'Test list',
	contactCount: 123,
	humanEquivalent: 2,
	maxCallsPerContact: 1,
	maxCallsPerList: 10,
	queueStatus: 'active',
	isActive: true,
	description: 'Test description',
	schedule: { name: 'Default', status: 'active' },
	expirationDate: null,
} as unknown as any;

describe('ContactListDetails', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useCleanOutboundQueue as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
		(useGetContactGroups as unknown as any).mockReturnValue({
			data: { data: [] },
		});
		(useCampaignActiveSchedule as unknown as any).mockReturnValue({
			data: null,
		});
		(useToggleContactGroupStatus as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
		(useUpdateContactGroup as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
		(useDeleteContactGroup as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
	});

	it('renders contact list card with details', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => true,
			canPerformAction: () => true,
		});

		renderWithProviders(
			<MemoryRouter>
				<ContactListDetails
					contactGroup={baseContactGroup}
					onUpdateComplete={() => {}}
				/>
			</MemoryRouter>
		);

		expect(screen.getByText('Contact List')).toBeInTheDocument();
		expect(screen.getByText('Test list')).toBeInTheDocument();
		expect(screen.getByText('Test description')).toBeInTheDocument();
	});

	it('hides actions card when permissions not available', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => false,
			canPerformAction: () => false,
		});

		renderWithProviders(
			<MemoryRouter>
				<ContactListDetails
					contactGroup={baseContactGroup}
					onUpdateComplete={() => {}}
				/>
			</MemoryRouter>
		);

		expect(screen.queryByText('Actions')).not.toBeInTheDocument();
	});

	it('disables toggle and clean queue when queue status is COMPLETED', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => true,
			canPerformAction: () => true,
		});

		const cg = {
			...baseContactGroup,
			queueStatus: 'COMPLETED',
			isActive: true,
		} as any;
		renderWithProviders(
			<MemoryRouter>
				<ContactListDetails contactGroup={cg} onUpdateComplete={() => {}} />
			</MemoryRouter>
		);

		const toggle = screen.getByLabelText('Deactivate contact list');
		const clean = screen.getByLabelText('Clean queue');

		expect(toggle).toBeDisabled();
		expect(clean).toBeDisabled();
	});
});

export {};
