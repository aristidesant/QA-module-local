import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useDeleteContactPhoneNumber } from '../contactsQueries';
import contactsApi from '~/api/contactsApi';

vi.mock('~/api/contactsApi', () => ({
	default: vi.fn(),
}));

const mockedContactsApi = contactsApi as unknown as any;

const mockApi = {
	deleteContactPhoneNumber: vi.fn(),
};

mockedContactsApi.mockReturnValue(mockApi);

const createWrapper = (client: QueryClient) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

describe('contactsQueries', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.clearAllMocks();
	});

	describe('useDeleteContactPhoneNumber', () => {
		it('calls deleteContactPhoneNumber api and invalidates queries on success', async () => {
			mockApi.deleteContactPhoneNumber.mockResolvedValue({});
			const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useDeleteContactPhoneNumber(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({ contactId: 1, phoneNumberId: 10 });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockApi.deleteContactPhoneNumber).toHaveBeenCalledWith(1, 10);
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['contacts'],
			});
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['contact', '1'],
			});
		});

		it('handles errors correctly', async () => {
			const error = new Error('Delete failed');
			mockApi.deleteContactPhoneNumber.mockRejectedValue(error);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useDeleteContactPhoneNumber(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({ contactId: 1, phoneNumberId: 10 });

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(mockApi.deleteContactPhoneNumber).toHaveBeenCalledWith(1, 10);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error deleting contact phone number:',
				error
			);
			consoleSpy.mockRestore();
		});
	});
});
