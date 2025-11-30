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

		await user.type(screen.getByPlaceholderText('Search by name...'), 'Jane');
		expect(onFilterChange).toHaveBeenCalledWith('name', 'Jane');

		await user.type(screen.getByPlaceholderText('Filter by phone...'), '123a');
		expect(onFilterChange).toHaveBeenCalledWith('phone', '123');

		await user.type(
			screen.getByPlaceholderText('Filter by email...'),
			'john@example.com'
		);
		expect(onFilterChange).toHaveBeenCalledWith('email', 'john@example.com');

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
