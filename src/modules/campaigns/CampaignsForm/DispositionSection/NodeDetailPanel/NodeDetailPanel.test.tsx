import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import NodeDetailPanel from './NodeDetailPanel';

const mockSetRightComponent = vi.fn();

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: () => ({ setRightComponent: mockSetRightComponent }),
}));

describe('NodeDetailPanel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders node name and description and close button calls setRightComponent', () => {
		const node = {
			id: 1,
			name: 'Test Node',
			description: 'Test desc',
			requiresReschedule: true,
			isInvalidatesNumber: true,
		} as any;
		const parent = { id: 9, name: 'Parent' } as any;

		renderWithProviders(<NodeDetailPanel node={node} parentNode={parent} />);

		expect(screen.getByText('Test Node')).toBeInTheDocument();
		expect(screen.getByText('Test desc')).toBeInTheDocument();
		// Requires reschedule and invalidates number cards should be present
		expect(screen.getByText(/Requires Reschedule/i)).toBeInTheDocument();
		expect(screen.getByText(/Invalidates Number/i)).toBeInTheDocument();

		// Close button
		const closeBtn = screen.getByRole('button');
		fireEvent.click(closeBtn);
		expect(mockSetRightComponent).toHaveBeenCalledWith(null);
	});
});

export {};
