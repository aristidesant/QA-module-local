import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import {
	useCreateReportTemplateColumn,
	useBulkUpdateReportTemplateColumns,
	useDuplicateReportTemplateColumn,
	useGetAllReportTemplateColumns,
	useDeleteReportTemplateColumn,
} from '~/queries/reportTemplatesQueries';
import type {
	BulkUpdateReportValueItemDto,
	ReportValue,
} from '~/models/ReportValue';
import { getErrorMessage } from '~/utils/httpClient';
import type { FormValues as ReportValueFormValues } from './ReportTemplateColumnFormModal';
import {
	ORIGIN_TYPE_COLORS,
	DATA_TYPE_COLORS,
	normalizeColumns,
	getNormalizedSheetNumber,
	getNormalizedSheetName,
	validateSheetName,
	validateDraftColumns,
	getNextSheetNumber,
	reindexSheetColumns,
	getDefaultSheetName,
	buildSheetGroups,
	toComparableColumn,
	isSameSheetColumn,
} from './reportTemplateUtils';

type SheetOption = {
	sheet: number;
	sheetName: string;
};

export const useReportTemplateDraft = (templateId: number | null) => {
	const { t } = useTranslation(['report-templates', 'common']);
	const queryClient = useQueryClient();

	const [initialColumns, setInitialColumns] = useState<ReportValue[]>([]);
	const [draftColumns, setDraftColumns] = useState<ReportValue[]>([]);
	const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [sheetDrafts, setSheetDrafts] = useState<Record<number, string>>({});
	const nextTempIdRef = useRef(-1);
	const shouldSyncFromServerRef = useRef(false);

	const resolvedTemplateId = templateId ?? 0;

	const { data: columns = [], isLoading } =
		useGetAllReportTemplateColumns(resolvedTemplateId);
	const createMutation = useCreateReportTemplateColumn(resolvedTemplateId, {
		invalidateOnSuccess: false,
	});
	const duplicateMutation = useDuplicateReportTemplateColumn(
		resolvedTemplateId,
		{
			invalidateOnSuccess: false,
		}
	);
	const bulkUpdateMutation = useBulkUpdateReportTemplateColumns(
		resolvedTemplateId,
		{
			invalidateOnSuccess: false,
		}
	);
	const deleteMutation = useDeleteReportTemplateColumn(resolvedTemplateId, {
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

	const sheetOptions = useMemo<SheetOption[]>(
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

	const getValidTargetSheets = useCallback(
		(reportValue: ReportValue) =>
			groupedSheets.filter(
				(group) =>
					group.sheet !== reportValue.sheet &&
					!group.columns.some((item) => isSameSheetColumn(item, reportValue))
			),
		[groupedSheets]
	);

	const handleAddSheet = useCallback(() => {
		const nextSheet = getNextSheetNumber(groupedSheets);
		const sheetName = getDefaultSheetName(nextSheet);

		setSheetDrafts((prev) => ({
			...prev,
			[nextSheet]: sheetName,
		}));

		return { sheet: nextSheet, sheetName };
	}, [groupedSheets]);

	const handleDeleteClick = useCallback(
		(reportValue: ReportValue) => {
			modals.openConfirmModal({
				title: t('columns.deleteConfirm.title', {
					label: reportValue.label,
				}),
				children: t('columns.deleteConfirm.message', {
					label: reportValue.label,
				}),
				labels: {
					confirm: t('columns.deleteConfirm.confirm'),
					cancel: t('columns.deleteConfirm.cancel'),
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
		},
		[t]
	);

	const handleRowReorder = useCallback(
		(sheet: number, sourceIndex: number, destinationIndex: number) => {
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
		},
		[]
	);

	const handleStartRenameSheet = useCallback(
		(sheet: number, currentName: string) => {
			setSheetDrafts((prev) => ({
				...prev,
				[sheet]: currentName,
			}));
		},
		[]
	);

	const handleRenameSheetChange = useCallback(
		(sheet: number, value: string) => {
			setSheetDrafts((prev) => ({
				...prev,
				[sheet]: value,
			}));
		},
		[]
	);

	const handleRenameSheetCancel = useCallback((sheet: number) => {
		setSheetDrafts((prev) => {
			const next = { ...prev };
			delete next[sheet];
			return next;
		});
	}, []);

	const handleRenameSheetSubmit = useCallback(
		(sheet: number, currentName: string) => {
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
		},
		[sheetDrafts, t, handleRenameSheetCancel]
	);

	const handleSubmitDraft = useCallback(
		(values: ReportValueFormValues, reportValue?: ReportValue) => {
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
						reportTemplateId: resolvedTemplateId,
						userId: 0,
						clientId: 0,
						createdAt: timestamp,
						updatedAt: timestamp,
						deletedAt: null,
					},
				]);
			});
		},
		[t, resolvedTemplateId]
	);

	const handleDuplicateSubmit = useCallback(
		async (values: ReportValueFormValues, sourceReportValue: ReportValue) => {
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
					['reportTemplateColumns', 'all', resolvedTemplateId],
					nextColumns
				);
				void queryClient.invalidateQueries({
					queryKey: ['reportTemplateColumns', 'all', resolvedTemplateId],
				});

				notifications.show({
					message: t('columns.notifications.duplicated'),
					color: 'green',
				});
			} finally {
				setIsSavingDraft(false);
			}
		},
		[draftColumns, duplicateMutation, queryClient, resolvedTemplateId, t]
	);

	const handleDiscardChanges = useCallback(() => {
		setDraftColumns(initialColumns);
		setPendingDeleteIds([]);
		setSheetDrafts({});
	}, [initialColumns]);

	const handleSaveChanges = useCallback(async () => {
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
					reportTemplateId: resolvedTemplateId,
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
				message: t('columns.notifications.saved'),
				color: 'green',
			});
			const syncedColumns = persistedColumns.filter((item) => item.id > 0);
			setInitialColumns(syncedColumns);
			setDraftColumns(syncedColumns);
			setPendingDeleteIds([]);
			setSheetDrafts({});
			shouldSyncFromServerRef.current = true;
			queryClient.setQueryData(
				['reportTemplateColumns', 'all', resolvedTemplateId],
				syncedColumns
			);
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', resolvedTemplateId],
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
	}, [
		hasPendingChanges,
		draftColumns,
		pendingDeleteIds,
		createMutation,
		bulkUpdateMutation,
		deleteMutation,
		queryClient,
		resolvedTemplateId,
		t,
	]);

	return {
		draftColumns,
		pendingDeleteIds,
		isSavingDraft,
		hasPendingChanges,
		isLoading,
		sheetDrafts,
		groupedSheets,
		sheetOptions,
		duplicateMutation,
		resolvedTemplateId,
		setSheetDrafts,
		getValidTargetSheets,
		handleAddSheet,
		handleDeleteClick,
		handleRowReorder,
		handleStartRenameSheet,
		handleRenameSheetChange,
		handleRenameSheetCancel,
		handleRenameSheetSubmit,
		handleSubmitDraft,
		handleDuplicateSubmit,
		handleDiscardChanges,
		handleSaveChanges,
		ORIGIN_TYPE_COLORS,
		DATA_TYPE_COLORS,
	};
};
