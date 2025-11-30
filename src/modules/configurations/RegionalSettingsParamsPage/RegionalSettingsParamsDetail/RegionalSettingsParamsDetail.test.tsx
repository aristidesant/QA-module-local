import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RegionalSettingsParamsDetail from './RegionalSettingsParamsDetail';
import { screen } from '@testing-library/react';

describe('RegionalSettingsParamsDetail', () => {
	it('renders timezone and locale values', () => {
		renderWithProviders(
			<RegionalSettingsParamsDetail
				regionalSettings={{ timezone: 'UTC', locale: 'en-US' }}
			/>
		);

		expect(screen.getAllByText('UTC').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('en-US').length).toBeGreaterThanOrEqual(1);
	});

	it('renders fallback when values are missing', () => {
		renderWithProviders(
			<RegionalSettingsParamsDetail
				regionalSettings={{ timezone: '', locale: '' }}
			/>
		);

		expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
	});
});
