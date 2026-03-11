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
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import type { KnowledgeBaseModel } from '~/models/KnowledgeBaseModel';
import dayjs from 'dayjs';
import styles from './KnowledgeBaseList.module.css';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
	openEdit: (id: number) => void,
	{ canUpdate, canDelete }: PermissionFlags
) => {
	const { t } = useTranslation('knowledge-bases');

	const columnHelper = createColumnHelper<KnowledgeBaseModel>();

	const columns = useMemo(
		() => [
			columnHelper.accessor('name', {
				id: 'name',
				header: t('columns.name'),
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
				header: t('columns.type'),
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
							{t(`type.${type}`)}
						</Badge>
					);
				},
				size: 100,
			}),
			columnHelper.accessor('status', {
				id: 'status',
				header: t('columns.status'),
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
								{t(`status.${status}`)}
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
				header: t('columns.createdAt'),
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed'>
						{formatDate(getValue())}
					</Text>
				),
				size: 150,
			}),
			columnHelper.display({
				id: 'actions',
				header: t('columns.actions'),
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
											? t('table.actions.openUrl')
											: t('table.actions.downloadFile')
									}
									position='top'
								>
									<ActionIcon
										variant='light'
										component='a'
										aria-label={
											item.type === KnowledgeBaseType.URL
												? t('table.actions.openUrl')
												: t('table.actions.downloadFile')
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
									<Tooltip
										label={t('table.actions.retryUpload')}
										position='top'
									>
										<ActionIcon
											variant='light'
											size='sm'
											aria-label={t('table.actions.retryUpload')}
											onClick={async () => {
												try {
													await retryMutation.mutateAsync(Number(item.id));
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
								<Tooltip label={t('table.actions.edit')} position='top'>
									<ActionIcon
										variant='light'
										onClick={() => openEdit(Number(item.id))}
										size='sm'
										aria-label={t('table.actions.edit')}
									>
										<IconEdit size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canDelete && (
								<Tooltip label={t('table.actions.delete')} position='top'>
									<ActionIcon
										variant='light'
										color='red'
										aria-label={t('table.actions.delete')}
										onClick={() =>
											openConfirmModal({
												title: t('deleteKnowledgeBase'),
												children: t('confirmDelete.body', { name: item.name }),
												labels: {
													confirm: t('actions.delete', { ns: 'common' }),
													cancel: t('actions.cancel', { ns: 'common' }),
												},
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
		[t, retryMutation, deleteMutation, openEdit, canUpdate, canDelete]
	);

	return columns as ColumnDef<KnowledgeBaseModel, unknown>[];
};
