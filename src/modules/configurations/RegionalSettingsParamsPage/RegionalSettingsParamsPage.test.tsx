import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RegionalSettingsParamsPage from './RegionalSettingsParamsPage';
import * as queries from '~/queries/useClientConfigs';
import useRegionalSettingsParamsStore from './store/useRegionalSettingsParamsStore';

vi.mock('./store/useRegionalSettingsParamsStore', () => ({
	__esModule: true,
	default: vi.fn(),
}));
const mockIsMasterClient = vi.fn().mockReturnValue(true);
vi.mock('~/hooks/useIsMasterClient', () => ({
	useIsMasterClient: () => mockIsMasterClient(),
}));

describe('RegionalSettingsParamsPage', () => {
	it('opens edit modal when clicking edit action', async () => {
		// mock client config query
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: 2,
			},
		} as any);

		const setMode = vi.fn();
		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode,
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		fireEvent.click(screen.getByLabelText('Edit settings'));

		await waitFor(() => {
			expect(
				screen.getByRole('dialog', { name: /Edit regional settings/i })
			).toBeInTheDocument();
		});
		expect(setMode).toHaveBeenCalledWith('edit');
	});

	it('closes edit modal on cancel', async () => {
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: 2,
			},
		} as any);

		const setMode = vi.fn();
		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'edit',
			setMode,
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		fireEvent.click(screen.getByLabelText('Edit settings'));

		const dialog = await screen.findByRole('dialog', {
			name: /Edit regional settings/i,
		});

		fireEvent.click(within(dialog).getByRole('button', { name: /Cancel/i }));

		await waitFor(() => {
			expect(setMode).toHaveBeenCalledWith('view');
		});
	});

	it('hides edit button when not allowed (non-master/global)', () => {
		mockIsMasterClient.mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: null,
			},
		} as any);

		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode: vi.fn(),
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		expect(screen.queryByLabelText('Edit settings')).toBeNull();
		expect(screen.getByLabelText('Create override')).toBeInTheDocument();
	});

	it('shows InlineNotice when global and non-master and shows create override', () => {
		mockIsMasterClient.mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: null,
			},
		} as any);

		vi.spyOn(queries, 'useCreateClientConfig').mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
			isPending: false,
		} as any);

		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode: vi.fn(),
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		expect(screen.getByText(/Global configuration/i)).toBeInTheDocument();
		expect(screen.getByLabelText('Create override')).toBeInTheDocument();
	});

	it('can create override when global and non-master', async () => {
		mockIsMasterClient.mockReturnValue(false);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: null,
			},
		} as any);

		const mutateCreate = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useCreateClientConfig').mockReturnValue({
			mutateAsync: mutateCreate,
			isPending: false,
		} as any);

		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode: vi.fn(),
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		fireEvent.click(screen.getByLabelText('Create override'));

		await waitFor(() => {
			expect(mutateCreate).toHaveBeenCalled();
		});
	});

	it('can delete override for client config', async () => {
		// client-specific override
		mockIsMasterClient.mockReturnValue(true);
		vi.spyOn(queries, 'useClientConfigByName').mockReturnValue({
			data: {
				name: 'regional_settings',
				value: JSON.stringify({ timezone: 'UTC', locale: 'en-US' }),
				clientId: 1,
			},
		} as any);

		const deleteMutate = vi.fn().mockResolvedValue({});
		vi.spyOn(queries, 'useDeleteClientConfig').mockReturnValue({
			mutateAsync: deleteMutate,
			isPending: false,
		} as any);

		const setMode = vi.fn();
		(useRegionalSettingsParamsStore as unknown as Mock).mockReturnValue({
			mode: 'view',
			setMode,
		});

		renderWithProviders(<RegionalSettingsParamsPage />);

		fireEvent.click(screen.getByLabelText('Delete override'));

		await waitFor(() => {
			expect(screen.getByText('Delete configuration')).toBeInTheDocument();
		});

		const dialog = screen.getByRole('dialog', {
			name: /Delete configuration/i,
		});
		const dialogWithin = within(dialog);
		fireEvent.click(
			dialogWithin.getByRole('button', { name: /Delete override/i })
		);

		await waitFor(() => {
			expect(deleteMutate).toHaveBeenCalled();
		});
	});
});
