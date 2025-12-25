import { cleanup, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactDetails } from './ContactDetails';

const baseContact = {
	id: 'contact-1',
	name: 'John Doe',
	phone: '+34 612 345 678',
	language: 'Spanish',
	initials: 'JD',
};

describe('ContactDetails', () => {
	it('renders primary information and metrics', () => {
		renderWithProviders(
			<ContactDetails
				contact={{
					...baseContact,
					email: 'john.doe@example.com',
					location: 'Madrid, Spain',
					engagementLevel: 92,
					qualificationScore: 68,
					sentiment: { positive: 12, neutral: 3, negative: 1 },
				}}
			/>
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Spanish')).toBeInTheDocument();
		expect(screen.getByText('Primary phone number')).toBeInTheDocument();
		expect(screen.getByText('+34 612 345 678')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
		expect(screen.getByText('Location')).toBeInTheDocument();
		expect(screen.getByText('Madrid, Spain')).toBeInTheDocument();
		expect(screen.getByText('Engagement Level')).toBeInTheDocument();
		expect(screen.getByText('Reviews qualification')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('shows phone list with validation errors', () => {
		renderWithProviders(
			<ContactDetails
				contact={{
					...baseContact,
					email: 'john.doe@example.com',
					location: 'Barcelona',
					phones: [
						{ phoneNumber: '+34 600 111 222' },
						{
							phoneNumber: '+34 699 888 777',
							validationError: {
								code: 'INVALID_NUMBER',
								message: 'Number missing country code',
								rawPhone: '+34 699 888 777',
							},
						},
					],
				}}
			/>
		);

		expect(screen.getByText('Phone Numbers (2)')).toBeInTheDocument();
		expect(screen.getByText('+34 600 111 222')).toBeInTheDocument();
		expect(screen.getByText('+34 699 888 777')).toBeInTheDocument();
		expect(screen.getByText('INVALID_NUMBER')).toBeInTheDocument();
		expect(screen.getByText('Number missing country code')).toBeInTheDocument();
	});

	it('does not render optional cards when data is missing', () => {
		renderWithProviders(<ContactDetails contact={baseContact} />);

		expect(screen.queryByText('Email')).not.toBeInTheDocument();
		expect(screen.queryByText('Location')).not.toBeInTheDocument();
		expect(screen.queryByText(/Phone Numbers/)).not.toBeInTheDocument();
		expect(screen.getByText('87')).toBeInTheDocument();
		expect(screen.getByText('75%')).toBeInTheDocument();
		expect(screen.getByText('2113')).toBeInTheDocument();
		expect(screen.getByText('45')).toBeInTheDocument();
		expect(screen.getByText('16')).toBeInTheDocument();
		expect(
			screen.getAllByText(
				'Measures how engaged John Doe is with your campaigns.'
			)
		).toHaveLength(2);
	});

	it('handles engagement and qualification thresholds', () => {
		renderWithProviders(
			<ContactDetails
				contact={{
					...baseContact,
					engagementLevel: 82,
					qualificationScore: 85,
				}}
			/>
		);

		expect(screen.getByText('82')).toBeInTheDocument();
		expect(screen.getByText('85%')).toBeInTheDocument();

		cleanup();

		renderWithProviders(
			<ContactDetails
				contact={{
					...baseContact,
					engagementLevel: 70,
					qualificationScore: 62,
				}}
			/>
		);

		expect(screen.getByText('70')).toBeInTheDocument();
		expect(screen.getByText('62%')).toBeInTheDocument();

		cleanup();

		renderWithProviders(
			<ContactDetails
				contact={{
					...baseContact,
					engagementLevel: 52,
					qualificationScore: 41,
				}}
			/>
		);

		expect(screen.getByText('52')).toBeInTheDocument();
		expect(screen.getByText('41%')).toBeInTheDocument();
	});
});
