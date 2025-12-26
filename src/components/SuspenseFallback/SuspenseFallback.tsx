import { Loader, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import classes from './SuspenseFallback.module.css';

export type SuspenseFallbackProps = {
	message?: string;
	messageKey?: string;
	description?: string;
	descriptionKey?: string;
	ns?: string;
};

const SuspenseFallback: React.FunctionComponent<SuspenseFallbackProps> = ({
	message,
	messageKey,
	description,
	descriptionKey,
	ns = 'common',
}) => {
	const { t } = useTranslation(ns);
	const resolvedMessage = messageKey ? t(messageKey) : (message ?? '');
	const resolvedDescription = descriptionKey ? t(descriptionKey) : description;

	return (
		<div className={classes.wrapper} role='status' aria-live='polite'>
			<Loader color='var(--mantine-color-blue-6)' size='lg' />
			<div className={classes.status}>
				<Text className={classes.message}>{resolvedMessage}</Text>
				{resolvedDescription ? (
					<Text className={classes.subtext}>{resolvedDescription}</Text>
				) : null}
			</div>
		</div>
	);
};

export default SuspenseFallback;
