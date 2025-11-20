import React, { useMemo } from 'react';
import { Badge, Checkbox, Text } from '@mantine/core';
import {
	IconArticle,
	IconClock,
	IconFileText,
	IconLink,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import {
	KnowledgeBaseStatus,
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import classes from './CampaignConfigurationKnowledgeBaseAddModal.module.css';

interface UseKnowledgeBaseSelectionColumnsParams {
	selectedIds: number[];
	onToggle: (kbId: number, checked: boolean) => void;
}

const statusConfig: Record<
	KnowledgeBaseStatus,
	{ color: string; label: string }
> = {
	[KnowledgeBaseStatus.PENDING]: { color: 'orange', label: 'Pending' },
	[KnowledgeBaseStatus.UPLOADING]: { color: 'blue', label: 'Uploading' },
	[KnowledgeBaseStatus.ACTIVE]: { color: 'green', label: 'Active' },
	[KnowledgeBaseStatus.FAILED]: { color: 'red', label: 'Failed' },
	[KnowledgeBaseStatus.INACTIVE]: { color: 'gray', label: 'Inactive' },
};

const typeConfig: Record<
	KnowledgeBaseType,
	{ color: string; label: string; icon: React.ComponentType<{ size?: number }> }
> = {
	[KnowledgeBaseType.FILE]: {
		color: 'blue',
		label: 'File',
		icon: IconFileText,
	},
	[KnowledgeBaseType.URL]: {
		color: 'teal',
		label: 'Link',
		icon: IconLink,
	},
	[KnowledgeBaseType.TEXT]: {
		color: 'orange',
		label: 'Text',
		icon: IconArticle,
	},
};

const formatDate = (value?: string | null) =>
	value ? dayjs(value).format('MMM D, YYYY') : '—';

const useKnowledgeBaseSelectionColumns = ({
	selectedIds,
	onToggle,
}: UseKnowledgeBaseSelectionColumnsParams): ColumnDef<KnowledgeBaseModel>[] => {
	return useMemo(
		() => [
			{
				id: 'select',
				header: '',
				enableSorting: false,
				cell: ({ row }) => (
					<Checkbox
						aria-label={`Select ${row.original.name}`}
						checked={selectedIds.includes(row.original.id)}
						onClick={(event) => event.stopPropagation()}
						onChange={(event) =>
							onToggle(row.original.id, event.currentTarget.checked)
						}
					/>
				),
				size: 52,
				meta: {
					headerClassName: classes.selectionHeader,
					cellClassName: classes.selectionCell,
				},
			},
			{
				accessorKey: 'name',
				header: 'Knowledge Base',
				cell: ({ row }) => {
					const kb = row.original;
					const type = typeConfig[kb.type];
					const status = statusConfig[kb.status] || statusConfig.INACTIVE;
					const TypeIcon = type.icon;

					return (
						<div className={classes.nameCell}>
							<Text className={`${classes.nameTitle} ${classes.truncate}`}>
								{kb.name}
							</Text>
							<div className={classes.metaGroup}>
								<Badge
									variant='light'
									color={type.color}
									size='sm'
									leftSection={<TypeIcon size={12} />}
									className={classes.badgePill}
								>
									{type.label}
								</Badge>
								<Badge
									variant='light'
									color={status.color}
									size='sm'
									className={`${classes.badgePill} ${classes.statusBadge}`}
								>
									{status.label}
								</Badge>
								<div className={classes.inlineMeta}>
									<IconClock size={14} />
									<Text size='xs' c='dimmed'>
										Updated {formatDate(kb.updatedAt)}
									</Text>
								</div>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed'>
						{formatDate(getValue<string>())}
					</Text>
				),
				size: 140,
			},
		],
		[selectedIds, onToggle]
	);
};

export default useKnowledgeBaseSelectionColumns;
