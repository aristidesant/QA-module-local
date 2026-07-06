import { Button, Text } from '@mantine/core';
import classes from './ClientFormActions.module.css';

interface ClientFormActionsProps {
	visible: boolean;
	isSubmitting: boolean;
	unsavedLabel: string;
	saveLabel: string;
	savingLabel: string;
	discardLabel: string;
	onDiscard: () => void;
}

const ClientFormActions = ({
	visible,
	isSubmitting,
	unsavedLabel,
	saveLabel,
	savingLabel,
	discardLabel,
	onDiscard,
}: ClientFormActionsProps) => {
	if (!visible) return null;

	return (
		<div className={classes.saveBar}>
			<Text size='sm' className={classes.status} aria-live='polite'>
				<span className={classes.dot} aria-hidden='true' />
				{unsavedLabel}
			</Text>
			<div className={classes.buttons}>
				<Button
					type='button'
					variant='default'
					disabled={isSubmitting}
					onClick={onDiscard}
					className={classes.button}
				>
					{discardLabel}
				</Button>
				<Button type='submit' loading={isSubmitting} className={classes.button}>
					{isSubmitting ? savingLabel : saveLabel}
				</Button>
			</div>
		</div>
	);
};

export default ClientFormActions;
