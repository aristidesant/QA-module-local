import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Flex,
	Group,
	Loader,
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
	IconEdit,
	IconGripVertical,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import {
	useGetReportColumns,
	useUpdateReportValue,
	useDeleteReportValue,
} from '~/queries/reportValuesQueries';
import type { ReportValue } from '~/models/ReportValue';
import { getErrorMessage } from '~/utils/httpClient';
import { CampaignIdContext } from '~/modules/campaigns/campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import ReportValueFormModal from '~/modules/campaigns/CampaignContactListPage/ReportValuesTab/ReportValueFormModal';

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

const ReportValuesSection = () => {
	const { t } = useTranslation(['campaigns', 'campaign.contact-list']);
	const campaignId = useContext(CampaignIdContext);

	const [modalOpened, { open: openModal, close: closeModal }] =
		useDisclosure(false);
	const [editTarget, setEditTarget] = useState<ReportValue | undefined>(
		undefined
	);
	const [isReordering, setIsReordering] = useState(false);

	const {
		data: columns = [],
		isLoading,
		refetch,
	} = useGetReportColumns(campaignId ?? 0);
	const updateMutation = useUpdateReportValue(campaignId ?? 0);
	const deleteMutation = useDeleteReportValue(campaignId ?? 0);

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
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(reportValue.id);
					notifications.show({
						message: t('reportValues.notifications.deleted', {
							ns: 'campaign.contact-list',
						}),
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
				message: t('reportValues.notifications.reorderError', {
					ns: 'campaign.contact-list',
				}),
				color: 'red',
			});
			void refetch();
		} finally {
			setIsReordering(false);
		}
	};

	if (!campaignId) {
		return null;
	}

	return (
		<SectionCard
			title={t('form.reportValues.title')}
			description={t('form.reportValues.description')}
		>
			{isLoading ? (
				<Flex justify='center' align='center' py='xl'>
					<Loader size='md' />
				</Flex>
			) : (
				<Stack gap='md'>
					<Group justify='flex-end'>
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={handleAddClick}
							size='sm'
						>
							{t('reportValues.addColumn', { ns: 'campaign.contact-list' })}
						</Button>
					</Group>

					{columns.length === 0 ? (
						<Text c='dimmed' ta='center' py='xl' size='sm'>
							{t('reportValues.noColumns', { ns: 'campaign.contact-list' })}
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
													{t('reportValues.columns.order', {
														ns: 'campaign.contact-list',
													})}
												</Text>
											</Box>
											<Box flex={1}>
												<Text size='xs' fw={600} c='dimmed'>
													{t('reportValues.columns.label', {
														ns: 'campaign.contact-list',
													})}
												</Text>
											</Box>
											<Box flex={1}>
												<Text size='xs' fw={600} c='dimmed'>
													{t('reportValues.columns.key', {
														ns: 'campaign.contact-list',
													})}
												</Text>
											</Box>
											<Box w={130}>
												<Text size='xs' fw={600} c='dimmed'>
													{t('reportValues.columns.originType', {
														ns: 'campaign.contact-list',
													})}
												</Text>
											</Box>
											<Box w={110}>
												<Text size='xs' fw={600} c='dimmed'>
													{t('reportValues.columns.dataType', {
														ns: 'campaign.contact-list',
													})}
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
															<Text
																size='sm'
																c='dimmed'
																ff='monospace'
																truncate
															>
																{col.key}
															</Text>
														</Box>

														<Box w={130}>
															<Badge
																color={
																	ORIGIN_TYPE_COLORS[col.originType] ?? 'gray'
																}
																variant='light'
																size='sm'
															>
																{t(
																	`reportValues.originType.${col.originType}`,
																	{ ns: 'campaign.contact-list' }
																)}
															</Badge>
														</Box>

														<Box w={110}>
															<Badge
																color={DATA_TYPE_COLORS[col.dataType] ?? 'gray'}
																variant='dot'
																size='sm'
															>
																{t(`reportValues.dataType.${col.dataType}`, {
																	ns: 'campaign.contact-list',
																})}
															</Badge>
														</Box>

														<Group
															gap={4}
															w={70}
															justify='flex-end'
															wrap='nowrap'
														>
															<Tooltip
																label={t('reportValues.columns.actions', {
																	ns: 'campaign.contact-list',
																})}
															>
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
				</Stack>
			)}

			<ReportValueFormModal
				opened={modalOpened}
				onClose={closeModal}
				campaignId={campaignId}
				reportValue={editTarget}
				existingColumns={columns}
			/>
		</SectionCard>
	);
};

export default ReportValuesSection;
