import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import ClientSelectionModal from './ClientSelectionModal';

vi.mock('~/queries/authQueries', () => ({
	useSelectClient: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

import * as authQueries from '~/queries/authQueries';

const mockUseSelectClient = vi.mocked(authQueries.useSelectClient);

const makeClients = (n = 3) =>
	Array.from({ length: n }).map((_, i) => ({
		clientId: i + 1, // number
		clientName: `Client ${i}`,
		clientIdentifier: `client-${i}`,
		roles: ['User'],
	}));

describe('ClientSelectionModal', () => {
	const defaultProps = {
		opened: true,
		onClose: vi.fn(),
		availableClients: makeClients(6),
		preAuthToken: 'token',
		onSuccess: vi.fn(),
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('shows search input only when clients > 5', () => {
		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		expect(screen.queryByPlaceholderText('Search organizations...')).toBeNull();

		// unmount previous render and render with a larger client list
		cleanup();
		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(6)}
			/>
		);

		expect(
			screen.getByPlaceholderText('Search organizations...')
		).toBeInTheDocument();
	});

	test('filters clients by name or identifier', async () => {
		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(6)}
			/>
		);

		const search = screen.getByPlaceholderText('Search organizations...');
		await userEvent.type(search, 'Client 4');

		expect(screen.getByText('Client 4')).toBeInTheDocument();
		// non-matching client should not be visible
		expect(screen.queryByText('Client 0')).toBeNull();
	});

	test('selecting client that requires OTP shows OTP step', async () => {
		const mutateAsync = vi.fn().mockResolvedValue({ otpRequired: true });
		mockUseSelectClient.mockReturnValue({
			mutateAsync,
			isPending: false,
			data: undefined,
			error: null,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: 'idle',
			variables: undefined,
			reset: vi.fn(),
			mutate: vi.fn(),
		} as any);

		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		await userEvent.click(screen.getByText('Client 1'));

		await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

		expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
		expect(screen.getByText('Client 1')).toBeInTheDocument();
	});

	test('selecting client that returns access token calls onSuccess and closes', async () => {
		const mutateAsync = vi.fn().mockResolvedValue({ accessToken: 'abc' });
		mockUseSelectClient.mockReturnValue({
			mutateAsync,
			isPending: false,
			data: undefined,
			error: null,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: 'idle',
			variables: undefined,
			reset: vi.fn(),
			mutate: vi.fn(),
		} as any);

		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		await userEvent.click(screen.getByText('Client 2'));

		await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

		expect(defaultProps.onSuccess).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('shows error if select client fails', async () => {
		const mutateAsync = vi.fn().mockRejectedValue(new Error('Server failed'));
		mockUseSelectClient.mockReturnValue({
			mutateAsync,
			isPending: false,
			data: undefined,
			error: null,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: 'idle',
			variables: undefined,
			reset: vi.fn(),
			mutate: vi.fn(),
		} as any);

		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		await userEvent.click(screen.getByText('Client 0'));

		await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

		expect(
			screen.getByText('Unable to select organization')
		).toBeInTheDocument();
		expect(screen.getByText('Server failed')).toBeInTheDocument();
	});

	test('OTP submission success calls onSuccess and closes', async () => {
		// first call (select client) returns otpRequired true
		const mutateAsync = vi
			.fn()
			.mockResolvedValueOnce({ otpRequired: true })
			.mockResolvedValueOnce({ accessToken: 'abc' });

		mockUseSelectClient.mockReturnValue({
			mutateAsync,
			isPending: false,
			data: undefined,
			error: null,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: 'idle',
			variables: undefined,
			reset: vi.fn(),
			mutate: vi.fn(),
		} as any);

		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		// select a client -> move to OTP
		await userEvent.click(screen.getByText('Client 1'));
		await waitFor(() =>
			expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
		);

		// find the pin inputs and type 6 digits
		const pin = screen.getByLabelText('Verification Code');
		const inputs = pin.querySelectorAll('input');
		for (let i = 0; i < inputs.length; i++) {
			await userEvent.type(inputs[i], String(i + 1));
		}

		// The PinInput triggers submit on complete; wait for mutate to have been called twice
		await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2));

		expect(defaultProps.onSuccess).toHaveBeenCalled();
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('OTP submission failure shows verification error', async () => {
		const mutateAsync = vi
			.fn()
			.mockResolvedValueOnce({ otpRequired: true })
			.mockRejectedValueOnce(new Error('Wrong code'));

		mockUseSelectClient.mockReturnValue({
			mutateAsync,
			isPending: false,
			data: undefined,
			error: null,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: 'idle',
			variables: undefined,
			reset: vi.fn(),
			mutate: vi.fn(),
		} as any);

		renderWithProviders(
			<ClientSelectionModal
				{...defaultProps}
				availableClients={makeClients(3)}
			/>
		);

		// go to OTP step
		await userEvent.click(screen.getByText('Client 1'));
		await waitFor(() =>
			expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
		);

		const pin = screen.getByLabelText('Verification Code');
		const inputs = pin.querySelectorAll('input');
		for (let i = 0; i < inputs.length; i++) {
			await userEvent.type(inputs[i], '9');
		}

		await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2));

		expect(screen.getByText('Verification failed')).toBeInTheDocument();
		expect(screen.getByText('Wrong code')).toBeInTheDocument();
	});
});
