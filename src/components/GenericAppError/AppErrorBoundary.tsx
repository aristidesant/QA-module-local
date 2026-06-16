import React from 'react';
import GenericAppError from './GenericAppError';

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

type AppErrorBoundaryProps = {
	children: React.ReactNode;
};

type AppErrorBoundaryState = {
	error: Error | null;
};

class AppErrorBoundary extends React.Component<
	AppErrorBoundaryProps,
	AppErrorBoundaryState
> {
	state: AppErrorBoundaryState = {
		error: null,
	};

	static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Application error boundary captured an error', {
			error,
			errorInfo,
		});
	}

	render() {
		const { error } = this.state;
		if (error) {
			const variant = isChunkLoadError(error) ? 'update' : 'generic';
			return (
				<GenericAppError
					variant={variant}
					pathname={`${window.location.pathname}${window.location.search}`}
				/>
			);
		}

		return this.props.children;
	}
}

export default AppErrorBoundary;
