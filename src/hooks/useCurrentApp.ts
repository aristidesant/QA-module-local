import { useLocation } from 'react-router';

export type AppKey = 'qa' | 'ucxm' | 'backoffice' | 'coaching' | 'lms';

/**
 * Resolve the app a given path belongs to: anything under `/qa` is the QA app,
 * anything under `/backoffice` is the Backoffice app, everything else is
 * Campaign management (UCXM). No persisted state — switching apps is just
 * navigation.
 */
export const appForPath = (pathname: string): AppKey => {
	if (pathname === '/qa' || pathname.startsWith('/qa/')) return 'qa';
	if (pathname === '/backoffice' || pathname.startsWith('/backoffice/'))
		return 'backoffice';
	if (pathname === '/coaching' || pathname.startsWith('/coaching/'))
		return 'coaching';
	if (pathname === '/lms' || pathname.startsWith('/lms/')) return 'lms';
	return 'ucxm';
};

/** The app the user is currently in, derived purely from the route. */
export const useCurrentApp = (): AppKey => {
	const { pathname } = useLocation();
	return appForPath(pathname);
};

export default useCurrentApp;
