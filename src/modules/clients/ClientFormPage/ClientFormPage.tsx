import { Navigate, useParams } from 'react-router';
import ClientForm from '../ClientForm/ClientForm';
import type { ClientFormMode } from '../ClientForm/ClientForm.types';
import classes from './ClientFormPage.module.css';

interface ClientFormPageProps {
	mode: ClientFormMode;
}

const ClientFormPage = ({ mode }: ClientFormPageProps) => {
	const { clientId } = useParams<{ clientId: string }>();
	const parsedClientId = Number(clientId);
	const hasValidClientId =
		clientId !== undefined &&
		/^[1-9]\d*$/.test(clientId) &&
		Number.isSafeInteger(parsedClientId);

	if (mode === 'edit' && !hasValidClientId) {
		return <Navigate to='/clients' replace />;
	}
	const resolvedClientId = mode === 'edit' ? parsedClientId : undefined;

	return (
		<div className={classes.root}>
			<ClientForm
				key={`${mode}:${resolvedClientId ?? 'new'}`}
				mode={mode}
				clientId={resolvedClientId}
			/>
		</div>
	);
};

export default ClientFormPage;
