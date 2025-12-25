import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { SelectActiveContactList } from './SelectActiveContactList';

describe('SelectActiveContactList', () => {
	const defaultProps = {
		onClose: vi.fn(),
		onRefresh: vi.fn(),
	};

	it('renders correctly', () => {
		renderWithProviders(<SelectActiveContactList {...defaultProps} />);

		expect(
			screen.getByText('form.contacts.list.selectActiveDescription')
		).toBeInTheDocument();
	});
});
