import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import styles from '../ToolForm.module.css';
import type React from 'react';

interface ToolFormListEditorProps {
	title: string;
	addLabel: string;
	emptyLabel: string;
	firstItemLabel: string;
	onAdd: () => void;
	children: React.ReactNode;
}

export default function ToolFormListEditor({
	title,
	addLabel,
	emptyLabel,
	firstItemLabel,
	onAdd,
	children,
}: ToolFormListEditorProps) {
	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center'>
				<Text size='sm' fw={500}>
					{title}
				</Text>
				<Button
					variant='subtle'
					size='xs'
					leftSection={<IconPlus size={12} />}
					onClick={onAdd}
				>
					{addLabel}
				</Button>
			</Group>
			{children || (
				<div className={styles.emptyState}>
					<Stack gap={4} align='center'>
						<Text size='xs' c='dimmed' ta='center'>
							{emptyLabel}
						</Text>
						<Button variant='light' size='xs' onClick={onAdd}>
							{firstItemLabel}
						</Button>
					</Stack>
				</div>
			)}
		</Stack>
	);
}
