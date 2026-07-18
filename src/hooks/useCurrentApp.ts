import { useLocation } from 'react-router';

export type AppKey = 'qa' | 'ucxm';

/**
 * The app the user is currently in, derived purely from the route: any path
 * under `/qa` is the QA app, everything else is Campaign management (UCXM).
 * No persisted state — switching apps is just navigation.
 */
export const useCurrentApp = (): AppKey => {
	const { pathname } = useLocation();
	return pathname === '/qa' || pathname.startsWith('/qa/') ? 'qa' : 'ucxm';
};

export default useCurrentApp;
