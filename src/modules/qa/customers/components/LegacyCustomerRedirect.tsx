import { Navigate, useParams } from 'react-router';

export default function LegacyCustomerRedirect() {
	const { customerId } = useParams<{ customerId: string }>();
	return <Navigate to={`/qa/supervisor/customers/${customerId ?? ''}`} replace />;
}
