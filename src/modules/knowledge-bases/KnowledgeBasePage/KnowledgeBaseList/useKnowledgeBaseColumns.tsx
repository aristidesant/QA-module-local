import { useMemo } from 'react';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
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

const formatDate = (iso?: string | null) =>
	iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '-';

type PermissionFlags = {
	canUpdate: boolean;
	canDelete: boolean;
};

const typeIconMap = {
	[KnowledgeBaseType.FILE]: IconFileText,
	[KnowledgeBaseType.URL]: IconLink,
	[KnowledgeBaseType.TEXT]: IconArticle,
} as const;

const typeClassMap = {
	[KnowledgeBaseType.FILE]: styles.typeBadgeFile,
	[KnowledgeBaseType.URL]: styles.typeBadgeUrl,
	[KnowledgeBaseType.TEXT]: styles.typeBadgeText,
} as const;

const statusClassMap: Record<string, string> = {
	ACTIVE: styles.statusActive,
	INACTIVE: styles.statusInactive,
	PENDING: styles.statusPending,
	UPLOADING: styles.statusUploading,
	FAILED: styles.statusFailed,
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
					return (
						<div className={styles.nameCell}>
							<Text fz='sm' fw={600} className={styles.nameText}>
								{item.name}
							</Text>
							<Text
								fz='xs'
								c='dimmed'
								className={styles.nameDescription}
								fs={item.description ? undefined : 'italic'}
							>
								{item.description || t('list.noDescription')}
							</Text>
						</div>
					);
				},
				size: 200,
			}),
			columnHelper.accessor('type', {
				id: 'type',
				header: t('columns.type'),
				cell: ({ getValue }) => {
					const type = getValue() as KnowledgeBaseType;
					const Icon = typeIconMap[type] ?? IconFileText;
					const cls = typeClassMap[type] ?? styles.typeBadgeFile;
					return (
						<span className={cls}>
							<Icon size={11} />
							{t(`type.${type}`)}
						</span>
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
					const cls = statusClassMap[status] ?? styles.statusInactive;
					return (
						<div className={styles.statusSection}>
							<span className={cls}>
								<span className={styles.statusDot} />
								{t(`status.${status}`)}
							</span>
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
					<Text fz='xs' c='dimmed'>
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
						<Group
							gap={4}
							justify='flex-end'
							wrap='nowrap'
							className={styles.actionsGroup}
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
									withArrow
								>
									<ActionIcon
										variant='subtle'
										color='gray'
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
											<IconExternalLink size={15} />
										) : (
											<IconDownload size={15} />
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
										withArrow
									>
										<ActionIcon
											variant='subtle'
											color='gray'
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
											<IconRefresh size={15} />
										</ActionIcon>
									</Tooltip>
								)}

							{canUpdate && (
								<Tooltip
									label={t('table.actions.edit')}
									position='top'
									withArrow
								>
									<ActionIcon
										variant='subtle'
										color='gray'
										onClick={() => openEdit(Number(item.id))}
										size='sm'
										aria-label={t('table.actions.edit')}
									>
										<IconEdit size={15} />
									</ActionIcon>
								</Tooltip>
							)}

							{canDelete && (
								<Tooltip
									label={t('table.actions.delete')}
									position='top'
									withArrow
								>
									<ActionIcon
										variant='subtle'
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
										<IconTrash size={15} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
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
