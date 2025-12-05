import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConfigurationsPage from './ConfigurationsPage';
import * as rr from 'react-router';
import { vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

const mockCanPerformAction = vi.fn();

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

describe('ConfigurationsPage', () => {
	afterEach(() => {
		mockCanPerformAction.mockReset();
	});

	it('renders with default tab client-configs and navigates on tab click', () => {
		const navigateMock = vi.fn();
		mockCanPerformAction.mockReturnValue(true);
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

	it('shows scheduler tab only with manage permission', () => {
		const navigateMock = vi.fn();
		mockCanPerformAction.mockReturnValue(true);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(navigateMock as any);
		vi.spyOn(rr, 'useLocation').mockReturnValue({
			pathname: '/configurations',
		} as any);

		renderWithProviders(<ConfigurationsPage />);

		fireEvent.click(screen.getByRole('tab', { name: /Scheduler/i }));
		expect(navigateMock).toHaveBeenCalledWith(
			'/configurations/scheduler-predefined-params'
		);
	});

	it('redirects away from scheduler tab when permission is missing', () => {
		const navigateMock = vi.fn();
		mockCanPerformAction.mockReturnValue(false);
		vi.spyOn(rr, 'useNavigate').mockReturnValue(navigateMock as any);
		vi.spyOn(rr, 'useLocation').mockReturnValue({
			pathname: '/configurations/scheduler-predefined-params',
		} as any);

		renderWithProviders(<ConfigurationsPage />);

		expect(navigateMock).toHaveBeenCalledWith(
			'/configurations/client-configs',
			{ replace: true }
		);
		expect(
			screen.queryByRole('tab', { name: /Scheduler/i })
		).not.toBeInTheDocument();
	});
});
