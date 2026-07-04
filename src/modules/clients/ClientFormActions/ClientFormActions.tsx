import { Button, Group, Text } from '@mantine/core';
import type { ClientFormMode } from '~/modules/clients/ClientForm/ClientForm.types';
import classes from './ClientFormActions.module.css';

interface ClientFormActionsProps {
	mode: ClientFormMode;
	isDirty: boolean;
	isSubmitting: boolean;
	unsavedLabel: string;
	createLabel: string;
	saveLabel: string;
	cancelLabel: string;
	savingLabel?: string;
	onCancel: () => void;
}

const ClientFormActions = ({
	mode,
	isDirty,
	isSubmitting,
	unsavedLabel,
	createLabel,
	saveLabel,
	cancelLabel,
	savingLabel,
	onCancel,
}: ClientFormActionsProps) => {
	const primaryLabel = isSubmitting
		? savingLabel
		: mode === 'create'
			? createLabel
			: saveLabel;

	return (
		<Group gap='xs' className={classes.root}>
			<Text size='xs' className={classes.status} aria-live='polite'>
				{isDirty && !isSubmitting ? unsavedLabel : null}
			</Text>
			<Button
				type='button'
				variant='default'
				disabled={isSubmitting}
				onClick={onCancel}
				className={classes.button}
			>
				{cancelLabel}
			</Button>
			<Button
				type='submit'
				loading={isSubmitting}
				disabled={mode === 'edit' && !isDirty}
				className={classes.button}
			>
				{primaryLabel}
			</Button>
		</Group>
	);
};

export default ClientFormActions;
