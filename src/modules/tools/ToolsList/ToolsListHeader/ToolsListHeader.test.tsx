import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToolsListHeader from './ToolsListHeader';
import { MantineProvider } from '@mantine/core';

const renderWithProvider = (component: React.ReactNode) => {
	return render(<MantineProvider>{component}</MantineProvider>);
};

import type { ToolCategoryModel } from '~/models/ToolCategoryModel';

describe('ToolsListHeader', () => {
	const mockCategory = {
		id: 1,
		name: 'Webhook',
	} as unknown as ToolCategoryModel;
	const mockOnCreate = vi.fn();

	it('renders category name correctly', () => {
		renderWithProvider(
			<ToolsListHeader category={mockCategory} onCreate={mockOnCreate} />
		);
		expect(screen.getByText('Webhook Tools')).toBeInTheDocument();
	});

	it('renders tool count when provided', () => {
		renderWithProvider(
			<ToolsListHeader
				category={mockCategory}
				onCreate={mockOnCreate}
				toolCount={5}
			/>
		);
		expect(screen.getByText('Webhook Tools (5)')).toBeInTheDocument();
	});

	it('calls onCreate when create button is clicked', () => {
		renderWithProvider(
			<ToolsListHeader category={mockCategory} onCreate={mockOnCreate} />
		);

		const createButton = screen.getByRole('button', {
			name: /create new tool/i,
		});
		fireEvent.click(createButton);

		expect(mockOnCreate).toHaveBeenCalledTimes(1);
	});
});
