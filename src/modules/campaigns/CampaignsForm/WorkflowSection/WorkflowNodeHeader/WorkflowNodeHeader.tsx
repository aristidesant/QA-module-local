import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';
import styles from './WorkflowNodeHeader.module.css';

interface WorkflowNodeHeaderProps {
	icon?: ReactNode;
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	className?: string;
	titleClassName?: string;
}

const WorkflowNodeHeader = ({
	icon,
	title,
	subtitle,
	actions,
	className,
	titleClassName,
}: WorkflowNodeHeaderProps) => {
	return (
		<div
			className={[
				styles.header,
				styles.dragHandle,
				'workflowNodeDragHandle',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
			<Group
				gap='xs'
				align='center'
				wrap='nowrap'
				className={styles.titleGroup}
			>
				{icon && <span className={styles.iconWrapper}>{icon}</span>}
				<div className={styles.titleCopy}>
					<Text size='sm' fw={500} lineClamp={1} className={titleClassName}>
						{title}
					</Text>
					{subtitle && (
						<Text size='xs' className={styles.subtitle} lineClamp={1}>
							{subtitle}
						</Text>
					)}
				</div>
			</Group>
			<div className={styles.rightSection}>{actions}</div>
		</div>
	);
};

export default WorkflowNodeHeader;
