import { MASTER_CLIENT_ID } from '~/constants/client';
import { useSessionStore } from '~/stores/sessionStore';

export const useIsMasterClient = () => {
	const { user } = useSessionStore();

	return user?.clientId === MASTER_CLIENT_ID;
};
