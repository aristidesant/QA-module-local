import React from 'react';
import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import classes from './FallbackRightComponent.module.css';
import { IconInfoCircle } from '@tabler/icons-react';
import EmptyState from '../EmptyState/EmptyState';

export interface FallbackRightComponentProps {
	/** Icon component from @tabler/icons-react (pass the component, not an element) */
	Icon?: React.ComponentType<any>;
	/** Short title shown prominently */
	title?: string;
	/** Longer description or guidance text */
	description?: React.ReactNode;
	/** Optional small action hint */
	actionText?: string;
	className?: string;
}

export const FallbackRightComponent: React.FC<FallbackRightComponentProps> = ({
	Icon = IconInfoCircle,
	title,
	description,
	actionText,
	className = '',
}) => {
	const { t } = useTranslation('common');
	const IconComponent = Icon;
	const resolvedTitle = title ?? t('fallbackRight.title');
	const resolvedDescription = description ?? t('fallbackRight.description');
	const resolvedActionText = actionText ?? t('fallbackRight.actionText');

	return (
		<EmptyState
			icon={<IconComponent size={56} stroke={1.5} />}
			message={resolvedTitle}
			description={
				<Stack gap='xs' align='center' className={classes.contentGroup}>
					{typeof resolvedDescription === 'string' ? (
						<Text size='sm' c='dimmed' className={classes.descriptionText}>
							{resolvedDescription}
						</Text>
					) : (
						resolvedDescription
					)}
				</Stack>
			}
			action={
				resolvedActionText && (
					<Text size='sm' c='blue.7' className={classes.actionText}>
						{resolvedActionText}
					</Text>
				)
			}
			className={`${classes.root} ${className}`.trim()}
		/>
	);
};

export default FallbackRightComponent;
