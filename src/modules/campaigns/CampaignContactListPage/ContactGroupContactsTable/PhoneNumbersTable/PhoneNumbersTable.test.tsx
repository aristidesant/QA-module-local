import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PhoneNumbersTable from './PhoneNumbersTable';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		emptyMessage,
	}: {
		data: { phoneNumber: string }[];
		emptyMessage?: string;
	}) => (
		<div data-testid='base-table'>
			{data.length === 0 && <span>{emptyMessage}</span>}
			{data.map((row) => (
				<div key={row.phoneNumber}>{row.phoneNumber}</div>
			))}
		</div>
	),
}));

describe('PhoneNumbersTable', () => {
	it('passes phone numbers to BaseTable', () => {
		renderWithProviders(
			<PhoneNumbersTable
				phoneNumbers={[
					{ phoneNumber: '+18095551234', retryCounter: 0 },
					{ phoneNumber: '+18093331234', retryCounter: 1 },
				]}
			/>
		);

		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByText('+18095551234')).toBeInTheDocument();
		expect(screen.getByText('+18093331234')).toBeInTheDocument();
	});

	it('renders empty message when no data', () => {
		renderWithProviders(<PhoneNumbersTable phoneNumbers={[]} />);
		expect(screen.getByText('No phone numbers available')).toBeInTheDocument();
	});
});
