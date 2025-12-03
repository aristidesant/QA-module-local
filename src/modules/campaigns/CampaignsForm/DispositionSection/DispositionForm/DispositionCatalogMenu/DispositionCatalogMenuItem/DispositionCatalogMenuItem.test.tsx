import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DispositionCatalogMenuItem from './DispositionCatalogMenuItem';

describe('DispositionCatalogMenuItem', () => {
	it('renders node and triggers add', () => {
		const mockOnAdd = vi.fn();
		const node = { id: 1, name: 'Leaf' } as any;
		renderWithProviders(
			<DispositionCatalogMenuItem node={node} onAdd={mockOnAdd} />
		);
		const addBtn = screen.getByLabelText('Add disposition to flow');
		fireEvent.click(addBtn);
		expect(mockOnAdd).toHaveBeenCalledWith(node);
	});

	it('shows add all for groups and triggers onAddGroup', () => {
		const mockOnAdd = vi.fn();
		const mockOnAddGroup = vi.fn();
		const node = {
			id: 2,
			name: 'Group',
			children: [{ id: 3, name: 'Child' }],
		} as any;
		renderWithProviders(
			<DispositionCatalogMenuItem
				node={node}
				onAdd={mockOnAdd}
				onAddGroup={mockOnAddGroup}
			/>
		);

		const addAllBtn = screen.getByLabelText('Add disposition and all children');
		fireEvent.click(addAllBtn);
		expect(mockOnAddGroup).toHaveBeenCalledWith(node);
	});
});

export {};
