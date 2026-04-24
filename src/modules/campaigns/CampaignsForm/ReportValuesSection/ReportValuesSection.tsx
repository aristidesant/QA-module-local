import { useState, useContext } from 'react';
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
import { CampaignIdContext } from '~/modules/campaigns/campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { ReportValue } from '~/models/ReportValue';
import { getDefaultSheetName, getNextSheetNumber } from './reportValueUtils';
import { useReportValueDraft } from './useReportValueDraft';
import { useReportValueColumns } from './useReportValueColumns';
import ReportValueFormModal from './ReportValueFormModal';
import styles from './ReportValuesSection.module.css';

type ReportValueModalMode = 'create' | 'edit' | 'move' | 'duplicate';

const ReportValuesSection = () => {
	const { t } = useTranslation([
		'campaign.form.report-values',
		'campaign.contact-list',
		'common',
	]);
	const campaignId = useContext(CampaignIdContext);

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
		resolvedCampaignId,
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
	} = useReportValueDraft(campaignId ?? null);

	const tableColumns = useReportValueColumns(
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

	if (!campaignId) {
		return null;
	}

	const columnCountLabel = t('form.reportValues.count', {
		count: draftColumns.length,
	});
	const sheetCountLabel = t('form.reportValues.sheetCount', {
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
				<Group justify='flex-end'>
					<Button
						variant='default'
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={handleOpenAddSheet}
					>
						{t('form.reportValues.addSheet')}
					</Button>
				</Group>

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
								<Button size='sm' onClick={handleOpenAddSheet}>
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

				<Paper
					withBorder
					p='sm'
					radius='md'
					className={`${styles.sheetCard} ${styles.saveBar}`}
				>
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
				onClose={handleCloseModal}
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
