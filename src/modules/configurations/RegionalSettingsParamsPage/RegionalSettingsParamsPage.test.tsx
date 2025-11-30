import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RegionalSettingsParamsPage from './RegionalSettingsParamsPage';
import * as queries from '~/queries/useClientConfigs';
import useRegionalSettingsParamsStore from './store/useRegionalSettingsParamsStore';
import { screen, fireEvent } from '@testing-library/react';
import { vi, type Mock } from 'vitest';

vi.mock('./store/useRegionalSettingsParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
}));

describe('RegionalSettingsParamsPage', () => {
	it('renders view mode and toggles edit mode', () => {
		// mock client config query
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
			},
		} as any);

		const setMode = vi.fn();
		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode,
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		expect(
			screen.getByRole('button', { name: /Edit Settings/i })
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: /Edit Settings/i }));
		expect(setMode).toHaveBeenCalledWith('edit');
	});

	it('shows cancel button in edit mode', () => {
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
			},
		} as any);

		const setMode = vi.fn();
		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'edit',
			setMode,
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
		expect(cancelButtons.length).toBeGreaterThan(0);
		fireEvent.click(cancelButtons[0]);
		expect(setMode).toHaveBeenCalledWith('view');
	});
});
