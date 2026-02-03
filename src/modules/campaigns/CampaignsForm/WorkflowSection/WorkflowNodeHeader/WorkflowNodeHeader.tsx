import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';
import styles from './WorkflowNodeHeader.module.css';

interface WorkflowNodeHeaderProps {
	icon?: ReactNode;
	title: string;
	actions?: ReactNode;
	className?: string;
	titleClassName?: string;
}

const WorkflowNodeHeader = ({
	icon,
	title,
	actions,
	className,
	titleClassName,
}: WorkflowNodeHeaderProps) => {
	return (
		<div className={[styles.header, className].filter(Boolean).join(' ')}>
			<Group
				gap='xs'
				align='center'
				wrap='nowrap'
				className={styles.titleGroup}
			>
				{icon}
				<Text size='sm' fw={500} lineClamp={1} className={titleClassName}>
					{title}
				</Text>
			</Group>
			{actions}
		</div>
	);
};

export default WorkflowNodeHeader;
