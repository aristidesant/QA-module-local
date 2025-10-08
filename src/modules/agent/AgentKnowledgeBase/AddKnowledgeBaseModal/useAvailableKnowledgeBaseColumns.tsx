import React from 'react';
import dayjs from 'dayjs';
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

const typeColorMap: Record<KnowledgeBaseType, string> = {
	[KnowledgeBaseType.FILE]: 'blue',
	[KnowledgeBaseType.URL]: 'teal',
	[KnowledgeBaseType.TEXT]: 'violet',
};

const typeLabelMap: Record<KnowledgeBaseType, string> = {
	[KnowledgeBaseType.FILE]: 'File',
	[KnowledgeBaseType.URL]: 'Website',
	[KnowledgeBaseType.TEXT]: 'Custom',
};

const formatTimestamp = (value?: string | null) =>
	value ? dayjs(value).format('MMM D, YYYY • HH:mm') : '—';

const truncate = (value: string, limit = 80) =>
	value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;

const getSourceSummary = (kb: KnowledgeBaseModel) => {
	if (kb.sourceUrl) {
		return kb.sourceUrl;
	}

	if (kb.file?.name) {
		return kb.file.name;
	}

	if (kb.identifier) {
		return kb.identifier;
	}

	if (kb.textContent) {
		return truncate(kb.textContent);
	}

	return null;
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
							size='xs'
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
					const sourceSummary = getSourceSummary(kb);
					return (
						<div className={styles.primaryCell}>
							<ThemeIcon
								variant='light'
								color={typeColorMap[kb.type]}
								size='md'
								radius='md'
								className={styles.typeIcon}
							>
								{typeIconMap[kb.type]}
							</ThemeIcon>
							<div className={styles.primaryContent}>
								<div className={styles.primaryHeader}>
									<Text size='sm' fw={600} className={styles.nameTitle}>
										{kb.name}
									</Text>
									<Badge
										variant='light'
										size='xs'
										className={styles.typeBadge}
										color={typeColorMap[kb.type]}
									>
										{typeLabelMap[kb.type]}
									</Badge>
								</div>
								{kb.description && (
									<Text size='xs' c='dimmed' className={styles.description}>
										{kb.description}
									</Text>
								)}
								{sourceSummary && (
									<Text size='xs' c='dimmed' className={styles.sourceUrl}>
										{sourceSummary}
									</Text>
								)}
								<div className={styles.metaRow}>
									<Text size='xs' c='dimmed' className={styles.metaLabel}>
										Last sync
									</Text>
									<Text size='xs' className={styles.metaValue}>
										{formatTimestamp(kb.lastSyncAt ?? kb.updatedAt)}
									</Text>
								</div>
							</div>
						</div>
					);
				},
				meta: {
					cellClassName: styles.primaryCellWrapper,
				},
			},
			{
				accessorKey: 'clientId',
				header: 'Client',
				cell: ({ row }) => {
					const kb = row.original;
					return (
						<div className={styles.clientCell}>
							<Text size='xs' c='dimmed' className={styles.clientLabel}>
								ID
							</Text>
							<Text size='sm' fw={500} className={styles.clientValue}>
								{kb.clientId}
							</Text>
						</div>
					);
				},
				meta: {
					cellClassName: styles.clientCellWrapper,
				},
			},
		],
		[assignedIds, onSelect, selectedId]
	);

export default useAvailableKnowledgeBaseColumns;
