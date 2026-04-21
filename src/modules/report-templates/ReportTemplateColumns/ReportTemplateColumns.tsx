import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLayoutGrid, IconPlus } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { ReportValue } from '~/models/ReportValue';
import { getDefaultSheetName, getNextSheetNumber } from './reportTemplateUtils';
import { useReportTemplateDraft } from './useReportTemplateDraft';
import { useReportTemplateColumns } from './useReportTemplateColumns';
import ReportTemplateColumnFormModal from './ReportTemplateColumnFormModal';
import styles from './ReportTemplateColumns.module.css';

type ReportValueModalMode = 'create' | 'edit' | 'move' | 'duplicate';

interface ReportTemplateColumnsProps {
	templateId: number;
}

const ReportTemplateColumns = ({ templateId }: ReportTemplateColumnsProps) => {
	const { t } = useTranslation(['report-templates', 'common']);

	const [modalOpened, { open: openModal, close: closeModal }] =
		useDisclosure(false);
	const [editTarget, setEditTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [templateTarget, setTemplateTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [modalMode, setModalMode] = useState<ReportValueModalMode>('create');
	const [activeSheet, setActiveSheet] = useState<{
		sheet: number;
		sheetName: string;
	} | null>(null);

	const {
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
	} = useReportTemplateDraft(templateId);

	const tableColumns = useReportTemplateColumns(
		{
			onMoveClick: (reportValue) => {
				const validTargetSheets = getValidTargetSheets(reportValue);
				const nextSheetNumber = getNextSheetNumber(groupedSheets);
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
			},
			onDuplicateClick: (reportValue) => {
				const validTargetSheets = getValidTargetSheets(reportValue);
				const nextSheetNumber = getNextSheetNumber(groupedSheets);
				const targetSheet = validTargetSheets[0] ?? {
					sheet: nextSheetNumber,
					sheetName: getDefaultSheetName(nextSheetNumber),
				};
				setModalMode('duplicate');
				setEditTarget(undefined);
				setActiveSheet({
					sheet: targetSheet.sheet,
					sheetName: targetSheet.sheetName,
				});
				setTemplateTarget(reportValue);
				openModal();
			},
			onEditClick: (reportValue) => {
				setModalMode('edit');
				setTemplateTarget(undefined);
				setActiveSheet({
					sheet: reportValue.sheet,
					sheetName: reportValue.sheetName,
				});
				setEditTarget(reportValue);
				openModal();
			},
			onDeleteClick: handleDeleteClick,
			isDeleting: (id: number) =>
				isSavingDraft && id > 0 && pendingDeleteIds.includes(id),
		},
		styles
	);

	const columnCountLabel = t('columns.count', {
		count: draftColumns.length,
	});
	const sheetCountLabel = t('columns.sheetCount', {
		count: groupedSheets.length,
	});

	const handleAddClick = () => {
		const defaultSheet = groupedSheets[0] ?? {
			sheet: 1,
			sheetName: getDefaultSheetName(1),
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

	const handleOpenAddSheet = () => {
		const newSheet = handleAddSheet();
		setModalMode('create');
		setEditTarget(undefined);
		setActiveSheet(newSheet);
		openModal();
	};

	const handleCloseModal = () => {
		setModalMode('create');
		setActiveSheet(null);
		setEditTarget(undefined);
		setTemplateTarget(undefined);
		closeModal();
	};

	return (
		<SectionCard
			title={t('columns.title')}
			description={t('columns.description')}
			actions={{
				primary: {
					kind: 'add',
					label: t('columns.addColumn'),
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
					<Button
						variant='default'
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={handleOpenAddSheet}
					>
						{t('columns.addSheet')}
					</Button>
				</Group>
			}
		>
			<Stack gap='md'>
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
								{t('columns.noSheetsTitle')}
							</Text>
							<Text size='sm' c='dimmed' ta='center'>
								{t('columns.noSheetsDescription')}
							</Text>
							<Group gap='xs'>
								<Button size='sm' onClick={handleOpenAddSheet}>
									{t('columns.addSheet')}
								</Button>
								<Button size='sm' variant='default' onClick={handleAddClick}>
									{t('columns.addColumn')}
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
											{t('columns.sheetLabel', {
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
													{t('columns.sheetColumnCount', {
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
											{t('columns.addColumnToSheet')}
										</Button>
										{!isEditingName ? (
											<Button
												variant='subtle'
												size='sm'
												onClick={() =>
													handleStartRenameSheet(group.sheet, group.sheetName)
												}
											>
												{t('columns.renameSheet')}
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
									emptyMessage={t('columns.noColumns')}
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

				<Paper
					withBorder
					p='sm'
					radius='md'
					className={hasPendingChanges ? styles.saveBarPending : styles.saveBar}
				>
					<Group justify='space-between' align='center' gap='sm'>
						<Text size='sm' c={hasPendingChanges ? 'dimmed' : 'gray'}>
							{hasPendingChanges
								? t('columns.pendingChanges')
								: t('columns.noPendingChanges')}
						</Text>
						<Group gap='xs'>
							<Button
								variant='default'
								size='sm'
								onClick={handleDiscardChanges}
								disabled={!hasPendingChanges || isSavingDraft}
							>
								{t('columns.discardChanges')}
							</Button>
							<Button
								size='sm'
								onClick={() => void handleSaveChanges()}
								disabled={!hasPendingChanges}
								loading={isSavingDraft}
							>
								{t('columns.saveChanges')}
							</Button>
						</Group>
					</Group>
				</Paper>
			</Stack>

			<ReportTemplateColumnFormModal
				opened={modalOpened}
				onClose={handleCloseModal}
				templateId={resolvedTemplateId}
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

export default ReportTemplateColumns;
