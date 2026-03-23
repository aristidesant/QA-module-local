import { Badge, Group, Stack, Text } from '@mantine/core';
import styles from '../ToolForm.module.css';

interface ToolFormSectionHeaderProps {
	title: string;
	description: string;
	statusLabel: string;
	statusColor?: string;
	eyebrow?: string;
}

export default function ToolFormSectionHeader({
	title,
	description,
	statusLabel,
	statusColor = 'gray',
	eyebrow,
}: ToolFormSectionHeaderProps) {
	return (
		<Group
			justify='space-between'
			align='flex-start'
			gap='xs'
			wrap='nowrap'
			className={styles.sectionHeaderBlock}
		>
			<Stack gap={4}>
				{eyebrow && (
					<Text
						size='xs'
						fw={700}
						tt='uppercase'
						c='dimmed'
						className={styles.sectionEyebrow}
					>
						{eyebrow}
					</Text>
				)}
				<Text fw={700} size='sm'>
					{title}
				</Text>
				<Text size='xs' c='dimmed'>
					{description}
				</Text>
			</Stack>
			<Badge size='xs' variant='light' color={statusColor} radius='sm'>
				{statusLabel}
			</Badge>
		</Group>
	);
}
