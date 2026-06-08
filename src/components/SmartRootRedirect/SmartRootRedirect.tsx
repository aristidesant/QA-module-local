import { Navigate } from 'react-router';
import { useLandingPath } from '~/hooks/useLandingPath';

interface SmartRootRedirectProps {
	children: React.ReactNode;
}

const SmartRootRedirect = ({ children }: SmartRootRedirectProps) => {
	const landingPath = useLandingPath();

	if (landingPath !== '/') {
		return <Navigate to={landingPath} replace />;
	}

	return <>{children}</>;
};

export default SmartRootRedirect;
