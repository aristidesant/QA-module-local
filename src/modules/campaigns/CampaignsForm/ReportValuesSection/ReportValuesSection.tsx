import { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Group,
	Paper,
	Stack,
	Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react';
import {
	useCreateReportValue,
	useBulkUpdateReportValues,
	useGetReportColumns,
	useDeleteReportValue,
} from '~/queries/reportValuesQueries';
import type {
	BulkUpdateReportValueItemDto,
	ReportValue,
} from '~/models/ReportValue';
import { getErrorMessage } from '~/utils/httpClient';
import { CampaignIdContext } from '~/modules/campaigns/campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import ReportValueFormModal, {
	type FormValues as ReportValueFormValues,
} from './ReportValueFormModal';
import styles from './ReportValuesSection.module.css';

const ORIGIN_TYPE_COLORS: Record<string, string> = {
	SQL: 'blue',
	DYNAMIC: 'violet',
	OBJECT: 'teal',
	METADATA: 'orange',
};

const DATA_TYPE_COLORS: Record<string, string> = {
	STRING: 'gray',
	NUMBER: 'orange',
	BOOLEAN: 'pink',
	DATE: 'cyan',
	DATETIME: 'indigo',
};

const normalizeColumns = (items: ReportValue[]): ReportValue[] =>
	[...items]
		.sort((a, b) => a.order - b.order)
		.map((item, index) => ({
			...item,
			format: item.format ?? null,
			order: index,
		}));

const toComparableColumn = (item: ReportValue) => ({
	id: item.id,
	originType: item.originType,
	key: item.key,
	label: item.label,
	dataType: item.dataType,
	format: item.format ?? null,
	order: item.order,
});

const ReportValuesSection = () => {
	const { t } = useTranslation([
		'campaign.form.report-values',
		'campaign.contact-list',
		'common',
	]);
	const campaignId = useContext(CampaignIdContext);
	const queryClient = useQueryClient();

	const [modalOpened, { open: openModal, close: closeModal }] =
		useDisclosure(false);
	const [editTarget, setEditTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [initialColumns, setInitialColumns] = useState<ReportValue[]>([]);
	const [draftColumns, setDraftColumns] = useState<ReportValue[]>([]);
	const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const nextTempIdRef = useRef(-1);
	const shouldSyncFromServerRef = useRef(false);

	const { data: columns = [], isLoading } = useGetReportColumns(
		campaignId ?? 0
	);
	const createMutation = useCreateReportValue(campaignId ?? 0, {
		invalidateOnSuccess: false,
	});
	const bulkUpdateMutation = useBulkUpdateReportValues(campaignId ?? 0, {
		invalidateOnSuccess: false,
	});
	const deleteMutation = useDeleteReportValue(campaignId ?? 0, {
		invalidateOnSuccess: false,
	});

	const hasPendingChanges = useMemo(() => {
		const initialComparable = JSON.stringify(
			initialColumns.filter((item) => item.id > 0).map(toComparableColumn)
		);
		const draftComparable = JSON.stringify(
			draftColumns.filter((item) => item.id > 0).map(toComparableColumn)
		);

		return (
			pendingDeleteIds.length > 0 ||
			draftColumns.some((item) => item.id < 0) ||
			initialComparable !== draftComparable
		);
	}, [draftColumns, initialColumns, pendingDeleteIds]);

	useEffect(() => {
		if (isSavingDraft) {
			return;
		}

		const normalized = normalizeColumns(columns);

		if (shouldSyncFromServerRef.current || !hasPendingChanges) {
			setInitialColumns(normalized);
			setDraftColumns(normalized);
			setPendingDeleteIds([]);
			shouldSyncFromServerRef.current = false;
		}
	}, [columns, hasPendingChanges, isSavingDraft]);

	const handleAddClick = () => {
		setEditTarget(undefined);
		openModal();
	};

	const handleEditClick = (reportValue: ReportValue) => {
		setEditTarget(reportValue);
		openModal();
	};

	const handleDeleteClick = (reportValue: ReportValue) => {
		modals.openConfirmModal({
			title: t('reportValues.deleteConfirm.title', {
				ns: 'campaign.contact-list',
			}),
			children: t('reportValues.deleteConfirm.message', {
				ns: 'campaign.contact-list',
				label: reportValue.label,
			}),
			labels: {
				confirm: t('reportValues.deleteConfirm.confirm', {
					ns: 'campaign.contact-list',
				}),
				cancel: t('reportValues.deleteConfirm.cancel', {
					ns: 'campaign.contact-list',
				}),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				setDraftColumns((prev) =>
					prev
						.filter((item) => item.id !== reportValue.id)
						.map((item, index) => ({ ...item, order: index }))
				);
				if (reportValue.id > 0) {
					setPendingDeleteIds((prev) =>
						prev.includes(reportValue.id) ? prev : [...prev, reportValue.id]
					);
				}
			},
		});
	};

	const handleRowReorder = async (
		sourceIndex: number,
		destinationIndex: number
	) => {
		if (sourceIndex === destinationIndex) return;
		const reordered = Array.from(draftColumns);
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(destinationIndex, 0, moved);
		setDraftColumns(
			reordered.map((item, index) => ({ ...item, order: index }))
		);
	};

	const handleSubmitDraft = (
		values: ReportValueFormValues,
		reportValue?: ReportValue
	) => {
		const normalizedDataType = values.dataType;
		if (!values.originType || !normalizedDataType) return;
		const originType = values.originType;

		setDraftColumns((prev) => {
			if (reportValue) {
				return prev.map((item) =>
					item.id === reportValue.id
						? {
								...item,
								originType,
								key: values.key,
								label: values.label,
								dataType: normalizedDataType,
							}
						: item
				);
			}

			const timestamp = new Date().toISOString();
			return [
				...prev,
				{
					id: nextTempIdRef.current--,
					originType,
					key: values.key,
					label: values.label,
					dataType: normalizedDataType,
					format: null,
					order: prev.length,
					campaignId: resolvedCampaignId,
					userId: 0,
					clientId: 0,
					createdAt: timestamp,
					updatedAt: timestamp,
					deletedAt: null,
				},
			];
		});
	};

	const handleDiscardChanges = () => {
		setDraftColumns(initialColumns);
		setPendingDeleteIds([]);
	};

	const handleSaveChanges = async () => {
		if (!hasPendingChanges) return;

		setIsSavingDraft(true);
		const createdItemsMap = new Map<number, ReportValue>();
		const deletedSucceededIds: number[] = [];

		try {
			const newItems = draftColumns.filter((item) => item.id < 0);

			for (const item of newItems) {
				const created = await createMutation.mutateAsync({
					originType: item.originType,
					key: item.key,
					label: item.label,
					dataType: item.dataType,
					order: item.order,
					campaignId: resolvedCampaignId,
				});
				createdItemsMap.set(item.id, {
					...created,
					format: created.format ?? item.format ?? null,
				});
			}

			const persistedColumns = draftColumns
				.map((item) => createdItemsMap.get(item.id) ?? item)
				.map((item, index) => ({
					...item,
					order: index,
				}));

			setDraftColumns(persistedColumns);

			const bulkItems: BulkUpdateReportValueItemDto[] = persistedColumns
				.filter((item) => item.id > 0)
				.map((item) => ({
					id: item.id,
					originType: item.originType,
					key: item.key,
					label: item.label,
					dataType: item.dataType,
					format: item.format ?? null,
					order: item.order,
				}));

			if (bulkItems.length > 0) {
				await bulkUpdateMutation.mutateAsync({
					reportValues: bulkItems,
				});
			}

			for (const id of pendingDeleteIds) {
				await deleteMutation.mutateAsync(id);
				deletedSucceededIds.push(id);
			}

			notifications.show({
				message: t('form.reportValues.notifications.saved'),
				color: 'green',
			});
			const syncedColumns = persistedColumns.filter((item) => item.id > 0);
			setInitialColumns(syncedColumns);
			setDraftColumns(syncedColumns);
			setPendingDeleteIds([]);
			shouldSyncFromServerRef.current = true;
			queryClient.setQueryData(
				['reportColumns', 'campaign', resolvedCampaignId],
				syncedColumns
			);
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', resolvedCampaignId],
			});
		} catch (error) {
			if (createdItemsMap.size > 0) {
				setDraftColumns((prev) =>
					prev
						.map((item) => createdItemsMap.get(item.id) ?? item)
						.map((item, index) => ({ ...item, order: index }))
				);
			}

			if (deletedSucceededIds.length > 0) {
				setPendingDeleteIds((prev) =>
					prev.filter((id) => !deletedSucceededIds.includes(id))
				);
			}

			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setIsSavingDraft(false);
		}
	};

	if (!campaignId) {
		return null;
	}

	const resolvedCampaignId = campaignId;

	const columnCountLabel = t('form.reportValues.count', {
		count: draftColumns.length,
	});

	const tableColumns = useMemo<BaseTableColumnDef<ReportValue>[]>(
		() => [
			{
				id: 'label',
				header: t('reportValues.columns.label', {
					ns: 'campaign.contact-list',
				}),
				meta: {
					headerClassName: styles.labelHeader,
					cellClassName: styles.labelColumn,
				},
				cell: ({ row }) => (
					<Group gap='sm' wrap='nowrap' className={styles.labelCell}>
						<Box className={styles.gripIcon}>
							<IconGripVertical size={16} />
						</Box>
						<Text size='xs' fw={700} c='dimmed' className={styles.orderPill}>
							{row.index + 1}
						</Text>
						<Box className={styles.labelContent}>
							<Text size='sm' fw={600} className={styles.labelValue}>
								{row.original.label}
							</Text>
							<Text
								size='xs'
								c='dimmed'
								ff='monospace'
								className={styles.keyValue}
							>
								{row.original.key}
							</Text>
						</Box>
					</Group>
				),
			},
			{
				id: 'originType',
				header: t('reportValues.columns.originType', {
					ns: 'campaign.contact-list',
				}),
				meta: {
					headerClassName: styles.originHeader,
					cellClassName: styles.originColumn,
				},
				cell: ({ row }) => (
					<Badge
						color={ORIGIN_TYPE_COLORS[row.original.originType] ?? 'gray'}
						variant='light'
						size='xs'
					>
						{t(`reportValues.originType.${row.original.originType}`, {
							ns: 'campaign.contact-list',
						})}
					</Badge>
				),
			},
			{
				id: 'dataType',
				header: t('reportValues.columns.dataType', {
					ns: 'campaign.contact-list',
				}),
				meta: {
					headerClassName: styles.dataTypeHeader,
					cellClassName: styles.dataTypeColumn,
				},
				cell: ({ row }) => (
					<Badge
						color={DATA_TYPE_COLORS[row.original.dataType] ?? 'gray'}
						variant='dot'
						size='xs'
					>
						{t(`reportValues.dataType.${row.original.dataType}`, {
							ns: 'campaign.contact-list',
						})}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: t('reportValues.columns.actions', {
					ns: 'campaign.contact-list',
				}),
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsColumn,
				},
				cell: ({ row }) => (
					<Group
						gap={4}
						justify='flex-end'
						wrap='nowrap'
						className={styles.actionsGroup}
					>
						<ActionIcon
							variant='subtle'
							size='sm'
							onClick={(event) => {
								event.stopPropagation();
								handleEditClick(row.original);
							}}
						>
							<IconEdit size={14} />
						</ActionIcon>
						<ActionIcon
							variant='subtle'
							color='red'
							size='sm'
							onClick={(event) => {
								event.stopPropagation();
								handleDeleteClick(row.original);
							}}
							loading={
								isSavingDraft &&
								row.original.id > 0 &&
								pendingDeleteIds.includes(row.original.id)
							}
						>
							<IconTrash size={14} />
						</ActionIcon>
					</Group>
				),
			},
		],
		[t, isSavingDraft, pendingDeleteIds]
	);

	return (
		<SectionCard
			title={t('form.reportValues.title')}
			description={t('form.reportValues.description')}
			actions={{
				primary: {
					kind: 'add',
					label: t('reportValues.addColumn', {
						ns: 'campaign.contact-list',
					}),
					onClick: handleAddClick,
				},
			}}
			headerExtras={
				<Badge variant='light' size='sm' className={styles.countBadge}>
					{columnCountLabel}
				</Badge>
			}
		>
			<Stack gap='md'>
				<BaseTable<ReportValue>
					className={styles.table}
					data={draftColumns}
					columns={tableColumns}
					density='compact'
					isLoading={isLoading}
					emptyMessage={t('reportValues.noColumns', {
						ns: 'campaign.contact-list',
					})}
					enableRowReordering
					onRowReorder={(sourceIndex, destinationIndex) =>
						void handleRowReorder(sourceIndex, destinationIndex)
					}
					getRowId={(row) => row.id}
				/>
				<Paper withBorder p='sm' radius='md' className={styles.saveBar}>
					<Group justify='space-between' align='center' gap='sm'>
						<Text size='sm' c={hasPendingChanges ? 'dimmed' : 'gray'}>
							{hasPendingChanges
								? t('form.reportValues.pendingChanges')
								: t('form.reportValues.noPendingChanges')}
						</Text>
						<Group gap='xs'>
							<Button
								variant='default'
								size='sm'
								onClick={handleDiscardChanges}
								disabled={!hasPendingChanges || isSavingDraft}
							>
								{t('form.reportValues.discardChanges')}
							</Button>
							<Button
								size='sm'
								onClick={() => void handleSaveChanges()}
								disabled={!hasPendingChanges}
								loading={isSavingDraft}
							>
								{t('form.reportValues.saveChanges')}
							</Button>
						</Group>
					</Group>
				</Paper>
			</Stack>

			<ReportValueFormModal
				opened={modalOpened}
				onClose={closeModal}
				campaignId={resolvedCampaignId}
				reportValue={editTarget}
				existingColumns={draftColumns}
				onSubmitDraft={handleSubmitDraft}
				isSubmittingDraft={isSavingDraft}
			/>
		</SectionCard>
	);
};

export default ReportValuesSection;
