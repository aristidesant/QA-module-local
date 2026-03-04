import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Button,
	Modal,
	Select,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCategory, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import type { CustomVariableTemplate } from '~/models/CustomVariableModel';
import {
	useAssignCustomVariableTemplateToCampaign,
	useCloneCustomVariableTemplate,
	useDeleteCustomVariableTemplate,
	useGetCustomVariableTemplates,
} from '~/queries/customVariableTemplatesQueries';
import { useGetAllCampaignsPaginated } from '~/queries/campaignsQueries';
import CustomVariableGroupsFilters, {
	type CustomVariableGroupFilters,
} from '../CustomVariableGroupsFilters';
import CustomVariableGroupsForm from '../CustomVariableGroupsForm';
import { useCustomVariableGroupsColumns } from './useCustomVariableGroupsColumns';
import styles from './CustomVariableGroupsContent.module.css';

interface CustomVariableGroupsContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
	selectedTemplateId: number | null;
	onTemplateSelect?: (templateId: number | null) => void;
}

const DEFAULT_PAGE_SIZE = 10;

export default function CustomVariableGroupsContent({
	createModalOpened,
	setCreateModalOpened,
	selectedTemplateId,
	onTemplateSelect,
}: CustomVariableGroupsContentProps) {
	const { t } = useTranslation('campaign-management');
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<CustomVariableTemplate | null>(null);
	const [assignModalOpened, setAssignModalOpened] = useState(false);
	const [campaignId, setCampaignId] = useState<string | null>(null);
	const [filters, setFilters] = useState<CustomVariableGroupFilters>({
		search: '',
	});
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const offset = (page - 1) * pageSize;
	const { data, isLoading } = useGetCustomVariableTemplates({
		limit: pageSize,
		offset,
	});

	const templates = useMemo(() => {
		const rawTemplates = data?.templates || [];
		const search = filters.search.trim().toLowerCase();
		if (!search) {
			return rawTemplates;
		}

		return rawTemplates.filter((template) =>
			template.name.toLowerCase().includes(search)
		);
	}, [data?.templates, filters.search]);

	const deleteTemplate = useDeleteCustomVariableTemplate();
	const cloneTemplate = useCloneCustomVariableTemplate();
	const assignTemplate = useAssignCustomVariableTemplateToCampaign();

	const { data: campaignsResponse } = useGetAllCampaignsPaginated({
		limit: 100,
		offset: 0,
	});

	const campaignOptions = useMemo(() => {
		return (campaignsResponse?.data || []).map((campaign) => ({
			value: String(campaign.id),
			label: `${campaign.name} (#${campaign.id})`,
		}));
	}, [campaignsResponse?.data]);

	const handleDelete = async (template: CustomVariableTemplate) => {
		try {
			await deleteTemplate.mutateAsync(template.id);
			if (selectedTemplateId === template.id) {
				onTemplateSelect?.(null);
			}
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.groups.notifications.deleteSuccess'),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('customVariables.groups.notifications.deleteError'),
				color: 'red',
			});
		}
	};

	const handleClone = async (template: CustomVariableTemplate) => {
		try {
			const cloned = await cloneTemplate.mutateAsync(template.id);
			onTemplateSelect?.(cloned.id);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.groups.notifications.cloneSuccess'),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('customVariables.groups.notifications.cloneError'),
				color: 'red',
			});
		}
	};

	const handleAssignConfirm = async () => {
		if (!selectedTemplate || !campaignId) {
			return;
		}

		try {
			const assigned = await assignTemplate.mutateAsync({
				templateId: selectedTemplate.id,
				campaignId: Number(campaignId),
			});
			onTemplateSelect?.(assigned.id);
			setAssignModalOpened(false);
			setCampaignId(null);
			setSelectedTemplate(null);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.groups.notifications.assignSuccess'),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('customVariables.groups.notifications.assignError'),
				color: 'red',
			});
		}
	};

	const columns = useCustomVariableGroupsColumns({
		onEdit: (template) => {
			setSelectedTemplate(template);
			setEditModalOpened(true);
		},
		onDelete: handleDelete,
		onClone: handleClone,
		onAssign: (template) => {
			setSelectedTemplate(template);
			setAssignModalOpened(true);
		},
		isDeletePending: deleteTemplate.isPending,
		selectedTemplateId,
		onSelectTemplate: (templateId) => onTemplateSelect?.(templateId),
	});

	const total = data?.total || 0;
	const totalPages = Math.ceil(total / pageSize) || 1;

	const hasAnyData = (data?.templates || []).length > 0;
	if (!hasAnyData && !isLoading) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconCategory size={48} />}
					message={t('customVariables.groups.empty.title')}
					description={t('customVariables.groups.empty.description')}
					action={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							{t('customVariables.groups.create')}
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title={t('customVariables.groups.create')}
					size='md'
				>
					<CustomVariableGroupsForm
						onSuccess={(templateId) => {
							setCreateModalOpened(false);
							onTemplateSelect?.(templateId ?? null);
						}}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<SectionCard
				icon={IconCategory}
				title={t('customVariables.groups.title')}
				description={t('customVariables.groups.sectionCardDescription')}
				headerActions={
					<Tooltip label={t('customVariables.groups.create')} withArrow>
						<ActionIcon
							variant='filled'
							onClick={() => setCreateModalOpened(true)}
							size='sm'
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
				}
			>
				<CustomVariableGroupsFilters
					filters={filters}
					onFiltersChange={setFilters}
				/>

				{templates.length === 0 && !isLoading ? (
					<EmptyState
						message={t('customVariables.groups.noResults')}
						description={t('customVariables.groups.noResultsDescription')}
					/>
				) : (
					<>
						<BaseTable
							data={templates}
							columns={columns}
							isLoading={isLoading}
							className={styles.table}
							density='default'
						/>
						<PaginationControls
							currentPage={page}
							totalPages={totalPages}
							itemsPerPage={pageSize}
							totalItems={total}
							onPageChange={setPage}
							onItemsPerPageChange={(value) => {
								if (!value) return;
								setPage(1);
								setPageSize(parseInt(value, 10));
							}}
							itemLabel={t('customVariables.groups.pagination.itemLabel')}
							isLoading={isLoading}
						/>
					</>
				)}
			</SectionCard>

			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('customVariables.groups.create')}
				size='md'
			>
				<CustomVariableGroupsForm
					onSuccess={(templateId) => {
						setCreateModalOpened(false);
						onTemplateSelect?.(templateId ?? null);
					}}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedTemplate(null);
				}}
				title={t('customVariables.groups.edit')}
				size='md'
			>
				{selectedTemplate && (
					<CustomVariableGroupsForm
						template={selectedTemplate}
						onSuccess={(templateId) => {
							setEditModalOpened(false);
							setSelectedTemplate(null);
							onTemplateSelect?.(templateId ?? null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedTemplate(null);
						}}
					/>
				)}
			</Modal>

			<Modal
				opened={assignModalOpened}
				onClose={() => {
					setAssignModalOpened(false);
					setCampaignId(null);
					setSelectedTemplate(null);
				}}
				title={t('customVariables.groups.assignCampaignTitle')}
				size='md'
			>
				<Stack gap='xs'>
					<Text size='sm' c='dimmed'>
						{t('customVariables.groups.assignCampaignDescription')}
					</Text>
					<Select
						label={t('customVariables.groups.form.campaign.label')}
						placeholder={t('customVariables.groups.form.campaign.placeholder')}
						data={campaignOptions}
						value={campaignId}
						onChange={setCampaignId}
						searchable
						size='sm'
					/>
					<Button
						onClick={handleAssignConfirm}
						disabled={!campaignId}
						loading={assignTemplate.isPending}
						size='sm'
					>
						{t('customVariables.groups.form.actions.assignCampaign')}
					</Button>
				</Stack>
			</Modal>
		</div>
	);
}
