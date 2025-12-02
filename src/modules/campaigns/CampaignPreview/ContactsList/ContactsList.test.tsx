import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactsList from './ContactsList';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('ContactsList', () => {
	it('renders header and subtitle', () => {
		renderWithProviders(<ContactsList />);

		expect(screen.getByText('Contacts list')).toBeInTheDocument();
		expect(
			screen.getByText('These contacts have been selected for this campaign.')
		).toBeInTheDocument();
	});

	it('renders provided contact list', () => {
		renderWithProviders(
			<ContactsList
				contactList={{
					id: 42,
					name: 'custom_list',
					totalContacts: 1200,
					status: 'active',
					source: 'csv',
				}}
			/>
		);

		expect(screen.getByText('custom_list')).toBeInTheDocument();
		// number is rendered using toLocaleString
		expect(screen.getByText('1,200')).toBeInTheDocument();
	});

	it('renders fallback mock lists and metrics', () => {
		renderWithProviders(<ContactsList />);

		// Fallback list has two entries with same name
		expect(screen.getAllByText('bancopopular_contactos')).toHaveLength(2);

		// Metrics
		expect(screen.getByText('Bound Rate')).toBeInTheDocument();
		expect(screen.getByText('82/100')).toBeInTheDocument();
		expect(screen.getByText('Contact Quality')).toBeInTheDocument();
		expect(screen.getByText('28%')).toBeInTheDocument();
	});
});

// intentionally left blank
