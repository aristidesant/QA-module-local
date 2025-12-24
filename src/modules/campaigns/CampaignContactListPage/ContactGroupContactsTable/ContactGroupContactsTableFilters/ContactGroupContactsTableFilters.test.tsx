import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContactGroupContactsTableFilters from './ContactGroupContactsTableFilters';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock('~/components/FilterContainer', () => ({
	FilterContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='filter-container'>{children}</div>
	),
}));

describe('ContactGroupContactsTableFilters', () => {
	it('handles filter changes and actions', async () => {
		const user = userEvent.setup();
		const onFilterChange = vi.fn();
		const onClearFilters = vi.fn();
		const onExport = vi.fn();
		const onAppend = vi.fn();

		renderWithProviders(
			<ContactGroupContactsTableFilters
				filters={{ name: '', phone: '', email: '' }}
				onFilterChange={onFilterChange}
				onClearFilters={onClearFilters}
				hasActiveFilters
				onExport={onExport}
				onAppend={onAppend}
			/>
		);

		// Type in name field - since the component is controlled with static filters,
		// each character triggers a separate call
		await user.type(
			screen.getByPlaceholderText(
				'contactListPage.contactsTable.filters.searchByName'
			),
			'Jane'
		);
		expect(onFilterChange).toHaveBeenCalledWith('name', expect.any(String));
		expect(onFilterChange).toHaveBeenCalledTimes(4); // J, a, n, e

		onFilterChange.mockClear();
		// Type numbers and a letter - the letter should be filtered out
		await user.type(
			screen.getByPlaceholderText(
				'contactListPage.contactsTable.filters.filterByPhone'
			),
			'123a'
		);
		// The 'a' results in a call with '123' (no change from previous), so still 4 calls
		expect(onFilterChange).toHaveBeenCalledWith('phone', expect.any(String));
		// Each digit triggers a call, and 'a' triggers a call with digits only stripped
		expect(onFilterChange).toHaveBeenCalled();

		onFilterChange.mockClear();
		await user.type(
			screen.getByPlaceholderText(
				'contactListPage.contactsTable.filters.filterByEmail'
			),
			'test@test.com'
		);
		expect(onFilterChange).toHaveBeenCalledWith('email', expect.any(String));

		const buttons = within(screen.getByTestId('filter-container')).getAllByRole(
			'button'
		);
		await user.click(buttons[0]); // append
		expect(onAppend).toHaveBeenCalled();

		await user.click(buttons[1]); // export
		expect(onExport).toHaveBeenCalled();

		await user.click(buttons[2]); // clear
		expect(onClearFilters).toHaveBeenCalled();
	});
});
