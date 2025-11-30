import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import renderWithProviders from '~/test-utils/renderWithProviders';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
	it('renders items and separators', () => {
		const items = [
			{ label: 'Home', path: '/' },
			{ label: 'Page', path: '/page' },
			{ label: 'Current' },
		];

		renderWithProviders(
			<MemoryRouter>
				<Breadcrumb items={items} />
			</MemoryRouter>
		);

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Page')).toBeInTheDocument();
		expect(screen.getByText('Current')).toBeInTheDocument();

		// Links for non-last
		const link = screen.getByText('Home').closest('a');
		expect(link).toBeInTheDocument();

		// Last item is not a link
		const last = screen.getByText('Current').closest('a');
		expect(last).not.toBeInTheDocument();
	});
});

export {};
