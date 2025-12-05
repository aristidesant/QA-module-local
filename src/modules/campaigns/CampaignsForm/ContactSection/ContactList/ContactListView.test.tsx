import { screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { ContactListView } from './ContactListView';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { MemoryRouter } from 'react-router';

// Mock usePermissions
const mockCanPerformAction = vi.fn((_module: any, _perm: any) => true);
vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

// Mock campaignsStore
const mockSetRightComponent = vi.fn();
vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn((selector: any) => {
		const store = { setRightComponent: mockSetRightComponent };
		if (typeof selector === 'function') return selector(store);
		return store;
	}),
}));

// Minimal ContactGroup type
const sampleContactList = { id: 1, name: 'Test List' } as any;

describe('ContactListView permission behavior', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCanPerformAction.mockReturnValue(true);
	});

	it('shows add button when user has CREATE permission and isActive true', () => {
		renderWithProviders(
			<MemoryRouter>
				<ContactListView
					contactGroups={[sampleContactList]}
					campaignId={1}
					onUpdateComplete={() => {}}
					isActive={true}
				/>
			</MemoryRouter>
		);

		expect(
			screen.queryByTestId('header-add-contact-list-btn')
		).toBeInTheDocument();
	});

	it('hides add button when user lacks CREATE permission', () => {
		mockCanPerformAction.mockReturnValue(false);

		renderWithProviders(
			<MemoryRouter>
				<ContactListView
					contactGroups={[sampleContactList]}
					campaignId={1}
					onUpdateComplete={() => {}}
					isActive={true}
				/>
			</MemoryRouter>
		);

		expect(
			screen.queryByTestId('header-add-contact-list-btn')
		).not.toBeInTheDocument();
	});

	it('hides add button when viewing inactive lists', () => {
		mockCanPerformAction.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter>
				<ContactListView
					contactGroups={[sampleContactList]}
					campaignId={1}
					onUpdateComplete={() => {}}
					isActive={false}
				/>
			</MemoryRouter>
		);

		expect(
			screen.queryByTestId('header-add-contact-list-btn')
		).not.toBeInTheDocument();
	});
});

export {};
