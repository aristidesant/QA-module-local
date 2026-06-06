import { useState } from 'react';
import {
	Text,
	Skeleton,
	Center,
	Stack,
	Checkbox,
	Loader,
	Alert,
	Group,
	Button,
	ScrollArea,
	ThemeIcon,
} from '@mantine/core';
import { IconTool, IconAlertCircle, IconRobot } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import useToolsStore from '~/stores/toolsStore';
import {
	useDeleteTool,
	useToolsByCategory,
	useDependentAgents,
} from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard/SectionCard';
import useToolsListColumns from './useToolsListColumns';
import styles from './ToolsList.module.css';
import EmptyState from '~/components/EmptyState';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '~/utils/httpClient';

interface DeleteModalContentProps {
	tool: ToolModel;
	onConfirm: (id: string | number, force: boolean) => void;
	onClose: () => void;
	t: (key: string, options?: Record<string, unknown>) => string;
	tCommon: (key: string, options?: Record<string, unknown>) => string;
}

function DeleteModalContent({
	tool,
	onConfirm,
	onClose,
	t,
	tCommon,
}: DeleteModalContentProps) {
	const [force, setForce] = useState(false);
	const { data: dependentAgents, isLoading: isLoadingAgents } =
		useDependentAgents(tool.id);
	const hasDependents = dependentAgents && dependentAgents.agents.length > 0;

	return (
		<Stack gap='sm'>
			<Text size='sm'>{t('deleteConfirm.message', { name: tool.name })}</Text>

			{isLoadingAgents && (
				<Center py='sm'>
					<Loader size='xs' />
				</Center>
			)}

			{hasDependents && (
				<>
					<Alert
						icon={<IconAlertCircle size={16} />}
						color='orange'
						variant='light'
					>
						<Text size='sm' fw={500}>
							{t('deleteConfirm.hasDependents')}
						</Text>
					</Alert>
					<ScrollArea.Autosize mah={200}>
						<Stack gap={4}>
							{dependentAgents.agents.map((agent) => (
								<Group key={agent.id} gap='xs' wrap='nowrap'>
									<ThemeIcon size='xs' variant='light' radius='xl'>
										<IconRobot size={10} />
									</ThemeIcon>
									<Text size='sm' c='dimmed' truncate>
										{agent.name}
									</Text>
								</Group>
							))}
						</Stack>
					</ScrollArea.Autosize>
					<Checkbox
						label={t('deleteConfirm.forceLabel')}
						checked={force}
						onChange={(e) => setForce(e.currentTarget.checked)}
						size='sm'
					/>
					{force && (
						<Alert
							color='red'
							variant='light'
							icon={<IconAlertCircle size={16} />}
						>
							<Text size='xs'>{t('deleteConfirm.forceWarning')}</Text>
						</Alert>
					)}
				</>
			)}

			<Group justify='flex-end' gap='xs' mt='sm'>
				<Button size='sm' variant='subtle' onClick={onClose}>
					{tCommon('actions.cancel')}
				</Button>
				<Button
					size='sm'
					color={hasDependents && !force ? 'gray' : 'red'}
					disabled={hasDependents && !force}
					onClick={() => {
						onConfirm(tool.id, force);
						onClose();
					}}
				>
					{t('deleteConfirm.confirm')}
				</Button>
			</Group>
		</Stack>
	);
}

interface ToolsListProps {
	onEdit: (toolId: string | number) => void;
	onCreate: () => void;
}

function ToolsList({ onEdit, onCreate }: ToolsListProps) {
	const { t } = useTranslation('tools');
	const { t: tCommon } = useTranslation('common');
	const { selectedToolCategory } = useToolsStore();
	const deleteMutation = useDeleteTool();
	const columns = useToolsListColumns({
		onDelete: (tool) => {
			modals.open({
				title: t('deleteConfirm.title'),
				centered: true,
				size: 'md',
				children: (
					<DeleteModalContent
						tool={tool}
						onConfirm={async (id, force) => {
							try {
								await deleteMutation.mutateAsync({ id, force });
								notifications.show({
									message: force
										? t('notifications.forceDeleted')
										: t('notifications.deleted'),
									color: 'green',
								});
							} catch (error) {
								notifications.show({
									message: t('notifications.deleteFailed', {
										message: getErrorMessage(error),
									}),
									color: 'red',
								});
							}
						}}
						onClose={() => modals.closeAll()}
						t={t}
						tCommon={tCommon}
					/>
				),
			});
		},
		onEdit: (tool) => {
			onEdit(tool.id);
		},
	});

	const {
		data: tools,
		isLoading,
		error,
	} = useToolsByCategory(selectedToolCategory?.id);

	const handleToolClick = (tool: ToolModel) => {
		onEdit(tool.id);
	};

	const renderContent = () => {
		if (!selectedToolCategory) {
			return (
				<Center className={styles.emptyState}>
					<Stack align='center' gap='md'>
						<IconTool size={48} color='var(--nt-ink-300)' />
						<Text size='lg' fw={500} c='dimmed'>
							{t('list.noCategory.title')}
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							{t('list.noCategory.description')}
						</Text>
					</Stack>
				</Center>
			);
		}

		if (isLoading) {
			return (
				<Stack gap='xs' px='md' py='sm'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} height={44} radius='sm' animate />
					))}
				</Stack>
			);
		}

		if (error) {
			return (
				<Center className={styles.emptyState}>
					<Stack align='center' gap='md'>
						<IconTool size={48} color='var(--nt-danger)' />
						<Text size='lg' fw={500} c='red'>
							{t('state.errorLoadingTools')}
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							{error.message}
						</Text>
					</Stack>
				</Center>
			);
		}

		if (!tools || tools.length === 0) {
			return (
				<EmptyState
					icon={<IconTool size={48} color='var(--nt-ink-300)' />}
					message={t('list.empty.message')}
					description={
						<>
							{t('list.empty.descriptionLine1', {
								categoryName: selectedToolCategory?.name,
							})}
							<br />
							{t('list.empty.descriptionLine2')}
						</>
					}
				/>
			);
		}

		return (
			<BaseTable<ToolModel>
				data={tools}
				columns={columns}
				onRowClick={handleToolClick}
				getRowClassName={() => styles.tableRow}
			/>
		);
	};

	return (
		<SectionCard
			description={t('page.description')}
			onAdd={onCreate}
			contentSpacing='sm'
		>
			{renderContent()}
		</SectionCard>
	);
}

export default ToolsList;
