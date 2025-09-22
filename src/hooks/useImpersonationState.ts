import { jwtDecode } from 'jwt-decode';
import { useSessionStore } from '~/stores/sessionStore';
import type { ImpersonatedClient } from '~/models/UserModels';

export const useImpersonationState = () => {
	const { token, targetClient } = useSessionStore();

	// If we have a targetClient in store, we're definitely impersonating
	if (targetClient) {
		return {
			isImpersonating: true,
			originalClientId: null, // We can get this from token if needed
			currentClientId: targetClient.id,
		};
	}

	// Fallback to token decoding for cases where targetClient might not be set yet
	if (!token) {
		return {
			isImpersonating: false,
			originalClientId: null,
			currentClientId: null,
		};
	}

	try {
		const decoded = jwtDecode(token) as unknown as ImpersonatedClient;

		return {
			isImpersonating: !!decoded.impersonatedAt,
			originalClientId: decoded.originalClientId || null,
			currentClientId: decoded.clientId || null,
		};
	} catch {
		return {
			isImpersonating: false,
			originalClientId: null,
			currentClientId: null,
		};
	}
};
