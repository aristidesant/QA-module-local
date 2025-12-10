import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RegionalSettingsParamsForm from './RegionalSettingsParamsForm';
import { vi } from 'vitest';

import * as queryHooks from '~/queries/useClientConfigs';
import { notifications } from '@mantine/notifications';

describe('RegionalSettingsParamsForm', () => {
	beforeEach(() => {
		vi.spyOn(notifications, 'show').mockImplementation(() => '');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('shows error notification when config is undefined', async () => {
		renderWithProviders(
			<RegionalSettingsParamsForm
				regionalSettings={{ timezone: 'UTC', locale: 'en-US' }}
				config={undefined}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: /Update Settings/i }));

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'Error' })
			);
		});
	});

	it('calls update mutation and onCancel when config is present', async () => {
		const mutateAsync = vi.fn().mockResolvedValue({});
		vi.spyOn(queryHooks, 'useUpdateClientConfig').mockReturnValue({
			mutateAsync,
			isPending: false,
		} as any);

		const onCancel = vi.fn();
		renderWithProviders(
			<RegionalSettingsParamsForm
				regionalSettings={{ timezone: 'UTC', locale: 'en-US' }}
				config={{
					id: 1,
					clientId: 1,
					userId: 1,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					deletedAt: null,
					name: 'regional_settings',
					description: 'desc',
					type: 'json',
					value: '{}',
				}}
				onCancel={onCancel}
			/>
		);

		fireEvent.change(screen.getByLabelText(/Timezone/i), {
			target: { value: 'America/Santo_Domingo' },
		});
		fireEvent.change(screen.getByLabelText(/Locale/i), {
			target: { value: 'es-DO' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Update Settings/i }));

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
			expect(onCancel).toHaveBeenCalled();
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'Success' })
			);
		});
	});
});

it('calls create mutation when saveStrategy is create', async () => {
	const createMutateAsync = vi.fn().mockResolvedValue({});
	vi.spyOn(queryHooks, 'useCreateClientConfig').mockReturnValue({
		mutateAsync: createMutateAsync,
		isPending: false,
	} as any);

	const onCancel = vi.fn();
	renderWithProviders(
		<RegionalSettingsParamsForm
			regionalSettings={{ timezone: 'UTC', locale: 'en-US' }}
			config={{
				id: 1,
				clientId: 1,
				userId: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				name: 'regional_settings',
				description: 'desc',
				type: 'json',
				value: '{}',
			}}
			onCancel={onCancel}
			saveStrategy='create'
		/>
	);

	fireEvent.change(screen.getByLabelText(/Timezone/i), {
		target: { value: 'America/Santo_Domingo' },
	});
	fireEvent.change(screen.getByLabelText(/Locale/i), {
		target: { value: 'es-DO' },
	});

	fireEvent.click(screen.getByRole('button', { name: /Create Settings/i }));

	await waitFor(() => {
		expect(createMutateAsync).toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
	});
});
