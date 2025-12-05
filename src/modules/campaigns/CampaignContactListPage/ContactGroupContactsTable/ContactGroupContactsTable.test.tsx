import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactGroupContactsTable from './ContactGroupContactsTable';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: () => true,
		canAccessModule: () => true,
		hasAnyPermission: () => true,
		hasAllPermissions: () => true,
	}),
}));

const setRightComponent = vi.fn();
const exportRefetch = vi.fn();
const appendMutate = vi.fn();
const uploadMutate = vi.fn();
const deleteMutate = vi.fn();
let contactsState: any;

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: () => ({ setRightComponent }),
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		onRowClick,
	}: {
		data: any[];
		onRowClick?: (row: any) => void;
	}) => (
		<div data-testid='base-table'>
			{data.map((row) => (
				<div
					key={row.id}
					data-testid={`row-${row.id}`}
					onClick={() => onRowClick?.(row)}
				>
					{row.firstName} {row.lastName}
				</div>
			))}
		</div>
	),
}));

vi.mock('./ContactGroupContactsTableFilters', () => ({
	__esModule: true,
	default: ({
		onExport,
		onAppend,
	}: {
		onExport: () => void;
		onAppend: () => void;
	}) => (
		<div>
			<button onClick={onAppend}>Append</button>
			<button onClick={onExport}>Export</button>
		</div>
	),
}));

vi.mock('./EditablePhoneNumbersTable', () => ({
	default: () => <div data-testid='editable-phones' />,
}));

vi.mock('./AppendContactsModal', () => ({
	default: ({ onClose }: { onClose: () => void }) => (
		<div data-testid='append-modal'>
			<button onClick={onClose}>Close modal</button>
		</div>
	),
}));

vi.mock('./ContactListSkeleton', () => ({
	default: () => <div data-testid='skeleton'>Loading</div>,
}));

vi.mock('./useContactColumns', () => ({
	useContactColumns: () => [],
}));

vi.mock('~/components/PaginationControls', () => ({
	default: () => <div data-testid='pagination' />,
}));

vi.mock('~/queries/contactsQueries', () => ({
	useGetContactGroupContacts: () => contactsState,
	useDeleteContact: () => ({
		mutate: deleteMutate,
		isPending: false,
	}),
	useGetContactGroupContactsWithPhoneValidationErrors: vi.fn(),
	useExportContactGroupContactsWithPhoneValidationErrors: vi.fn(),
	useUpdateContactPhoneNumber: vi.fn(),
}));

vi.mock('~/queries/contactGroupFilesQueries', () => ({
	useExportContactGroupFileOriginal: () => ({
		refetch: exportRefetch,
		isFetching: false,
	}),
	useAppendContactGroupFile: () => ({
		mutateAsync: appendMutate,
		isPending: false,
	}),
	useUploadContactGroupFile: () => ({
		mutateAsync: uploadMutate,
		isPending: false,
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: vi.fn(),
	},
}));

describe('ContactGroupContactsTable', () => {
	beforeEach(() => {
		contactsState = {
			data: {
				data: [
					{
						id: 1,
						firstName: 'Valid',
						lastName: 'Contact',
						emails: ['v@example.com'],
						phoneNumbers: [{ phoneNumber: '+18095551234' }],
					},
					{
						id: 2,
						firstName: 'Faulty',
						lastName: 'Contact',
						emails: [],
						phoneNumbers: [
							{ phoneNumber: '+18090000000', validationError: { code: 'BAD' } },
						],
					},
				],
				total: 2,
			},
			isLoading: false,
			isFetching: false,
			error: null,
			refetch: vi.fn(),
		};
		exportRefetch.mockResolvedValue({ data: 'csv-content' });
	});

	it('filters out faulty contacts and handles row click', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<ContactGroupContactsTable contactGroupId={1} campaignId={1} />
		);

		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByTestId('row-1')).toBeInTheDocument();
		expect(screen.queryByTestId('row-2')).not.toBeInTheDocument();

		await user.click(screen.getByTestId('row-1'));
		expect(setRightComponent).toHaveBeenCalled();
	});

	it('shows loading skeleton', () => {
		contactsState = { isLoading: true };
		renderWithProviders(
			<ContactGroupContactsTable contactGroupId={1} campaignId={1} />
		);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	it('exports contacts and opens append modal', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<ContactGroupContactsTable contactGroupId={1} campaignId={1} />
		);

		await user.click(screen.getByText('Export'));
		expect(exportRefetch).toHaveBeenCalled();

		await user.click(screen.getByText('Append'));
		expect(screen.getByTestId('append-modal')).toBeInTheDocument();
	});
});
