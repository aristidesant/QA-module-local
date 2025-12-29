import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import KnowledgeBaseFilter from './KnowledgeBaseFilter';

describe('KnowledgeBaseFilter', () => {
	it('renders translated placeholders and results counter', () => {
		renderWithProviders(
			<KnowledgeBaseFilter
				query=''
				setQuery={vi.fn()}
				statusFilter={null}
				setStatusFilter={vi.fn()}
				typeFilter={null}
				setTypeFilter={vi.fn()}
				total={0}
				count={0}
				refetch={vi.fn()}
			/>
		);

		expect(
			screen.getByPlaceholderText('Search knowledge bases...')
		).toBeInTheDocument();

		// Mantine Select renders an input with a placeholder
		expect(screen.getByPlaceholderText('All statuses')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('All types')).toBeInTheDocument();

		expect(screen.getByText('0 of 0 items')).toBeInTheDocument();
	});

	it('calls setQuery on search change', () => {
		const setQuery = vi.fn();

		renderWithProviders(
			<KnowledgeBaseFilter
				query=''
				setQuery={setQuery}
				statusFilter={null}
				setStatusFilter={vi.fn()}
				typeFilter={null}
				setTypeFilter={vi.fn()}
				total={10}
				count={3}
				refetch={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Search knowledge bases...'), {
			target: { value: 'alpha' },
		});

		expect(setQuery).toHaveBeenCalledWith('alpha');
	});

	it('calls refetch when clicking Refresh', () => {
		const refetch = vi.fn();

		renderWithProviders(
			<KnowledgeBaseFilter
				query=''
				setQuery={vi.fn()}
				statusFilter={null}
				setStatusFilter={vi.fn()}
				typeFilter={null}
				setTypeFilter={vi.fn()}
				total={5}
				count={2}
				refetch={refetch}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
		expect(refetch).toHaveBeenCalledTimes(1);
	});
});
