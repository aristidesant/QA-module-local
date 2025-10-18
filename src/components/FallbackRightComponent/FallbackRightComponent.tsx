import React from 'react';
import { Text } from '@mantine/core';
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
	title = 'Nothing selected',
	description = 'No item selected. Pick an entry from the list or create a new one to see details and actions.',
	actionText = 'Choose or create an item to get started',
	className = '',
}) => {
	const IconComponent = Icon;

	return (
		<EmptyState
			icon={<IconComponent size={56} stroke={1.5} />}
			message={title}
			description={
				typeof description === 'string' ? (
					<Text size='sm' c='dimmed'>
						{description}
					</Text>
				) : (
					description
				)
			}
			action={
				actionText && (
					<Text size='sm' c='dimmed'>
						{actionText}
					</Text>
				)
			}
			className={`${classes.root} ${className}`.trim()}
		/>
	);
};

export default FallbackRightComponent;
