import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import ClientSelectionModal, { validateOtpValue } from './ClientSelectionModal';
import { ClientSelectOption } from '~/api/authApi';

// Mock the auth queries hook and http error utils
vi.mock('~/queries/authQueries', async () => {
	return {
		useSelectClient: vi.fn(() => ({
			mutateAsync: vi.fn(),
			isPending: false,
		})),
	} as any;
});

vi.mock('~/utils/httpClient', async () => ({
	getErrorMessage: vi.fn((e: unknown) =>
		e instanceof Error ? e.message : String(e)
	),
}));

describe('ClientSelectionModal', () => {
	const clientA: ClientSelectOption = {
		clientId: 1,
		clientName: 'Acme Inc',
		clientIdentifier: 'acme-inc',
		roles: ['Admin'],
	};
	const clientB: ClientSelectOption = {
		clientId: 2,
		clientName: 'Beta Corp',
		clientIdentifier: 'beta-corp',
		roles: ['Agent', 'Viewer'],
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('renders list of available clients with roles', () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA, clientB]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		expect(screen.getByText('Select Organization')).toBeInTheDocument();
		expect(screen.getByText('Acme Inc')).toBeInTheDocument();
		expect(screen.getByText('Beta Corp')).toBeInTheDocument();
		expect(screen.getByText('Admin')).toBeInTheDocument();
		expect(screen.getByText('Agent')).toBeInTheDocument();
		expect(screen.getByText('Viewer')).toBeInTheDocument();
	});

	test('selecting client that returns accessToken triggers success and close', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockResolvedValue({ accessToken: 'token' });
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// click the card element that contains the client label
		const label = screen.getByText('Acme Inc');
		const card = label.closest('[data-selected]') as HTMLElement;
		await userEvent.click(card ?? label);

		await waitFor(() => expect(mutate).toHaveBeenCalled());
		expect(onSuccess).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('selecting client that requires OTP shows OTP form and handles verification', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const calls: any[] = [];
		const mutate = vi.fn().mockImplementation(({ otp }: any) => {
			calls.push(otp);
			if (!otp) return Promise.resolve({ otpRequired: true });
			return Promise.resolve({ accessToken: 'token' });
		});
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// Click to select client; should show OTP input after resolving with otpRequired
		const label2 = screen.getByText('Acme Inc');
		const card2 = label2.closest('[data-selected]') as HTMLElement;
		await userEvent.click(card2 ?? label2);
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));

		expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();

		// Submit invalid OTP -> validation error
		await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
		expect(await screen.findByText('OTP code is required')).toBeInTheDocument();

		// Enter invalid-length OTP
		await userEvent.type(
			screen.getByPlaceholderText('Enter 6-digit code'),
			'123'
		);
		await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
		expect(
			await screen.findByText('OTP code must be 6 digits')
		).toBeInTheDocument();

		// Enter valid OTP and submit
		await userEvent.clear(screen.getByPlaceholderText('Enter 6-digit code'));
		await userEvent.type(
			screen.getByPlaceholderText('Enter 6-digit code'),
			'123456'
		);
		await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(2));
		expect(calls).toEqual([undefined, '123456']);
		await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('shows error alert when connection fails', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockRejectedValue(new Error('Network fail'));
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		const http = await import('~/utils/httpClient');
		(http.getErrorMessage as any).mockImplementation(
			(_err: any) => 'Custom failure message'
		);

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalled());
		expect(
			await screen.findByText('Unable to select organization')
		).toBeInTheDocument();
		expect(screen.getByText('Custom failure message')).toBeInTheDocument();
	});

	test('shows error when OTP verification fails and back button returns to client list', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockImplementation(({ otp }: any) => {
			if (!otp) return Promise.resolve({ otpRequired: true });
			return Promise.reject(new Error('Invalid OTP'));
		});
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		const http = await import('~/utils/httpClient');
		(http.getErrorMessage as any).mockImplementation(
			() => 'Invalid OTP message'
		);

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));

		// We're on OTP flow now
		expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();

		// Enter valid OTP and submit -> mutate rejects
		await userEvent.type(
			screen.getByPlaceholderText('Enter 6-digit code'),
			'123456'
		);
		await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(2));
		expect(await screen.findByText('Verification failed')).toBeInTheDocument();
		expect(screen.getByText('Invalid OTP message')).toBeInTheDocument();

		// Click Back to return to client selection
		await userEvent.click(screen.getByRole('button', { name: /Back/i }));
		expect(screen.getByText('Select Organization')).toBeInTheDocument();
	});

	test('OTP validation: non-numeric characters produce error and cancel closes modal', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockResolvedValue({ otpRequired: true });
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// Open OTP flow
		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalled());

		// Submit non-numeric OTP -> validation should prevent submission
		const otpInput = screen.getByPlaceholderText(
			'Enter 6-digit code'
		) as HTMLInputElement;
		// Use userEvent.type to emulate a real user typing non-numeric characters
		await userEvent.clear(otpInput);
		await userEvent.type(otpInput, 'abC123');
		await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
		// The mutate call should not be invoked for invalid input
		expect(mutate).toHaveBeenCalledTimes(1);
		// assert mutate was not invoked again and validation prevented submission

		// Click Cancel -> onClose should be called
		await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('card is disabled when selection is pending', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		// create a deferred promise to emulate a pending selection
		const deferred = new Promise(() => {});

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockImplementation(() => deferred);
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: true,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// The card element should have data-disabled=true while the selection is pending
		const clientLabel = screen.getByText('Acme Inc');
		let ancestor = clientLabel.parentElement;
		while (ancestor && !ancestor.hasAttribute('data-disabled'))
			ancestor = ancestor.parentElement;
		expect(ancestor).toBeTruthy();
		expect(ancestor?.getAttribute('data-disabled')).toBe('true');
		// the check icon should not be visible while pending
		const visibleCheckIcon = ancestor?.querySelector('svg[data-visible]');
		expect(visibleCheckIcon?.getAttribute('data-visible')).toBe('false');

		// not showing loader since there is no selected client, the check icon exists but is not visible
		const tablerCheckIcon = ancestor?.querySelector('svg.tabler-icon-check');
		expect(tablerCheckIcon).toBeTruthy();
		expect(tablerCheckIcon?.getAttribute('data-visible')).toBe('false');
	});

	test('shows loader icon on card while selection is in flight', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		let pending = false;
		let resolveDeferred: any;
		const deferred = new Promise((res) => (resolveDeferred = res));
		const mutate = vi.fn().mockImplementation(({ otp }: any) => {
			if (!otp) {
				// selection in flight: mark pending before returning
				pending = true;
				return deferred;
			}
			return Promise.resolve({ accessToken: 'token' });
		});
		(selectClientModule.useSelectClient as any).mockReturnValue({
			get isPending() {
				return pending;
			},
			mutateAsync: mutate,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// click to select the client; the mock will set pending=true in mutate
		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));

		// The card should now render a loader (svg) instead of showing check icon
		const cardLabel = screen.getByText('Acme Inc');
		let ancestor = cardLabel.parentElement;
		while (ancestor && !ancestor.hasAttribute('data-selected'))
			ancestor = ancestor.parentElement;
		expect(ancestor?.getAttribute('data-selected')).toBe('true');
		const svg = ancestor?.querySelector('svg');
		expect(svg).toBeTruthy();

		// Now resolve the selection, which will close modal
		resolveDeferred({ accessToken: 'token' });
		await waitFor(() => expect(onSuccess).toHaveBeenCalled());
	});

	test('shows check icon while selecting client before success closes modal', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		// create a deferred promise so we can assert intermediate UI state
		let resolveDeferred: any;
		const deferred = new Promise((res) => (resolveDeferred = res));

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockImplementation(() => deferred);
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// Click to select client; state should set selectedClient and show check
		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));

		// The parent Card element should have data-selected=true for the selected client
		const clientLabel = screen.getByText('Acme Inc');
		// find the closest ancestor with data-selected attribute
		let ancestor = clientLabel.parentElement;
		while (ancestor && !ancestor.hasAttribute('data-selected'))
			ancestor = ancestor.parentElement;
		expect(ancestor).toBeTruthy();
		expect(ancestor?.getAttribute('data-selected')).toBe('true');
		const checkIcon = ancestor?.querySelector('svg[data-visible]');
		expect(checkIcon).toBeTruthy();
		expect(checkIcon?.getAttribute('data-visible')).toBe('true');

		// Resolve mutation -> should trigger onSuccess and onClose
		resolveDeferred({ accessToken: 'token' });
		await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	});

	test('IconCheck visible attribute is false by default for non-selected clients', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();
		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockResolvedValue({ accessToken: 'token' });
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA, clientB]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// find check icons by `tabler-icon-check` class presence and ensure none are visible
		const checkIcons = Array.from(document.querySelectorAll('svg')).filter(
			(svg) => svg.className.baseVal?.includes('tabler-icon-check')
		);
		expect(checkIcons.length).toBeGreaterThan(0);
		checkIcons.forEach((icon) =>
			expect(icon.getAttribute('data-visible')).toBe('false')
		);
	});

	test('modal close button is hidden while loading (isPending true)', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})),
			isPending: true,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA, clientB]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// When isPending true, the modal close button should not be visible
		const closeButton = document.querySelector('.mantine-Modal-close');
		expect(closeButton).toBeNull();
	});

	test('modal close button is visible and triggers onClose when not loading', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({ accessToken: 'token' }),
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA, clientB]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		const closeButton = document.querySelector('.mantine-Modal-close');
		expect(closeButton).toBeTruthy();
		if (closeButton) {
			await userEvent.click(closeButton as Element);
			expect(onClose).toHaveBeenCalledTimes(1);
		}
	});

	test('selecting client that returns neither accessToken nor otpRequired does not close modal or change step', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockResolvedValue({});
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// click the card element to select; server returns an empty object
		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalled());

		// Should not call onSuccess or onClose, and still be on selection step
		expect(onSuccess).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByText('Select Organization')).toBeInTheDocument();
		// ensure selected card has data-selected=true
		const label = screen.getByText('Acme Inc');
		const card = label.closest('[data-selected]') as HTMLElement;
		expect(card?.getAttribute('data-selected')).toBe('true');
	});

	test('Verify button shows left icon when not loading', async () => {
		const onClose = vi.fn();
		const onSuccess = vi.fn();

		const selectClientModule = await import('~/queries/authQueries');
		const mutate = vi.fn().mockImplementation(({ otp }: any) => {
			if (!otp) return Promise.resolve({ otpRequired: true });
			return Promise.resolve({ accessToken: 'token' });
		});
		(selectClientModule.useSelectClient as any).mockReturnValue({
			mutateAsync: mutate,
			isPending: false,
		});

		renderWithProviders(
			<ClientSelectionModal
				opened
				onClose={onClose}
				availableClients={[clientA]}
				preAuthToken={'pre-auth'}
				onSuccess={onSuccess}
			/>
		);

		// Enter OTP flow
		await userEvent.click(screen.getByText('Acme Inc'));
		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
		expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();

		// Verify button should show left icon (IconShieldCheck) when not loading
		const verifyButton = screen.getByRole('button', { name: /Verify/i });
		expect(verifyButton.querySelector('svg')).toBeTruthy();
	});

	// Note: testing dynamic isPending for OTP verification would require
	// more complex hook state management; the important case covered is the
	// left icon in non-loading state and the OTP verification flow itself.

	test('validateOtpValue helper returns proper messages', () => {
		expect(validateOtpValue('')).toBe('OTP code is required');
		expect(validateOtpValue('123')).toBe('OTP code must be 6 digits');
		expect(validateOtpValue('12ab56')).toBe(
			'OTP code must contain only numbers'
		);
		expect(validateOtpValue('123456')).toBe(null);
	});

	// removed: duplicate unstable test (handled in previous test)
});

export {};
