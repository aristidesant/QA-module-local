import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import DoNotCallFilters from './DoNotCallFilters';

describe('DoNotCallFilters', () => {
	it('renders translated labels and search input', () => {
		renderWithProviders(
			<DoNotCallFilters
				searchValue=''
				onSearchChange={vi.fn()}
				filters={{ status: 'active' }}
				onFiltersChange={vi.fn()}
			/>
		);

		expect(screen.getByText('Filters')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Advanced' })
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Search by phone number...')
		).toBeInTheDocument();

		// Status filter is set, so badge count should be visible
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('calls onSearchChange when typing in search input', async () => {
		const user = userEvent.setup();
		const onSearchChange = vi.fn();

		const ControlledFilters = () => {
			const [value, setValue] = useState('');
			return (
				<DoNotCallFilters
					searchValue={value}
					onSearchChange={(next) => {
						onSearchChange(next);
						setValue(next);
					}}
					filters={{ status: 'active' }}
					onFiltersChange={vi.fn()}
				/>
			);
		};

		renderWithProviders(<ControlledFilters />);

		await user.type(
			screen.getByPlaceholderText('Search by phone number...'),
			'+123'
		);

		expect(onSearchChange).toHaveBeenLastCalledWith('+123');
	});

	it('clears all filters from advanced section', async () => {
		const user = userEvent.setup();
		const onFiltersChange = vi.fn();

		renderWithProviders(
			<DoNotCallFilters
				searchValue=''
				onSearchChange={vi.fn()}
				filters={{ status: 'active' }}
				onFiltersChange={onFiltersChange}
			/>
		);

		await user.click(screen.getByRole('button', { name: 'Advanced' }));

		expect(
			await screen.findByPlaceholderText('All reasons')
		).toBeInTheDocument();
		expect(
			await screen.findByPlaceholderText('All statuses')
		).toBeInTheDocument();

		const clearButton = await screen.findByRole('button', {
			name: 'Clear all filters',
		});
		await user.click(clearButton);

		expect(onFiltersChange).toHaveBeenCalledWith({});
	});
});
