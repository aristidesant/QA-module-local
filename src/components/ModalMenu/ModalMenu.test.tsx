import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ModalMenu, ModalMenuItem } from './ModalMenu';

describe('ModalMenu', () => {
	const items: ModalMenuItem[] = [
		{ id: 'one', label: 'First' },
		{ id: 'two', label: 'Second' },
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders title, badge, and items', () => {
		renderWithProviders(
			<ModalMenu
				items={items}
				activeId={'one'}
				onSelect={() => {}}
				title='Test Sections'
			/>
		);

		// Title + badge
		expect(screen.getByText('Test Sections')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();

		// Items
		expect(screen.getByText('First')).toBeInTheDocument();
		expect(screen.getByText('Second')).toBeInTheDocument();
	});

	it('calls onSelect when clicking an item and marks active', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();

		renderWithProviders(
			<ModalMenu items={items} activeId={'one'} onSelect={onSelect} />
		);

		const second = screen.getByText('Second');
		await user.click(second);
		expect(onSelect).toHaveBeenCalledWith('two');

		// ensure active attribute exists for the active item
		const active = document.querySelector('[data-active="true"]');
		expect(active).not.toBeNull();
		expect(active).toHaveTextContent('First');
	});
});

export {};
