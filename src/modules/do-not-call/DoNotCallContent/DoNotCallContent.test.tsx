import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { DoNotCallContent } from './DoNotCallContent';
import * as doNotCallQueries from '~/queries/doNotCallQueries';
import { modals } from '@mantine/modals';

vi.mock('~/queries/doNotCallQueries', () => ({
	useDoNotCallList: vi.fn(),
	useDeleteDoNotCall: vi.fn(),
	useCreateDoNotCall: vi.fn(),
	useUpdateDoNotCall: vi.fn(),
	useCleanExpiredDoNotCall: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
		openConfirmModal: vi.fn(),
		close: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

const mockedUseDoNotCallList = vi.mocked(doNotCallQueries.useDoNotCallList);
const mockedUseDeleteDoNotCall = vi.mocked(doNotCallQueries.useDeleteDoNotCall);
const mockedUseCreateDoNotCall = vi.mocked(doNotCallQueries.useCreateDoNotCall);
const mockedUseUpdateDoNotCall = vi.mocked(doNotCallQueries.useUpdateDoNotCall);
const mockedUseCleanExpiredDoNotCall = vi.mocked(
	doNotCallQueries.useCleanExpiredDoNotCall
);

describe('DoNotCallContent', () => {
	beforeEach(() => {
		mockedUseDeleteDoNotCall.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue(undefined),
		} as unknown as ReturnType<typeof doNotCallQueries.useDeleteDoNotCall>);
		mockedUseCreateDoNotCall.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
		} as unknown as ReturnType<typeof doNotCallQueries.useCreateDoNotCall>);
		mockedUseUpdateDoNotCall.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
		} as unknown as ReturnType<typeof doNotCallQueries.useUpdateDoNotCall>);
		mockedUseCleanExpiredDoNotCall.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({ cleaned: 0 }),
		} as unknown as ReturnType<
			typeof doNotCallQueries.useCleanExpiredDoNotCall
		>);
	});

	it('renders page title and empty state', () => {
		mockedUseDoNotCallList.mockReturnValue({
			data: {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			},
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof doNotCallQueries.useDoNotCallList>);

		renderWithProviders(<DoNotCallContent />);

		expect(screen.getByText('Do Not Call List')).toBeInTheDocument();
		expect(
			screen.getByText('Manage phone numbers that should not be contacted.')
		).toBeInTheDocument();

		expect(screen.getByText('No entries yet')).toBeInTheDocument();
		expect(
			screen.getByText('Add phone numbers to the Do Not Call list')
		).toBeInTheDocument();

		expect(
			screen.getAllByRole('button', { name: 'Add Entry' })[0]
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Clean Expired' })
		).toBeInTheDocument();
	});

	it('opens create modal when clicking Add Entry', async () => {
		const user = userEvent.setup();
		mockedUseDoNotCallList.mockReturnValue({
			data: {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			},
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof doNotCallQueries.useDoNotCallList>);

		renderWithProviders(<DoNotCallContent />);

		await user.click(screen.getAllByRole('button', { name: 'Add Entry' })[0]);

		expect(modals.open).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'create-dnc-entry',
				title: 'Add Do Not Call Entry',
			})
		);
	});

	it('opens clean expired confirm modal when clicking Clean Expired', async () => {
		const user = userEvent.setup();
		mockedUseDoNotCallList.mockReturnValue({
			data: {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			},
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof doNotCallQueries.useDoNotCallList>);

		renderWithProviders(<DoNotCallContent />);

		await user.click(screen.getByRole('button', { name: 'Clean Expired' }));

		expect(modals.openConfirmModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Clean Expired Entries',
				labels: expect.objectContaining({
					confirm: 'Clean',
					cancel: 'Cancel',
				}),
			})
		);
	});

	it('shows loading state', () => {
		mockedUseDoNotCallList.mockReturnValue({
			data: undefined,
			isLoading: true,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof doNotCallQueries.useDoNotCallList>);

		renderWithProviders(<DoNotCallContent />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});
});
