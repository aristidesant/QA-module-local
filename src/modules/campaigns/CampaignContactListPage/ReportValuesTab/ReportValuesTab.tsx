import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Flex,
	Group,
	Loader,
	Menu,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import {
	IconChevronDown,
	IconDownload,
	IconEdit,
	IconFileSpreadsheet,
	IconFileTypeCsv,
	IconGripVertical,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import {
	useGetReportColumns,
	useUpdateReportValue,
	useDeleteReportValue,
} from '~/queries/reportValuesQueries';
import reportValuesApi from '~/api/reportValuesApi';
import type { ReportValue } from '~/models/ReportValue';
import { getErrorMessage } from '~/utils/httpClient';
import ReportValueFormModal from './ReportValueFormModal';

interface ReportValuesTabProps {
	contactGroupId: number;
	campaignId: number;
}

const ORIGIN_TYPE_COLORS: Record<string, string> = {
	SQL: 'blue',
	DYNAMIC: 'violet',
	OBJECT: 'teal',
};

const DATA_TYPE_COLORS: Record<string, string> = {
	STRING: 'gray',
	NUMBER: 'orange',
	BOOLEAN: 'pink',
	DATE: 'cyan',
	DATETIME: 'indigo',
};

type ReportExportFormat = 'csv' | 'xlsx';

const ReportValuesTab = ({
	contactGroupId,
	campaignId,
}: ReportValuesTabProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const [modalOpened, { open: openModal, close: closeModal }] =
		useDisclosure(false);
	const [editTarget, setEditTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [isExporting, setIsExporting] = useState(false);
	const [isReordering, setIsReordering] = useState(false);

	const {
		data: columns = [],
		isLoading,
		refetch,
	} = useGetReportColumns(contactGroupId);
	const updateMutation = useUpdateReportValue(contactGroupId);
	const deleteMutation = useDeleteReportValue(contactGroupId);

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
			title: t('reportValues.deleteConfirm.title'),
			children: t('reportValues.deleteConfirm.message', {
				label: reportValue.label,
			}),
			labels: {
				confirm: t('reportValues.deleteConfirm.confirm'),
				cancel: t('reportValues.deleteConfirm.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(reportValue.id);
					notifications.show({
						message: t('reportValues.notifications.deleted'),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination) return;
		const { source, destination } = result;
		if (source.index === destination.index) return;

		const reordered = Array.from(columns);
		const [moved] = reordered.splice(source.index, 1);
		reordered.splice(destination.index, 0, moved);

		const changed = reordered
			.map((item, idx) => ({ item, newOrder: idx }))
			.filter(({ item, newOrder }) => item.order !== newOrder);

		if (changed.length === 0) return;

		setIsReordering(true);
		try {
			await Promise.all(
				changed.map(({ item, newOrder }) =>
					updateMutation.mutateAsync({ id: item.id, dto: { order: newOrder } })
				)
			);
		} catch {
			notifications.show({
				message: t('reportValues.notifications.reorderError'),
				color: 'red',
			});
			void refetch();
		} finally {
			setIsReordering(false);
		}
	};

	const handleExport = async (format: ReportExportFormat) => {
		setIsExporting(true);
		try {
			const api = reportValuesApi();
			const response = await api.exportReport(contactGroupId, format);

			if (response.status === 204) {
				notifications.show({
					message: t('reportValues.noDataToExport'),
					color: 'yellow',
				});
				return;
			}

			if (response.status !== 200) {
				notifications.show({
					message: t('reportValues.exportError'),
					color: 'red',
				});
				return;
			}

			const mimeType =
				format === 'xlsx'
					? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					: 'text/csv';
			const blob = new Blob([response.data as BlobPart], { type: mimeType });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `report-${contactGroupId}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setIsExporting(false);
		}
	};

	if (isLoading) {
		return (
			<Flex justify='center' align='center' py='xl'>
				<Loader size='md' />
			</Flex>
		);
	}

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={handleAddClick}
					size='sm'
				>
					{t('reportValues.addColumn')}
				</Button>
				<Menu shadow='md' width={200} position='bottom-end' withArrow>
					<Menu.Target>
						<Button
							leftSection={<IconDownload size={16} />}
							rightSection={<IconChevronDown size={14} />}
							variant='light'
							loading={isExporting}
							disabled={isExporting}
							size='sm'
						>
							{t('reportValues.export')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>{t('reportValues.exportFormatLabel')}</Menu.Label>
						<Menu.Item
							leftSection={<IconFileTypeCsv size={14} />}
							onClick={() => void handleExport('csv')}
							disabled={isExporting}
						>
							{t('reportValues.exportFormatCsv')}
						</Menu.Item>
						<Menu.Item
							leftSection={<IconFileSpreadsheet size={14} />}
							onClick={() => void handleExport('xlsx')}
							disabled={isExporting}
						>
							{t('reportValues.exportFormatXlsx')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>

			{columns.length === 0 ? (
				<Text c='dimmed' ta='center' py='xl' size='sm'>
					{t('reportValues.noColumns')}
				</Text>
			) : (
				<DragDropContext onDragEnd={(result) => void handleDragEnd(result)}>
					<Droppable droppableId='report-columns'>
						{(provided) => (
							<Stack
								gap='xs'
								ref={provided.innerRef}
								{...provided.droppableProps}
							>
								{/* Header row */}
								<Flex
									px='sm'
									py='xs'
									style={{
										borderBottom:
											'1px solid var(--mantine-color-default-border)',
									}}
								>
									<Box w={28} />
									<Box w={40}>
										<Text size='xs' fw={600} c='dimmed'>
											{t('reportValues.columns.order')}
										</Text>
									</Box>
									<Box flex={1}>
										<Text size='xs' fw={600} c='dimmed'>
											{t('reportValues.columns.label')}
										</Text>
									</Box>
									<Box flex={1}>
										<Text size='xs' fw={600} c='dimmed'>
											{t('reportValues.columns.key')}
										</Text>
									</Box>
									<Box w={130}>
										<Text size='xs' fw={600} c='dimmed'>
											{t('reportValues.columns.originType')}
										</Text>
									</Box>
									<Box w={110}>
										<Text size='xs' fw={600} c='dimmed'>
											{t('reportValues.columns.dataType')}
										</Text>
									</Box>
									<Box w={70} />
								</Flex>

								{columns.map((col, index) => (
									<Draggable
										key={col.id}
										draggableId={String(col.id)}
										index={index}
										isDragDisabled={isReordering}
									>
										{(provided, snapshot) => (
											<Flex
												ref={provided.innerRef}
												{...provided.draggableProps}
												align='center'
												px='sm'
												py='xs'
												style={{
													borderRadius: 'var(--mantine-radius-sm)',
													border: snapshot.isDragging
														? '1px solid var(--mantine-color-blue-4)'
														: '1px solid var(--mantine-color-default-border)',
													background: snapshot.isDragging
														? 'var(--mantine-color-blue-0)'
														: 'var(--mantine-color-body)',
													...provided.draggableProps.style,
												}}
											>
												<Box
													{...provided.dragHandleProps}
													style={{
														cursor: 'grab',
														color: 'var(--mantine-color-dimmed)',
														lineHeight: 0,
													}}
													mr={4}
												>
													<IconGripVertical size={16} />
												</Box>

												<Box w={40}>
													<Text size='sm' c='dimmed'>
														{index}
													</Text>
												</Box>

												<Box flex={1}>
													<Text size='sm' fw={500} truncate>
														{col.label}
													</Text>
												</Box>

												<Box flex={1}>
													<Text size='sm' c='dimmed' ff='monospace' truncate>
														{col.key}
													</Text>
												</Box>

												<Box w={130}>
													<Badge
														color={ORIGIN_TYPE_COLORS[col.originType] ?? 'gray'}
														variant='light'
														size='sm'
													>
														{t(`reportValues.originType.${col.originType}`)}
													</Badge>
												</Box>

												<Box w={110}>
													<Badge
														color={DATA_TYPE_COLORS[col.dataType] ?? 'gray'}
														variant='dot'
														size='sm'
													>
														{t(`reportValues.dataType.${col.dataType}`)}
													</Badge>
												</Box>

												<Group gap={4} w={70} justify='flex-end' wrap='nowrap'>
													<Tooltip label={t('reportValues.columns.actions')}>
														<ActionIcon
															variant='subtle'
															size='sm'
															onClick={() => handleEditClick(col)}
														>
															<IconEdit size={14} />
														</ActionIcon>
													</Tooltip>
													<ActionIcon
														variant='subtle'
														color='red'
														size='sm'
														onClick={() => handleDeleteClick(col)}
														loading={
															deleteMutation.isPending &&
															deleteMutation.variables === col.id
														}
													>
														<IconTrash size={14} />
													</ActionIcon>
												</Group>
											</Flex>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</Stack>
						)}
					</Droppable>
				</DragDropContext>
			)}

			<ReportValueFormModal
				opened={modalOpened}
				onClose={closeModal}
				campaignId={campaignId}
				reportValue={editTarget}
				existingColumns={columns}
			/>
		</Stack>
	);
};

export default ReportValuesTab;
