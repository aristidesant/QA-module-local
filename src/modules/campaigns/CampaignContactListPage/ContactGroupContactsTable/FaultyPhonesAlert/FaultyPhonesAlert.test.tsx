import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FaultyPhonesAlert from './FaultyPhonesAlert';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const faultyContacts = [
	{
		id: 1,
		firstName: 'Jane',
		lastName: 'Doe',
		phoneNumbers: [
			{
				id: 10,
				phoneNumber: '+18090000000',
				validationError: { code: 'BAD', message: 'Invalid', rawPhone: '' },
			},
		],
	},
];

const refetchFaulty = vi.fn();
const refetchContacts = vi.fn();
let faultyState: any;
let modalProps: any;
const invalidateQueries = vi.fn();

vi.mock('../FaultyPhonesModal', () => ({
	default: (props: {
		opened: boolean;
		onClose: () => void;
		onAfterUpdate?: () => void;
	}) => {
		modalProps = props;
		if (!props.opened) return null;
		return (
			<div data-testid='faulty-modal'>
				<button onClick={props.onClose}>Close</button>
				<button onClick={props.onAfterUpdate}>AfterUpdate</button>
			</div>
		);
	},
}));

vi.mock('~/queries/contactsQueries', () => ({
	useGetContactGroupContactsWithPhoneValidationErrors: () => faultyState,
	useGetContactGroupContacts: () => ({
		refetch: refetchContacts,
	}),
}));

vi.mock('@tanstack/react-query', async () => {
	const actual = await import('@tanstack/react-query');
	return { ...actual, useQueryClient: () => ({ invalidateQueries }) };
});

describe('FaultyPhonesAlert', () => {
	beforeEach(() => {
		faultyState = {
			data: faultyContacts,
			isLoading: false,
			isFetching: false,
			refetch: refetchFaulty,
		};
		invalidateQueries.mockReset();
		refetchContacts.mockReset();
		refetchFaulty.mockReset();
	});

	it('renders loading state', () => {
		faultyState = {
			data: undefined,
			isLoading: true,
			isFetching: true,
			refetch: refetchFaulty,
		};

		renderWithProviders(<FaultyPhonesAlert contactGroupId={1} />);
		expect(
			screen.getByText('Checking for phone number validation errors...')
		).toBeInTheDocument();
	});

	it('shows alert and opens modal', async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaultyPhonesAlert contactGroupId={2} />);

		expect(screen.getByText('Faulty Phone Numbers')).toBeInTheDocument();

		await user.click(
			screen.getByRole('button', {
				name: 'View Details',
			})
		);
		expect(screen.getByTestId('faulty-modal')).toBeInTheDocument();
	});

	it('shows fetching state when refreshing', () => {
		faultyState = {
			...faultyState,
			isFetching: true,
		};

		renderWithProviders(<FaultyPhonesAlert contactGroupId={3} />);
		expect(screen.getByText('Refreshing faulty phones…')).toBeInTheDocument();
	});

	it('returns null when no faulty contacts', () => {
		faultyState = {
			data: [],
			isLoading: false,
			isFetching: false,
			refetch: refetchFaulty,
		};

		renderWithProviders(<FaultyPhonesAlert contactGroupId={4} />);
		expect(screen.queryByText('Faulty Phone Numbers')).not.toBeInTheDocument();
	});

	it('refetches data after updates inside modal', async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaultyPhonesAlert contactGroupId={5} />);

		await user.click(
			screen.getByRole('button', {
				name: 'View Details',
			})
		);
		expect(modalProps.opened).toBe(true);

		await user.click(screen.getByRole('button', { name: 'AfterUpdate' }));

		expect(refetchFaulty).toHaveBeenCalled();
		expect(refetchContacts).toHaveBeenCalled();
		expect(invalidateQueries).toHaveBeenCalledWith({
			queryKey: ['contactGroupContactsWithPhoneValidationErrors', 5],
		});
		expect(invalidateQueries).toHaveBeenCalledWith({
			queryKey: ['contactGroupContacts', 5],
		});
	});
});
