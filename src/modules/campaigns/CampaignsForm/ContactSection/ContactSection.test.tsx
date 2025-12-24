import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactSection } from './ContactSection';

// Mock child component
vi.mock('./ContactList', () => ({
	ContactListContainer: ({ isActive }: { isActive: boolean }) => (
		<div data-testid={`contact-list-${isActive ? 'active' : 'inactive'}`}>
			{isActive ? 'Active List' : 'Inactive List'}
		</div>
	),
}));

describe('ContactSection', () => {
	it('renders tabs correctly', () => {
		renderWithProviders(<ContactSection />);

		expect(screen.getByText('Active Lists')).toBeInTheDocument();
		expect(screen.getByText('Inactive Lists')).toBeInTheDocument();
	});

	it('toggles content on tab click', async () => {
		renderWithProviders(<ContactSection />);

		// Initially active tab is selected
		expect(screen.getByTestId('contact-list-active')).toBeInTheDocument();

		// Click inactive tab
		const inactiveTab = screen.getByText('Inactive Lists');
		await userEvent.click(inactiveTab);

		expect(screen.getByTestId('contact-list-inactive')).toBeInTheDocument();
	});
});
