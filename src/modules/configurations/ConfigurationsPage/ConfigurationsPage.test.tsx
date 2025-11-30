import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConfigurationsPage from './ConfigurationsPage';
import * as rr from 'react-router';
import { vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

describe('ConfigurationsPage', () => {
	it('renders with default tab client-configs and navigates on tab click', () => {
		const navigateMock = vi.fn();
		vi.spyOn(rr, 'useNavigate').mockReturnValue(navigateMock as any);
		vi.spyOn(rr, 'useLocation').mockReturnValue({
			pathname: '/configurations',
		} as any);

		renderWithProviders(<ConfigurationsPage />);

		const globalTab = screen.getByRole('tab', { name: /global/i });
		expect(globalTab).toBeInTheDocument();

		fireEvent.click(screen.getByRole('tab', { name: /campaign/i }));
		expect(navigateMock).toHaveBeenCalledWith(
			'/configurations/campaign-predefined-params'
		);
	});
});
