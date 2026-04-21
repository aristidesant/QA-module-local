import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Center,
	Group,
	Loader,
	Paper,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconEdit,
	IconEye,
	IconFileExport,
	IconTemplate,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type {
	CreateReportTemplateDto,
	ReportTemplate,
	UpdateReportTemplateDto,
} from '~/models/ReportValue';
import {
	useGetReportTemplates,
	useDeleteReportTemplate,
	useCreateReportTemplate,
	useUpdateReportTemplate,
	useExportReportTemplate,
} from '~/queries/reportTemplatesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import ReportTemplateFormModal from '../components/ReportTemplateFormModal';
import CampaignPickerModal, {
	type ExportData,
} from '../components/CampaignPickerModal';
import { downloadReportTemplateExport } from '../reportTemplateExport';
import styles from './ReportTemplatesListPage.module.css';

const ReportTemplatesListPage = () => {
	const { t } = useTranslation('report-templates');
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [createModalOpened, setCreateModalOpened] = useState(false);
	const [exportModalOpened, setExportModalOpened] = useState(false);
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<ReportTemplate | null>(null);
	const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(
		null
	);

	const {
		data: templates = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useGetReportTemplates();
	const deleteMutation = useDeleteReportTemplate();
	const createMutation = useCreateReportTemplate();
	const updateMutation = useUpdateReportTemplate(editingTemplate?.id ?? 0);
	const exportMutation = useExportReportTemplate();

	const filteredTemplates = useMemo(
		() =>
			templates.filter((template) =>
				template.name.toLowerCase().includes(search.toLowerCase().trim())
			),
		[search, templates]
	);

	const handleDelete = (template: ReportTemplate) => {
		modals.openConfirmModal({
			title: t('list.deleteConfirmTitle'),
			children: (
				<Text size='sm'>
					{t('list.deleteConfirmMessage', {
						name: template.name,
					})}
				</Text>
			),
			labels: {
				confirm: t('actions.delete'),
				cancel: t('actions.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(template.id);
					notifications.show({
						message: t('list.notifications.deleted'),
						color: 'green',
					});
					await refetch();
				} catch (error) {
					notifications.show({
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const handleCreate = async (data: CreateReportTemplateDto) => {
		await createMutation.mutateAsync(data);
		notifications.show({
			message: t('list.notifications.created'),
			color: 'green',
		});
		await refetch();
	};

	const handleEditClick = (template: ReportTemplate) => {
		setEditingTemplate(template);
		setEditModalOpened(true);
	};

	const handleUpdate = async (data: UpdateReportTemplateDto) => {
		await updateMutation.mutateAsync(data);
		notifications.show({
			message: t('list.notifications.updated'),
			color: 'green',
		});
		await refetch();
	};

	const handleExportClick = (template: ReportTemplate) => {
		setSelectedTemplate(template);
		setExportModalOpened(true);
	};

	const handleExport = async (data: ExportData) => {
		if (!selectedTemplate) return;

		const response = await exportMutation.mutateAsync({
			templateId: selectedTemplate.id,
			dto: data,
		});

		downloadReportTemplateExport(
			response.data,
			selectedTemplate.name,
			data.format
		);

		notifications.show({
			message: t('list.notifications.exportStarted'),
			color: 'green',
		});
	};

	const columns = useMemo<BaseTableColumnDef<ReportTemplate>[]>(
		() => [
			{
				id: 'name',
				header: t('list.columns.name'),
				size: 220,
				cell: ({ row }) => (
					<Text fw={600} size='sm' className={styles.nameCell}>
						{row.original.name}
					</Text>
				),
			},
			{
				id: 'description',
				header: t('list.columns.description'),
				size: 320,
				cell: ({ row }) =>
					row.original.description ? (
						<Text
							size='sm'
							c='dimmed'
							lineClamp={2}
							className={styles.descriptionCell}
						>
							{row.original.description}
						</Text>
					) : (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					),
			},
			{
				id: 'schemaId',
				header: t('list.columns.schema'),
				size: 100,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed' className={styles.metaCell}>
						{row.original.schemaId ? `#${row.original.schemaId}` : '—'}
					</Text>
				),
			},
			{
				id: 'createdAt',
				header: t('list.columns.createdAt'),
				size: 120,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed' className={styles.metaCell}>
						{new Date(row.original.createdAt).toLocaleDateString()}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('list.columns.actions'),
				size: 160,
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsCell,
				},
				cell: ({ row }) => (
					<Group gap='xs' justify='flex-end' wrap='nowrap'>
						<ActionIcon
							variant='default'
							size='sm'
							onClick={(event) => {
								event.stopPropagation();
								navigate(`/report-templates/${row.original.id}`);
							}}
							aria-label={t('list.actions.edit')}
						>
							<IconEye size={14} />
						</ActionIcon>
						<ActionIcon
							variant='default'
							size='sm'
							onClick={(event) => {
								event.stopPropagation();
								handleEditClick(row.original);
							}}
							aria-label={t('list.actions.edit')}
						>
							<IconEdit size={14} />
						</ActionIcon>
						<ActionIcon
							variant='default'
							size='sm'
							onClick={(event) => {
								event.stopPropagation();
								handleExportClick(row.original);
							}}
							aria-label={t('list.actions.export')}
						>
							<IconFileExport size={14} />
						</ActionIcon>
						<ActionIcon
							variant='default'
							size='sm'
							color='red'
							onClick={(event) => {
								event.stopPropagation();
								handleDelete(row.original);
							}}
							aria-label={t('list.actions.delete')}
						>
							<IconTrash size={14} />
						</ActionIcon>
					</Group>
				),
			},
		],
		[t, navigate, handleDelete, handleEditClick, handleExportClick]
	);

	if (isLoading && templates.length === 0) {
		return (
			<Center py='xl'>
				<Loader size='sm' />
			</Center>
		);
	}

	return (
		<>
			<Stack gap='md'>
				<SectionCard
					icon={IconTemplate}
					title={t('title')}
					description={t('description')}
					actions={{
						primary: {
							kind: 'add',
							label: t('list.createNew'),
							onClick: () => setCreateModalOpened(true),
						},
					}}
					headerExtras={
						templates.length > 0 ? (
							<Badge variant='light' size='sm' className={styles.countBadge}>
								{t('list.templateCount', { count: templates.length })}
							</Badge>
						) : undefined
					}
				>
					<Stack gap='md'>
						<TextInput
							placeholder={t('list.searchPlaceholder')}
							leftSection={<IconSearch size={16} />}
							value={search}
							onChange={(event) => setSearch(event.currentTarget.value)}
							aria-label={t('list.searchPlaceholder')}
							className={styles.searchInput}
						/>

						{isError ? (
							<Alert
								icon={<IconAlertCircle size={18} />}
								color='red'
								title={t('list.errorTitle')}
							>
								{error instanceof Error
									? error.message
									: t('list.errorDescription')}
							</Alert>
						) : !isLoading && templates.length === 0 ? (
							<Paper
								withBorder
								p='lg'
								radius='md'
								className={styles.emptyStateCard}
							>
								<Stack gap='xs' align='center'>
									<IconTemplate size={32} color='var(--mantine-color-gray-5)' />
									<Text size='sm' fw={600} ta='center'>
										{t('list.noTemplates')}
									</Text>
									<Text size='sm' c='dimmed' ta='center'>
										{t('list.noTemplatesDescription')}
									</Text>
									<Button
										size='sm'
										leftSection={<IconPlus size={16} />}
										onClick={() => setCreateModalOpened(true)}
									>
										{t('list.createNew')}
									</Button>
								</Stack>
							</Paper>
						) : (
							<BaseTable<ReportTemplate>
								data={filteredTemplates}
								columns={columns}
								density='compact'
								isLoading={isLoading}
								getRowId={(row) => row.id}
								emptyMessage={
									search.trim()
										? t('list.noTemplatesFiltered')
										: t('list.noTemplates')
								}
								className={styles.table}
							/>
						)}
					</Stack>
				</SectionCard>
			</Stack>

			<ReportTemplateFormModal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				onSubmit={handleCreate}
				isSubmitting={createMutation.isPending}
			/>

			<ReportTemplateFormModal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setEditingTemplate(null);
				}}
				template={editingTemplate ?? undefined}
				onSubmit={handleUpdate}
				isSubmitting={updateMutation.isPending}
			/>

			{selectedTemplate && (
				<CampaignPickerModal
					opened={exportModalOpened}
					onClose={() => {
						setExportModalOpened(false);
						setSelectedTemplate(null);
					}}
					templateId={selectedTemplate.id}
					templateSchemaId={selectedTemplate.schemaId}
					onSubmit={handleExport}
					isSubmitting={exportMutation.isPending}
				/>
			)}
		</>
	);
};

export default ReportTemplatesListPage;
