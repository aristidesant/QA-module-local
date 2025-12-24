import { screen, waitFor } from '@testing-library/react';
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
	useExtendContactGroupWaves,
	useCompleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';
import { modals } from '@mantine/modals';

vi.mock('~/hooks/usePermissions', () => ({ default: vi.fn() }));
vi.mock('~/queries/contactGroupQueries', () => ({
	useDeleteContactGroup: vi.fn(),
	useGetContactGroups: vi.fn(),
	useToggleContactGroupStatus: vi.fn(),
	useUpdateContactGroup: vi.fn(),
	useExtendContactGroupWaves: vi.fn(),
	useCompleteContactGroup: vi.fn(),
}));
vi.mock('~/queries/outboundQueries', () => ({
	useCleanOutboundQueue: vi.fn(),
}));
vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignActiveSchedule: vi.fn(),
}));
vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
		openConfirmModal: vi.fn(),
		closeAll: vi.fn(),
	},
}));

const baseContactGroup = {
	id: 1,
	name: 'Test list',
	contactCount: 123,
	humanEquivalent: 2,
	maxWaves: 3,
	currentWave: 1,
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
		(useExtendContactGroupWaves as unknown as any).mockReturnValue({
			mutateAsync: vi.fn(),
			isPending: false,
		});
		(useCompleteContactGroup as unknown as any).mockReturnValue({
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

		expect(
			screen.getByText('campaigns.form.contacts.details.actions.title')
		).toBeInTheDocument();
		expect(screen.getByText('Test list')).toBeInTheDocument();
		expect(screen.getByText('Test description')).toBeInTheDocument();
		expect(
			screen.queryByLabelText(
				'campaigns.form.contacts.details.actions.extendWaves'
			)
		).not.toBeInTheDocument();
		expect(
			screen.queryByLabelText(
				'campaigns.form.contacts.details.actions.completeList'
			)
		).not.toBeInTheDocument();
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

		expect(
			screen.queryByText('campaigns.form.contacts.details.actions.title')
		).not.toBeInTheDocument();
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

		const toggle = screen.getByLabelText(
			'campaigns.form.contacts.details.actions.deactivate'
		);
		const clean = screen.getByLabelText(
			'campaigns.form.contacts.details.actions.cleanQueue'
		);

		expect(toggle).toBeDisabled();
		expect(clean).toBeDisabled();
	});

	it('shows extend waves action only when queueStatus is EXECUTED and triggers mutation', async () => {
		const extendMock = vi.fn().mockResolvedValue({});
		(useExtendContactGroupWaves as unknown as any).mockReturnValue({
			mutateAsync: extendMock,
			isPending: false,
		});
		(modals.open as unknown as any).mockImplementation(({ children }: any) => {
			children.props.onSubmit(2);
		});

		(usePermissions as unknown as any).mockReturnValue({
			canAccessModule: () => true,
			canPerformAction: () => true,
		});

		const executedGroup = {
			...baseContactGroup,
			queueStatus: 'EXECUTED',
			id: 99,
		} as any;

		renderWithProviders(
			<MemoryRouter>
				<ContactListDetails
					contactGroup={executedGroup}
					onUpdateComplete={() => {}}
				/>
			</MemoryRouter>
		);

		const extendBtn = screen.getByLabelText(
			'campaigns.form.contacts.details.actions.extendWaves'
		);
		expect(extendBtn).toBeInTheDocument();

		extendBtn.click();

		await waitFor(() =>
			expect(extendMock).toHaveBeenCalledWith(
				expect.objectContaining({ id: 99, additionalWaves: expect.any(Number) })
			)
		);
	});
});

export {};
