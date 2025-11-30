import { describe, it, expect } from 'vitest';
import ContactListSkeleton from './ContactListSkeleton';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('ContactListSkeleton', () => {
	it('renders default number of skeleton rows', () => {
		const { container } = renderWithProviders(<ContactListSkeleton />);
		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(10);
	});

	it('respects custom row count', () => {
		const { container } = renderWithProviders(<ContactListSkeleton rows={3} />);
		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(3);
	});
});
