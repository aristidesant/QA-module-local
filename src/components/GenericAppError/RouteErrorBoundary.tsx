import { useEffect } from 'react';
import {
	isRouteErrorResponse,
	useLocation,
	useMatches,
	useRouteError,
} from 'react-router';
import GenericAppError, { type AppErrorVariant } from './GenericAppError';

function isChunkLoadError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	const msg = error.message + (error.name ?? '');
	return (
		msg.includes('Loading chunk') ||
		msg.includes('dynamically imported module') ||
		msg.includes('ChunkLoadError') ||
		msg.includes('Failed to fetch')
	);
}

function statusToVariant(status: number): AppErrorVariant {
	if (status === 404) return 'notFound';
	if (status === 403) return 'forbidden';
	if (status === 401) return 'unauthorized';
	if (status >= 500) return 'serverError';
	return 'generic';
}

const RouteErrorBoundary = () => {
	const error = useRouteError();
	const location = useLocation();
	const matches = useMatches();
	const currentMatch = matches[matches.length - 1];

	useEffect(() => {
		console.error('Route error boundary captured an error', error);
	}, [error]);

	if (isRouteErrorResponse(error)) {
		return (
			<GenericAppError
				variant={statusToVariant(error.status)}
				pathname={`${location.pathname}${location.search}`}
				routeId={currentMatch?.id}
				statusCode={error.status}
				statusText={error.statusText}
			/>
		);
	}

	if (isChunkLoadError(error)) {
		return <GenericAppError variant='update' />;
	}

	return (
		<GenericAppError
			variant='generic'
			pathname={`${location.pathname}${location.search}`}
			routeId={currentMatch?.id}
		/>
	);
};

export default RouteErrorBoundary;
