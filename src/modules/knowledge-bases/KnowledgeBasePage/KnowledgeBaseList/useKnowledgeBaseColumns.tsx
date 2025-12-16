import { useMemo } from 'react';
import { ActionIcon, Badge, Text, Tooltip, Flex } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import {
	IconTrash,
	IconDownload,
	IconRefresh,
	IconAlertTriangle,
	IconFileText,
	IconArticle,
	IconLink,
	IconExternalLink,
	IconEdit,
} from '@tabler/icons-react';
import {
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';
import KnowledgeBaseForm from '../KnowledgeBaseForm/KnowledgeBaseForm';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import type { KnowledgeBaseModel } from '~/models/KnowledgeBaseModel';
import dayjs from 'dayjs';
import styles from './KnowledgeBaseList.module.css';
import type { UseMutationResult } from '@tanstack/react-query';
import type React from 'react';

const truncate = (s: string | undefined, n = 80) =>
	s && s.length > n ? s.slice(0, n - 1) + '…' : s || '';

const statusConfig = {
	PENDING: { color: 'orange', icon: IconAlertTriangle },
	UPLOADING: { color: 'blue', icon: IconRefresh },
	ACTIVE: { color: 'green', icon: IconFileText },
	FAILED: { color: 'red', icon: IconAlertTriangle },
	INACTIVE: { color: 'gray', icon: IconFileText },
} as const;

const formatDate = (iso?: string | null) =>
	iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '-';

type PermissionFlags = {
	canUpdate: boolean;
	canDelete: boolean;
};

export const useKnowledgeBaseColumns = (
	retryMutation: UseMutationResult<unknown, unknown, number, unknown>,
	deleteMutation: UseMutationResult<unknown, unknown, number, unknown>,
	setRight: (node: React.ReactNode) => void,
	refetch: () => Promise<unknown>,
	{ canUpdate, canDelete }: PermissionFlags
) => {
	const columnHelper = createColumnHelper<KnowledgeBaseModel>();

	const columns = useMemo<Array<ColumnDef<KnowledgeBaseModel, unknown>>>(
		() => [
			columnHelper.accessor('name', {
				id: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const item = row.original;
					const nameText = (
						<Text fw={600} title={item.name}>
							{truncate(item.name, 50)}
						</Text>
					);
					return item.description ? (
						<Tooltip label={item.description} multiline maw={400}>
							{nameText}
						</Tooltip>
					) : (
						nameText
					);
				},
				size: 200,
			}),
			columnHelper.accessor('type', {
				id: 'type',
				header: 'Type',
				cell: ({ getValue }) => {
					const type = getValue() as KnowledgeBaseType;
					return (
						<Badge
							variant='light'
							size='sm'
							color={
								type === KnowledgeBaseType.FILE
									? 'blue'
									: type === KnowledgeBaseType.URL
										? 'green'
										: 'orange'
							}
							leftSection={
								type === KnowledgeBaseType.FILE ? (
									<IconFileText size={10} />
								) : type === KnowledgeBaseType.URL ? (
									<IconLink size={10} />
								) : (
									<IconArticle size={10} />
								)
							}
						>
							{type}
						</Badge>
					);
				},
				size: 100,
			}),
			columnHelper.accessor('status', {
				id: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const item = row.original;
					const status = item.status;
					const config = statusConfig[status] || statusConfig.INACTIVE;
					const StatusIcon = config.icon;
					return (
						<div className={styles.statusSection}>
							<Badge
								variant='light'
								color={config.color}
								size='sm'
								leftSection={<StatusIcon size={12} />}
							>
								{status}
							</Badge>
							{item.uploadError && (
								<Tooltip
									label={
										<pre className={styles.errorTooltip}>
											{item.uploadError}
										</pre>
									}
									multiline
									maw={400}
								>
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										className={styles.errorIcon}
										onClick={(e) => e.stopPropagation()}
									>
										<IconAlertTriangle size={14} />
									</ActionIcon>
								</Tooltip>
							)}
						</div>
					);
				},
				size: 120,
			}),
			columnHelper.accessor('createdAt', {
				id: 'createdAt',
				header: 'Created At',
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed'>
						{formatDate(getValue())}
					</Text>
				),
				size: 150,
			}),
			columnHelper.display({
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => {
					const item = row.original;
					return (
						<Flex
							gap={'xs'}
							justify={'end'}
							onClick={(e) => e.stopPropagation()}
						>
							{item.file?.repositoryRoute || item.sourceUrl ? (
								<Tooltip
									label={
										item.type === KnowledgeBaseType.URL
											? 'Open URL'
											: 'Download file'
									}
									position='top'
								>
									<ActionIcon
										component='a'
										aria-label={
											item.type === KnowledgeBaseType.URL
												? 'Open URL'
												: 'Download file'
										}
										href={
											(item.file?.repositoryRoute as string) ||
											(item.sourceUrl as string)
										}
										target='_blank'
										rel='noopener noreferrer'
										size='sm'
									>
										{item.type === KnowledgeBaseType.URL ? (
											<IconExternalLink size={16} />
										) : (
											<IconDownload size={16} />
										)}
									</ActionIcon>
								</Tooltip>
							) : null}

							{canUpdate &&
								(item.status === KnowledgeBaseStatus.FAILED ||
									!!item.uploadError) && (
									<Tooltip label='Retry upload' position='top'>
										<ActionIcon
											size='sm'
											aria-label='Retry upload'
											onClick={async () => {
												try {
													await retryMutation.mutateAsync(Number(item.id));
													refetch();
												} catch (_) {
													// handled by mutation
												}
											}}
											disabled={retryMutation?.status === 'pending'}
											loading={retryMutation?.status === 'pending'}
										>
											<IconRefresh size={16} />
										</ActionIcon>
									</Tooltip>
								)}

							{canUpdate && (
								<Tooltip label='Edit knowledge base' position='top'>
									<ActionIcon
										onClick={() =>
											setRight(<KnowledgeBaseForm id={Number(item.id)} />)
										}
										size='sm'
										aria-label='Edit knowledge base'
									>
										<IconEdit size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canDelete && (
								<Tooltip label='Delete knowledge base' position='top'>
									<ActionIcon
										color='red'
										aria-label='Delete knowledge base'
										onClick={() =>
											openConfirmModal({
												title: 'Delete Knowledge Base',
												children: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
												labels: { confirm: 'Delete', cancel: 'Cancel' },
												confirmProps: { color: 'red' },
												onConfirm: () => deleteMutation.mutate(Number(item.id)),
											})
										}
										size='sm'
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Tooltip>
							)}
						</Flex>
					);
				},
				size: 120,
				meta: {
					headerClassName: styles.actionsTh,
					cellClassName: styles.actionsTd,
				},
			}),
		],
		[retryMutation, deleteMutation, setRight, refetch, canUpdate, canDelete]
	);

	return columns;
};
