import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import useContactListColumns from './useContactListColumns';
import type ContactGroup from '~/models/ContactGroup';
import {
	useToggleContactGroupStatus,
	useUpdateContactGroup,
	useGetContactGroups,
	useDeleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';

vi.mock('~/queries/contactGroupQueries', () => ({
	useToggleContactGroupStatus: vi.fn(),
	useUpdateContactGroup: vi.fn(),
	useGetContactGroups: vi.fn(),
	useDeleteContactGroup: vi.fn(),
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignActiveSchedule: vi.fn(),
}));

const testContactGroup: ContactGroup = {
	id: 1,
	name: 'Test',
	contactCount: 100,
	humanEquivalent: 2,
	maxCallsPerContact: 1,
	maxCallsPerList: 10,
	queueStatus: 'active',
	createdAt: new Date().toISOString(),
} as any;

function HookConsumer(props: any) {
	const columns = useContactListColumns(props);
	const ids = columns.map((c) => c.id || (c as any).accessorKey).join(',');
	return <div data-ids={ids}></div>;
}

describe('useContactListColumns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
		(useCampaignActiveSchedule as unknown as any).mockReturnValue({
			data: null,
		});
		(useGetContactGroups as unknown as any).mockReturnValue({
			data: { data: [testContactGroup] },
		});
	});

	it('returns expected column ids', () => {
		renderWithProviders(
			<HookConsumer
				onUpdateComplete={() => {}}
				objectiveId={1}
				isActive={true}
				campaignId={1}
			/>
		);

		// Query the element with data-ids directly
		const el = document.querySelector('[data-ids]') as HTMLElement;
		const ids = el?.dataset.ids || '';

		expect(ids.includes('name')).toBeTruthy();
		expect(ids.includes('contactCount')).toBeTruthy();
		expect(ids.includes('humanEquivalent')).toBeTruthy();
		expect(ids.includes('createdAt')).toBeTruthy();
		expect(ids.includes('queueStatus')).toBeTruthy();
		expect(ids.includes('actions')).toBeTruthy();
	});
});

export {};
