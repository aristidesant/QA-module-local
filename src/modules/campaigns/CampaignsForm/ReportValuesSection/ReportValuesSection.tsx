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
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconEdit,
	IconGripVertical,
	IconCopy,
	IconLayoutGrid,
	IconPlus,
	IconArrowsRightLeft,
	IconTrash,
} from '@tabler/icons-react';
import {
	useCreateReportValue,
	useBulkUpdateReportValues,
	useDuplicateReportValue,
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

type ReportValueModalMode = 'create' | 'edit' | 'move' | 'duplicate';

const DEFAULT_SHEET = 1;
const DEFAULT_SHEET_NAME_PREFIX = 'Report';
const INVALID_SHEET_NAME_PATTERN = /[:\\/?*\[\]]/;

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

type SheetGroup = {
	sheet: number;
	sheetName: string;
	columns: ReportValue[];
};

const isSameSheetColumn = (left: ReportValue, right: ReportValue) =>
	left.originType === right.originType && left.key === right.key;

const getDefaultSheetName = (sheet: number) =>
	`${DEFAULT_SHEET_NAME_PREFIX} ${sheet}`;

const getNormalizedSheetNumber = (sheet: number | null | undefined) => {
	if (!Number.isInteger(sheet) || (sheet ?? 0) < 1) {
		return DEFAULT_SHEET;
	}

	return Number(sheet);
};

const getNormalizedSheetName = (
	sheetName: string | null | undefined,
	sheet: number
) => {
	const trimmed = sheetName?.trim();
	return trimmed ? trimmed : getDefaultSheetName(sheet);
};

const normalizeColumns = (items: ReportValue[]): ReportValue[] => {
	const grouped = new Map<number, ReportValue[]>();

	for (const item of items) {
		const sheet = getNormalizedSheetNumber(item.sheet);
		const normalizedItem = {
			...item,
			format: item.format ?? null,
			sheet,
			sheetName: getNormalizedSheetName(item.sheetName, sheet),
		};

		const current = grouped.get(sheet) ?? [];
		current.push(normalizedItem);
		grouped.set(sheet, current);
	}

	return [...grouped.entries()]
		.sort(([leftSheet], [rightSheet]) => leftSheet - rightSheet)
		.flatMap(([, group]) =>
			[...group]
				.sort((a, b) => a.order - b.order || a.id - b.id)
				.map((item, index) => ({
					...item,
					order: index,
				}))
		);
};

const buildSheetGroups = (items: ReportValue[]): SheetGroup[] => {
	const grouped = new Map<number, SheetGroup>();

	for (const item of normalizeColumns(items)) {
		const existing = grouped.get(item.sheet);
		if (existing) {
			existing.columns.push(item);
			continue;
		}

		grouped.set(item.sheet, {
			sheet: item.sheet,
			sheetName: item.sheetName,
			columns: [item],
		});
	}

	return [...grouped.values()].sort((a, b) => a.sheet - b.sheet);
};

const toComparableColumn = (item: ReportValue) => ({
	id: item.id,
	originType: item.originType,
	key: item.key,
	label: item.label,
	dataType: item.dataType,
	format: item.format ?? null,
	order: item.order,
	sheet: item.sheet,
	sheetName: item.sheetName,
});

const validateSheetName = (
	sheetName: string,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const trimmedName = sheetName.trim();

	if (!trimmedName) {
		return t('reportValues.validation.sheetNameRequired', {
			ns: 'campaign.contact-list',
		});
	}

	if (trimmedName.length > 31) {
		return t('reportValues.validation.sheetNameTooLong', {
			ns: 'campaign.contact-list',
		});
	}

	if (INVALID_SHEET_NAME_PATTERN.test(trimmedName)) {
		return t('reportValues.validation.sheetNameInvalidChars', {
			ns: 'campaign.contact-list',
		});
	}

	return null;
};

const validateDraftColumns = (
	items: ReportValue[],
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	const sheetToName = new Map<number, string>();
	const nameToSheet = new Map<string, number>();
	const sheetColumnKeys = new Set<string>();

	for (const item of items) {
		if (!Number.isInteger(item.sheet) || item.sheet < 1) {
			return t('reportValues.validation.sheetRequired', {
				ns: 'campaign.contact-list',
			});
		}

		const sheetNameError = validateSheetName(item.sheetName, t);
		if (sheetNameError) {
			return sheetNameError;
		}

		const normalizedSheetName = item.sheetName.trim();
		const existingSheetName = sheetToName.get(item.sheet);
		if (existingSheetName && existingSheetName !== normalizedSheetName) {
			return t('reportValues.validation.sheetNameMismatch', {
				ns: 'campaign.contact-list',
				sheet: item.sheet,
			});
		}

		sheetToName.set(item.sheet, normalizedSheetName);

		const existingSheet = nameToSheet.get(normalizedSheetName);
		if (existingSheet && existingSheet !== item.sheet) {
			return t('reportValues.validation.sheetNameAlreadyAssigned', {
				ns: 'campaign.contact-list',
				sheetName: normalizedSheetName,
				sheet: existingSheet,
			});
		}

		nameToSheet.set(normalizedSheetName, item.sheet);

		const uniqueColumnKey = `${item.sheet}:${item.originType}:${item.key}`;
		if (sheetColumnKeys.has(uniqueColumnKey)) {
			return t('reportValues.validation.duplicateColumnInSheet', {
				ns: 'campaign.contact-list',
				label: item.label,
				sheet: item.sheet,
			});
		}

		sheetColumnKeys.add(uniqueColumnKey);
	}

	return null;
};

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
	const [templateTarget, setTemplateTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [modalMode, setModalMode] = useState<ReportValueModalMode>('create');
	const [initialColumns, setInitialColumns] = useState<ReportValue[]>([]);
	const [draftColumns, setDraftColumns] = useState<ReportValue[]>([]);
	const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [sheetDrafts, setSheetDrafts] = useState<Record<number, string>>({});
	const [activeSheet, setActiveSheet] = useState<{
		sheet: number;
		sheetName: string;
	} | null>(null);
	const nextTempIdRef = useRef(-1);
	const shouldSyncFromServerRef = useRef(false);

	const { data: columns = [], isLoading } = useGetReportColumns(
		campaignId ?? 0
	);
	const createMutation = useCreateReportValue(campaignId ?? 0, {
		invalidateOnSuccess: false,
	});
	const duplicateMutation = useDuplicateReportValue(campaignId ?? 0, {
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

	const groupedSheets = useMemo(
		() => buildSheetGroups(draftColumns),
		[draftColumns]
	);

	const sheetOptions = useMemo(
		() =>
			groupedSheets.map((group) => ({
				sheet: group.sheet,
				sheetName: group.sheetName,
			})),
		[groupedSheets]
	);

	useEffect(() => {
		if (isSavingDraft) {
			return;
		}

		const normalized = normalizeColumns(columns);

		if (shouldSyncFromServerRef.current || !hasPendingChanges) {
			setInitialColumns(normalized);
			setDraftColumns(normalized);
			setPendingDeleteIds([]);
			setSheetDrafts({});
			shouldSyncFromServerRef.current = false;
		}
	}, [columns, hasPendingChanges, isSavingDraft]);

	if (!campaignId) {
		return null;
	}

	const resolvedCampaignId = campaignId;

	const getNextSheetNumber = () => {
		const usedSheets = new Set(groupedSheets.map((group) => group.sheet));
		let nextSheet = DEFAULT_SHEET;

		while (usedSheets.has(nextSheet)) {
			nextSheet += 1;
		}

		return nextSheet;
	};

	const getValidTargetSheets = (reportValue: ReportValue) =>
		groupedSheets.filter(
			(group) =>
				group.sheet !== reportValue.sheet &&
				!group.columns.some((item) => isSameSheetColumn(item, reportValue))
		);

	const reindexSheetColumns = (
		items: ReportValue[],
		sheet: number,
		sheetName?: string
	) => {
		let order = 0;
		return items.map((item) => {
			if (item.sheet !== sheet) {
				return item;
			}

			const nextItem = {
				...item,
				order: order++,
				sheetName: sheetName ? sheetName.trim() : item.sheetName,
			};

			return nextItem;
		});
	};

	const handleAddClick = () => {
		const defaultSheet = groupedSheets[0] ?? {
			sheet: DEFAULT_SHEET,
			sheetName: getDefaultSheetName(DEFAULT_SHEET),
		};
		setModalMode('create');
		setTemplateTarget(undefined);
		setActiveSheet(defaultSheet);
		setEditTarget(undefined);
		openModal();
	};

	const handleAddColumnToSheet = (sheet: number, sheetName: string) => {
		setModalMode('create');
		setTemplateTarget(undefined);
		setActiveSheet({ sheet, sheetName });
		setEditTarget(undefined);
		openModal();
	};

	const handleEditClick = (reportValue: ReportValue) => {
		setModalMode('edit');
		setTemplateTarget(undefined);
		setActiveSheet({
			sheet: reportValue.sheet,
			sheetName: reportValue.sheetName,
		});
		setEditTarget(reportValue);
		openModal();
	};

	const handleMoveClick = (reportValue: ReportValue) => {
		const validTargetSheets = getValidTargetSheets(reportValue);
		const nextSheetNumber = getNextSheetNumber();
		const targetSheet = validTargetSheets[0] ?? {
			sheet: nextSheetNumber,
			sheetName: getDefaultSheetName(nextSheetNumber),
		};

		setModalMode('move');
		setTemplateTarget(undefined);
		setActiveSheet({
			sheet: targetSheet.sheet,
			sheetName: targetSheet.sheetName,
		});
		setEditTarget(reportValue);
		openModal();
	};

	const handleDuplicateClick = (reportValue: ReportValue) => {
		const validTargetSheets = getValidTargetSheets(reportValue);
		const nextSheetNumber = getNextSheetNumber();

		setModalMode('duplicate');
		setEditTarget(undefined);
		const targetSheet = validTargetSheets[0] ?? {
			sheet: nextSheetNumber,
			sheetName: getDefaultSheetName(nextSheetNumber),
		};
		setActiveSheet({
			sheet: targetSheet.sheet,
			sheetName: targetSheet.sheetName,
		});
		setTemplateTarget(reportValue);
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
				setDraftColumns((prev) => {
					const remaining = prev.filter((item) => item.id !== reportValue.id);
					return normalizeColumns(remaining);
				});
				if (reportValue.id > 0) {
					setPendingDeleteIds((prev) =>
						prev.includes(reportValue.id) ? prev : [...prev, reportValue.id]
					);
				}
			},
		});
	};

	const handleRowReorder = (
		sheet: number,
		sourceIndex: number,
		destinationIndex: number
	) => {
		if (sourceIndex === destinationIndex) return;

		setDraftColumns((prev) => {
			const sheetItems = prev.filter((item) => item.sheet === sheet);
			const otherItems = prev.filter((item) => item.sheet !== sheet);
			const reordered = Array.from(sheetItems);
			const [moved] = reordered.splice(sourceIndex, 1);
			reordered.splice(destinationIndex, 0, moved);

			const reindexedSheet = reordered.map((item, index) => ({
				...item,
				order: index,
			}));

			return normalizeColumns([...otherItems, ...reindexedSheet]);
		});
	};

	const handleStartRenameSheet = (sheet: number, currentName: string) => {
		setSheetDrafts((prev) => ({
			...prev,
			[sheet]: currentName,
		}));
	};

	const handleRenameSheetChange = (sheet: number, value: string) => {
		setSheetDrafts((prev) => ({
			...prev,
			[sheet]: value,
		}));
	};

	const handleRenameSheetCancel = (sheet: number) => {
		setSheetDrafts((prev) => {
			const next = { ...prev };
			delete next[sheet];
			return next;
		});
	};

	const handleRenameSheetSubmit = (sheet: number, currentName: string) => {
		const nextName = sheetDrafts[sheet] ?? currentName;
		const nameError = validateSheetName(nextName, t);
		if (nameError) {
			notifications.show({ message: nameError, color: 'red' });
			return;
		}

		setDraftColumns((prev) =>
			normalizeColumns(reindexSheetColumns(prev, sheet, nextName.trim()))
		);
		handleRenameSheetCancel(sheet);
	};

	const handleAddSheet = () => {
		const nextSheet = getNextSheetNumber();
		const sheetName = getDefaultSheetName(nextSheet);

		setSheetDrafts((prev) => ({
			...prev,
			[nextSheet]: sheetName,
		}));
		setActiveSheet({ sheet: nextSheet, sheetName });
		setEditTarget(undefined);
		openModal();
	};

	const handleSubmitDraft = (
		values: ReportValueFormValues,
		reportValue?: ReportValue
	) => {
		const normalizedDataType = values.dataType;
		if (!values.originType || !normalizedDataType) return;

		const sheet = getNormalizedSheetNumber(values.sheet);
		const sheetName = getNormalizedSheetName(values.sheetName, sheet);
		const sheetNameError = validateSheetName(sheetName, t);
		if (sheetNameError) {
			throw new Error(sheetNameError);
		}

		const originType = values.originType;

		setDraftColumns((prev) => {
			if (reportValue) {
				const isMovingAcrossSheets = reportValue.sheet !== sheet;
				const targetOrder = isMovingAcrossSheets
					? prev.filter(
							(item) => item.id !== reportValue.id && item.sheet === sheet
						).length
					: reportValue.order;

				const nextColumns = prev.map((item) =>
					item.id === reportValue.id
						? {
								...item,
								originType,
								key: values.key,
								label: values.label,
								dataType: normalizedDataType,
								order: targetOrder,
								sheet,
								sheetName,
							}
						: item
				);

				return normalizeColumns(nextColumns);
			}

			const timestamp = new Date().toISOString();
			const sheetItemsCount = prev.filter(
				(item) => item.sheet === sheet
			).length;
			return normalizeColumns([
				...prev,
				{
					id: nextTempIdRef.current--,
					originType,
					key: values.key,
					label: values.label,
					dataType: normalizedDataType,
					format: null,
					order: sheetItemsCount,
					sheet,
					sheetName,
					campaignId: resolvedCampaignId,
					userId: 0,
					clientId: 0,
					createdAt: timestamp,
					updatedAt: timestamp,
					deletedAt: null,
				},
			]);
		});
	};

	const handleDuplicateSubmit = async (
		values: ReportValueFormValues,
		sourceReportValue: ReportValue
	) => {
		setIsSavingDraft(true);
		const sheet = getNormalizedSheetNumber(values.sheet);
		const sheetName = getNormalizedSheetName(values.sheetName, sheet);
		const label = values.label.trim();
		const order = draftColumns.filter((item) => item.sheet === sheet).length;

		try {
			const duplicated = await duplicateMutation.mutateAsync({
				id: sourceReportValue.id,
				dto: {
					sheet,
					sheetName,
					order,
					label,
				},
			});

			const nextColumns = normalizeColumns([...draftColumns, duplicated]);
			setInitialColumns(nextColumns);
			setDraftColumns(nextColumns);
			setPendingDeleteIds([]);
			setSheetDrafts({});
			shouldSyncFromServerRef.current = true;
			queryClient.setQueryData(
				['reportColumns', 'campaign', resolvedCampaignId],
				nextColumns
			);
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', resolvedCampaignId],
			});

			notifications.show({
				message: t('reportValues.notifications.duplicated', {
					ns: 'campaign.contact-list',
				}),
				color: 'green',
			});
		} finally {
			setIsSavingDraft(false);
		}
	};

	const handleDiscardChanges = () => {
		setDraftColumns(initialColumns);
		setPendingDeleteIds([]);
		setSheetDrafts({});
	};

	const handleSaveChanges = async () => {
		if (!hasPendingChanges) return;

		const normalizedDraft = normalizeColumns(draftColumns);
		const validationError = validateDraftColumns(normalizedDraft, t);
		if (validationError) {
			notifications.show({ message: validationError, color: 'red' });
			return;
		}

		setIsSavingDraft(true);
		const createdItemsMap = new Map<number, ReportValue>();
		const deletedSucceededIds: number[] = [];

		try {
			const newItems = normalizedDraft.filter((item) => item.id < 0);

			for (const item of newItems) {
				const created = await createMutation.mutateAsync({
					originType: item.originType,
					key: item.key,
					label: item.label,
					dataType: item.dataType,
					order: item.order,
					sheet: item.sheet,
					sheetName: item.sheetName,
					campaignId: resolvedCampaignId,
				});

				createdItemsMap.set(item.id, {
					...created,
					format: created.format ?? item.format ?? null,
					sheet: getNormalizedSheetNumber(created.sheet ?? item.sheet),
					sheetName: getNormalizedSheetName(
						created.sheetName ?? item.sheetName,
						created.sheet ?? item.sheet
					),
				});
			}

			const persistedColumns = normalizeColumns(
				normalizedDraft.map((item) => createdItemsMap.get(item.id) ?? item)
			);

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
					sheet: item.sheet,
					sheetName: item.sheetName,
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
			setSheetDrafts({});
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
					normalizeColumns(
						prev.map((item) => createdItemsMap.get(item.id) ?? item)
					)
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

	const columnCountLabel = t('form.reportValues.count', {
		count: draftColumns.length,
	});
	const sheetCountLabel = t('form.reportValues.sheetCount', {
		count: groupedSheets.length,
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
							{row.original.order + 1}
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
				cell: ({ row }) => {
					return (
						<Group
							gap={4}
							justify='flex-end'
							wrap='nowrap'
							className={styles.actionsGroup}
						>
							<Tooltip
								label={t('reportValues.actions.moveToSheet', {
									ns: 'campaign.contact-list',
								})}
								withArrow
							>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										handleMoveClick(row.original);
									}}
								>
									<IconArrowsRightLeft size={14} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={t('reportValues.actions.duplicateToSheet', {
									ns: 'campaign.contact-list',
								})}
								withArrow
							>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										handleDuplicateClick(row.original);
									}}
								>
									<IconCopy size={14} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('actions.edit', { ns: 'common' })} withArrow>
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
							</Tooltip>
							<Tooltip label={t('actions.delete', { ns: 'common' })} withArrow>
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
							</Tooltip>
						</Group>
					);
				},
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
				<Group gap='xs'>
					<Badge variant='light' size='sm' className={styles.countBadge}>
						{sheetCountLabel}
					</Badge>
					<Badge variant='light' size='sm' className={styles.countBadge}>
						{columnCountLabel}
					</Badge>
				</Group>
			}
		>
			<Stack gap='md'>
				<Paper withBorder p='sm' radius='md' className={styles.summaryCard}>
					<Group justify='space-between' align='center' gap='sm'>
						<div>
							<Text size='xs' fw={700} c='dimmed' tt='uppercase'>
								{t('form.reportValues.summaryEyebrow')}
							</Text>
							<Text size='sm' fw={600}>
								{t('form.reportValues.summaryTitle')}
							</Text>
							<Text size='sm' c='dimmed'>
								{t('form.reportValues.summaryDescription')}
							</Text>
						</div>
						<Button
							variant='default'
							size='sm'
							leftSection={<IconPlus size={14} />}
							onClick={handleAddSheet}
						>
							{t('form.reportValues.addSheet')}
						</Button>
					</Group>
				</Paper>

				{groupedSheets.length === 0 && !isLoading ? (
					<Paper
						withBorder
						p='lg'
						radius='md'
						className={styles.emptyStateCard}
					>
						<Stack gap='xs' align='center'>
							<IconLayoutGrid size={20} className={styles.emptyStateIcon} />
							<Text size='sm' fw={600} ta='center'>
								{t('form.reportValues.noSheetsTitle')}
							</Text>
							<Text size='sm' c='dimmed' ta='center'>
								{t('form.reportValues.noSheetsDescription')}
							</Text>
							<Group gap='xs'>
								<Button size='sm' onClick={handleAddSheet}>
									{t('form.reportValues.addSheet')}
								</Button>
								<Button size='sm' variant='default' onClick={handleAddClick}>
									{t('reportValues.addColumn', {
										ns: 'campaign.contact-list',
									})}
								</Button>
							</Group>
						</Stack>
					</Paper>
				) : null}

				{groupedSheets.map((group) => {
					const renameDraft = sheetDrafts[group.sheet];
					const isEditingName = typeof renameDraft === 'string';

					return (
						<Paper
							key={group.sheet}
							withBorder
							p='sm'
							radius='md'
							className={styles.sheetCard}
						>
							<Stack gap='sm'>
								<Group justify='space-between' align='flex-start' gap='sm'>
									<div className={styles.sheetHeaderMain}>
										<Badge
											variant='light'
											size='sm'
											className={styles.sheetBadge}
										>
											{t('form.reportValues.sheetLabel', {
												sheet: group.sheet,
											})}
										</Badge>
										{isEditingName ? (
											<Group
												gap='xs'
												align='flex-start'
												className={styles.renameRow}
											>
												<TextInput
													size='sm'
													value={renameDraft}
													onChange={(event) =>
														handleRenameSheetChange(
															group.sheet,
															event.currentTarget.value
														)
													}
													className={styles.renameInput}
												/>
												<Group gap='xs'>
													<Button
														size='xs'
														onClick={() =>
															handleRenameSheetSubmit(
																group.sheet,
																group.sheetName
															)
														}
													>
														{t('actions.save', { ns: 'common' })}
													</Button>
													<Button
														size='xs'
														variant='default'
														onClick={() => handleRenameSheetCancel(group.sheet)}
													>
														{t('actions.cancel', { ns: 'common' })}
													</Button>
												</Group>
											</Group>
										) : (
											<>
												<Text size='md' fw={700} className={styles.sheetTitle}>
													{group.sheetName}
												</Text>
												<Text size='sm' c='dimmed'>
													{t('form.reportValues.sheetColumnCount', {
														count: group.columns.length,
													})}
												</Text>
											</>
										)}
									</div>
									<Group gap='xs'>
										<Button
											variant='default'
											size='sm'
											onClick={() =>
												handleAddColumnToSheet(group.sheet, group.sheetName)
											}
										>
											{t('form.reportValues.addColumnToSheet')}
										</Button>
										{!isEditingName ? (
											<Button
												variant='subtle'
												size='sm'
												onClick={() =>
													handleStartRenameSheet(group.sheet, group.sheetName)
												}
											>
												{t('form.reportValues.renameSheet')}
											</Button>
										) : null}
									</Group>
								</Group>

								<BaseTable<ReportValue>
									className={styles.table}
									data={group.columns}
									columns={tableColumns}
									density='compact'
									isLoading={isLoading}
									emptyMessage={t('reportValues.noColumns', {
										ns: 'campaign.contact-list',
									})}
									enableRowReordering
									onRowReorder={(sourceIndex, destinationIndex) =>
										handleRowReorder(group.sheet, sourceIndex, destinationIndex)
									}
									getRowId={(row) => row.id}
								/>
							</Stack>
						</Paper>
					);
				})}

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
				onClose={() => {
					setModalMode('create');
					setActiveSheet(null);
					setEditTarget(undefined);
					setTemplateTarget(undefined);
					closeModal();
				}}
				campaignId={resolvedCampaignId}
				reportValue={editTarget}
				templateColumn={templateTarget}
				mode={modalMode}
				existingColumns={draftColumns}
				onSubmitDraft={handleSubmitDraft}
				onSubmitDuplicate={handleDuplicateSubmit}
				isSubmittingDraft={isSavingDraft}
				isSubmittingDuplicate={duplicateMutation.isPending}
				availableSheets={sheetOptions}
				defaultSheet={activeSheet ?? undefined}
			/>
		</SectionCard>
	);
};

export default ReportValuesSection;
