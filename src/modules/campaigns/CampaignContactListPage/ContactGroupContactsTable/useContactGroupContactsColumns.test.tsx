import { render, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useContactGroupContactsColumns from './useContactGroupContactsColumns';

vi.mock('~/utils/dateUtils', () => ({
	timeAgo: () => 'moments ago',
}));

const contact: any = {
	id: 1,
	firstName: 'John',
	lastName: 'Smith',
	status: 'ACTIVE',
	emails: ['john@example.com'],
	phoneNumbers: [{ phoneNumber: '+18095551234' }],
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-02-01T00:00:00Z',
};

describe('useContactGroupContactsColumns', () => {
	it('renders name, status and updated columns', () => {
		const { result } = renderHook(() => useContactGroupContactsColumns());
		const columns = result.current;

		const nameCell = (columns[0] as any).cell?.({
			row: { original: contact },
		} as any);
		const statusCell = (columns[2] as any).cell?.({
			row: { original: contact },
		} as any);
		const updatedCell = (columns[4] as any).cell?.({
			row: { original: contact },
		} as any);

		const { getByText } = render(
			<>
				{nameCell}
				{statusCell}
				{updatedCell}
			</>
		);

		expect(getByText('John Smith')).toBeInTheDocument();
		expect(getByText('ACTIVE')).toBeInTheDocument();
		expect(getByText('moments ago')).toBeInTheDocument();
		expect(getByText('Feb 1, 2024')).toBeInTheDocument();
	});

	it('handles missing identifier gracefully', () => {
		const { result } = renderHook(() => useContactGroupContactsColumns());
		const identifierCell = (result.current[1] as any).cell?.({
			row: {
				original: { ...contact, identifier: undefined, identifierType: '' },
			},
		} as any);

		const { getByText } = render(<>{identifierCell}</>);
		expect(getByText('—')).toBeInTheDocument();
	});
});
