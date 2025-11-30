import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import renderWithProviders from '~/test-utils/renderWithProviders';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
	it('renders title and description', () => {
		renderWithProviders(<PageHeader title='T' description='D' />);
		expect(screen.getByText('T')).toBeInTheDocument();
		expect(screen.getByText('D')).toBeInTheDocument();
	});

	it('renders breadcrumbs and actions', () => {
		const breadcrumbs = [{ label: 'Home', path: '/' }];
		renderWithProviders(
			<MemoryRouter>
				<PageHeader breadcrumbs={breadcrumbs} actions={<div>Act</div>} />
			</MemoryRouter>
		);

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Act')).toBeInTheDocument();
	});
});

export {};
