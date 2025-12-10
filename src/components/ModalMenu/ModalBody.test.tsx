import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ModalBody } from './ModalBody';

describe('ModalBody', () => {
	it('renders the menu and children content', () => {
		const menu = <div data-testid='menu-col'>Menu content</div>;
		const children = <div data-testid='children-col'>Body content</div>;

		renderWithProviders(<ModalBody menu={menu}>{children}</ModalBody>);

		expect(screen.getByTestId('menu-col')).toBeInTheDocument();
		expect(screen.getByTestId('children-col')).toBeInTheDocument();
		expect(screen.getByText('Menu content')).toBeInTheDocument();
		expect(screen.getByText('Body content')).toBeInTheDocument();
	});
});

export {};
