import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Button,
	Modal,
	Select,
	Text,
	Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDatabase, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard/SectionCard';
import type { CustomVariable } from '~/models/CustomVariableModel';
import {
	useDeleteTemplateVariable,
	useGetCustomVariableTemplates,
	useGetTemplateVariables,
} from '~/queries/customVariableTemplatesQueries';
import CustomVariableForm from '../CustomVariableForm';
import { useCustomVariablesColumns } from './useCustomVariablesColumns';
import styles from './CustomVariablesContent.module.css';

interface CustomVariablesContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
	selectedTemplateId: number | null;
	onTemplateSelect?: (templateId: number | null) => void;
}

export default function CustomVariablesContent({
	createModalOpened,
	setCreateModalOpened,
	selectedTemplateId,
	onTemplateSelect,
}: CustomVariablesContentProps) {
	const { t } = useTranslation('campaign-management');
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedVariable, setSelectedVariable] =
		useState<CustomVariable | null>(null);
	const { data: templatesResponse, isLoading: templatesLoading } =
		useGetCustomVariableTemplates({ limit: 200, offset: 0 });
	const { data: variables = [], isLoading: variablesLoading } =
		useGetTemplateVariables(
			selectedTemplateId || 0,
			Boolean(selectedTemplateId)
		);
	const deleteVariable = useDeleteTemplateVariable();

	const templateOptions = useMemo(
		() =>
			(templatesResponse?.templates || []).map((template) => ({
				value: String(template.id),
				label: `${template.name} (#${template.id})`,
			})),
		[templatesResponse?.templates]
	);

	const handleDelete = async (variable: CustomVariable) => {
		if (!selectedTemplateId) {
			return;
		}

		try {
			await deleteVariable.mutateAsync({
				templateId: selectedTemplateId,
				variableId: variable.id,
			});
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.variables.notifications.deleteSuccess'),
				color: 'green',
			});
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('customVariables.variables.notifications.deleteError'),
				color: 'red',
			});
		}
	};

	const columns = useCustomVariablesColumns({
		onEdit: (variable) => {
			setSelectedVariable(variable);
			setEditModalOpened(true);
		},
		onDelete: handleDelete,
		isDeletePending: deleteVariable.isPending,
	});

	const noTemplateSelected = !selectedTemplateId;

	return (
		<div className={styles.container}>
			<SectionCard
				icon={IconDatabase}
				title={t('customVariables.variables.title')}
				description={t('customVariables.variables.sectionCardDescription')}
				headerActions={
					<Tooltip label={t('customVariables.variables.create')} withArrow>
						<ActionIcon
							variant='filled'
							onClick={() => setCreateModalOpened(true)}
							size='sm'
							disabled={noTemplateSelected}
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
				}
			>
				<Select
					label={t('customVariables.variables.templateSelect.label')}
					placeholder={t(
						'customVariables.variables.templateSelect.placeholder'
					)}
					searchable
					size='sm'
					value={selectedTemplateId ? String(selectedTemplateId) : null}
					onChange={(value) => onTemplateSelect?.(value ? Number(value) : null)}
					data={templateOptions}
					disabled={templatesLoading}
				/>

				{noTemplateSelected ? (
					<EmptyState
						icon={<IconDatabase size={40} />}
						message={t('customVariables.variables.emptySelectTemplate.title')}
						description={t(
							'customVariables.variables.emptySelectTemplate.description'
						)}
					/>
				) : variables.length === 0 && !variablesLoading ? (
					<EmptyState
						message={t('customVariables.variables.noResults')}
						description={t('customVariables.variables.noResultsDescription')}
						action={
							<Button size='sm' onClick={() => setCreateModalOpened(true)}>
								{t('customVariables.variables.create')}
							</Button>
						}
					/>
				) : (
					<BaseTable
						data={variables}
						columns={columns}
						isLoading={variablesLoading}
						className={styles.table}
						density='default'
					/>
				)}

				{selectedTemplateId && (
					<Text size='xs' c='dimmed'>
						{t('customVariables.variables.templateHint', {
							templateId: selectedTemplateId,
						})}
					</Text>
				)}
			</SectionCard>

			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('customVariables.variables.create')}
				size='lg'
			>
				{selectedTemplateId && (
					<CustomVariableForm
						templateId={selectedTemplateId}
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				)}
			</Modal>

			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedVariable(null);
				}}
				title={t('customVariables.variables.edit')}
				size='lg'
			>
				{selectedTemplateId && selectedVariable && (
					<CustomVariableForm
						templateId={selectedTemplateId}
						variable={selectedVariable}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedVariable(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedVariable(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
}
