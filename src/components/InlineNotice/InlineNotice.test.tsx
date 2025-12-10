import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import InlineNotice from './InlineNotice';
import { IconAlertCircle } from '@tabler/icons-react';

describe('InlineNotice', () => {
	it('renders title and description', () => {
		renderWithProviders(
			<InlineNotice
				title='Test Title'
				description='Test Description'
				icon={<IconAlertCircle />}
			/>
		);

		expect(screen.getByText('Test Title')).toBeInTheDocument();
		expect(screen.getByText('Test Description')).toBeInTheDocument();
	});
});
