import { Skeleton, VisuallyHidden } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
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
	const resolvedMessage = messageKey
		? t(messageKey)
		: (message ?? t('status.loading'));
	const resolvedDescription = descriptionKey ? t(descriptionKey) : description;

	return (
		<ContentContainer contentWidth='centered'>
			<div className={classes.wrapper} role='status' aria-live='polite'>
				<VisuallyHidden>{resolvedMessage}</VisuallyHidden>
				<div className={classes.shell}>
					<div className={classes.header}>
						<Skeleton height={20} width='34%' radius='xl' />
						<Skeleton height={12} width='18%' radius='xl' />
					</div>
					<div className={classes.grid}>
						<div className={classes.column}>
							<Skeleton height={136} radius='lg' />
							<Skeleton height={16} width='46%' radius='xl' />
							<Skeleton height={12} width='68%' radius='xl' />
						</div>
						<div className={classes.column}>
							<Skeleton height={84} radius='lg' />
							<Skeleton height={84} radius='lg' />
						</div>
					</div>
					<div className={classes.footer}>
						<Skeleton height={12} width='24%' radius='xl' />
						<Skeleton height={12} width='78%' radius='xl' />
						{resolvedDescription ? (
							<Skeleton height={12} width='56%' radius='xl' />
						) : null}
					</div>
				</div>
			</div>
		</ContentContainer>
	);
};

export default SuspenseFallback;
