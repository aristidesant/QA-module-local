import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AccessDenied from './AccessDenied';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
	useNavigate: () => mockNavigate,
}));

describe('AccessDenied component', () => {
	it('renders and navigates back and to home', async () => {
		renderWithProviders(<AccessDenied />);

		const headings = screen.getAllByRole('heading', {
			name: /access denied/i,
		});
		expect(headings).toHaveLength(2);
		const descriptions = screen.getAllByText(
			'You do not have permission to access this page.'
		);
		expect(descriptions).toHaveLength(2);

		const goBackBtn = screen.getByRole('button', { name: /common\.goBack/i });
		const dashboardBtn = screen.getByRole('button', {
			name: /common\.goToHome/i,
		});

		await userEvent.click(goBackBtn);
		expect(mockNavigate).toHaveBeenCalledWith(-1);

		await userEvent.click(dashboardBtn);
		expect(mockNavigate).toHaveBeenCalledWith('/');
	});
});
