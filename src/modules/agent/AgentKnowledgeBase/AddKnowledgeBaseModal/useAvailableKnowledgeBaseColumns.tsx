import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Radio, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconApi, IconFileText, IconWorld } from '@tabler/icons-react';
import KnowledgeBaseModel, {
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import styles from './AddKnowledgeBaseModal.module.css';

const typeIconMap: Record<KnowledgeBaseType, React.ReactNode> = {
	[KnowledgeBaseType.FILE]: <IconFileText size={16} />,
	[KnowledgeBaseType.URL]: <IconWorld size={16} />,
	[KnowledgeBaseType.TEXT]: <IconApi size={16} />,
};

interface UseAvailableKnowledgeBaseColumnsProps {
	selectedId: number | null;
	assignedIds: Set<number>;
	onSelect: (knowledgeBase: KnowledgeBaseModel) => void;
}

export const useAvailableKnowledgeBaseColumns = ({
	selectedId,
	assignedIds,
	onSelect,
}: UseAvailableKnowledgeBaseColumnsProps): ColumnDef<
	KnowledgeBaseModel,
	any
>[] =>
	React.useMemo(
		() => [
			{
				id: 'select',
				header: '',
				enableSorting: false,
				cell: ({ row }) => {
					const kb = row.original;
					const isAssigned = assignedIds.has(kb.id);
					const isSelected = kb.id === selectedId;

					const radio = (
						<Radio
							checked={isSelected}
							onChange={() => onSelect(kb)}
							disabled={isAssigned}
							aria-label={`Select knowledge base ${kb.name}`}
							className={styles.radioControl}
						/>
					);

					if (!isAssigned) {
						return radio;
					}

					return (
						<Tooltip label='Already assigned to this agent' position='left'>
							<div>{radio}</div>
						</Tooltip>
					);
				},
				meta: {
					headerClassName: styles.selectHeader,
					cellClassName: styles.selectCell,
				},
			},
			{
				accessorKey: 'name',
				header: 'Knowledge Base',
				cell: ({ row }) => {
					const kb = row.original;
					return (
						<div className={styles.nameCell}>
							<ThemeIcon variant='light' color='gray' size='sm'>
								{typeIconMap[kb.type]}
							</ThemeIcon>
							<div className={styles.nameContent}>
								<Text size='sm' fw={500} className={styles.nameTitle}>
									{kb.name}
								</Text>
								{kb.description && (
									<Text size='xs' c='dimmed' className={styles.description}>
										{kb.description}
									</Text>
								)}
								{kb.sourceUrl && (
									<Text size='xs' c='dimmed' className={styles.sourceUrl}>
										{kb.sourceUrl}
									</Text>
								)}
							</div>
						</div>
					);
				},
				meta: {
					cellClassName: styles.nameCellWrapper,
				},
			},
			{
				accessorKey: 'type',
				header: 'Type',
				cell: ({ row }) => (
					<Badge variant='light' size='sm'>
						{row.original.type}
					</Badge>
				),
				meta: {
					cellClassName: styles.typeCell,
				},
			},
		],
		[assignedIds, onSelect, selectedId]
	);

export default useAvailableKnowledgeBaseColumns;
