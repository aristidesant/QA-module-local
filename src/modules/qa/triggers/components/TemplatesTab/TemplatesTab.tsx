import { Badge, Button, Group, Menu, SegmentedControl, Text, TextInput, Tooltip, ActionIcon } from '@mantine/core';
import { IconPlus, IconSearch, IconX, IconEdit, IconCopy, IconStar, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import { useMemo, useState } from 'react';
import type { MessageTemplate, TemplateCategory } from '~/models/qa';
import { TEMPLATE_CATEGORY_COLORS } from '~/modules/qa/triggers/constants';
import { extractVariables } from '~/modules/qa/triggers/helpers';
import { nextId, useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { NOW_ISO } from '~/modules/qa/triggers/mockData';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { FilterContainer } from '~/components/FilterContainer';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import TemplateEditorDrawer from '~/modules/qa/triggers/components/TemplateEditorDrawer';

type TemplateCategoryFilter = 'All' | TemplateCategory;

interface TemplatesTabProps {
	// Currently no props needed, reads from store
}

export function TemplatesTab({}: TemplatesTabProps) {
	const { t } = useTranslation('qa.triggers');
	const templates = useTriggerRulesStore((s) => s.templates);
	const addTemplate = useTriggerRulesStore((s) => s.addTemplate);
	const deleteTemplate = useTriggerRulesStore((s) => s.deleteTemplate);
	const setDefaultTemplate = useTriggerRulesStore((s) => s.setDefaultTemplate);

	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<TemplateCategoryFilter>('All');
	const [editorOpened, setEditorOpened] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

	const dateFormatter = useDateFormatter('dateTime');

	const filteredTemplates = useMemo(() => {
		let result = templates;

		// Filter by search (name and subject)
		if (search) {
			const lowerSearch = search.toLowerCase();
			result = result.filter(
				(t) =>
					t.name.toLowerCase().includes(lowerSearch) ||
					t.subject.toLowerCase().includes(lowerSearch)
			);
		}

		// Filter by category
		if (categoryFilter !== 'All') {
			result = result.filter((t) => t.category === categoryFilter);
		}

		// Sort: category, then default first, then name
		result.sort((a, b) => {
			if (a.category !== b.category) {
				const categories: TemplateCategory[] = ['ALERT', 'RECOGNITION', 'SUMMARY'];
				return categories.indexOf(a.category) - categories.indexOf(b.category);
			}
			if (a.isDefault !== b.isDefault) {
				return a.isDefault ? -1 : 1;
			}
			return a.name.localeCompare(b.name);
		});

		return result;
	}, [templates, search, categoryFilter]);

	const handleEditTemplate = (template: MessageTemplate) => {
		setSelectedTemplate(template);
		setEditorOpened(true);
	};

	const handleNewTemplate = () => {
		setSelectedTemplate(null);
		setEditorOpened(true);
	};

	const handleDuplicate = (template: MessageTemplate) => {
		const newTemplate: MessageTemplate = {
			...template,
			id: nextId('TPL'),
			name: `${template.name} (copy)`,
			isDefault: false,
			usageCount: 0,
			updatedAt: NOW_ISO,
		};
		addTemplate(newTemplate);
		notifySuccess(t('templates.notifications.duplicated'));
	};

	const handleSetDefault = (template: MessageTemplate) => {
		setDefaultTemplate(template.id);
		notifySuccess(t('templates.notifications.defaultSet'));
	};

	const handleDelete = (template: MessageTemplate) => {
		modals.openConfirmModal({
			title: t('templates.confirmDelete.title'),
			children: <Text size='sm'>{t('templates.confirmDelete.message', { name: template.name })}</Text>,
			labels: { confirm: t('templates.confirmDelete.confirm'), cancel: t('templates.confirmDelete.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteTemplate(template.id);
				notifySuccess(t('templates.notifications.deleted'));
			},
		});
	};

	const isEmpty = templates.length === 0;
	const hasNoMatches = !isEmpty && filteredTemplates.length === 0;

	if (isEmpty) {
		return (
			<EmptyState
				icon='📋'
				message={t('templates.empty.title')}
				description={t('templates.empty.description')}
				action={
					<Button leftSection={<IconPlus size={16} />} onClick={handleNewTemplate}>
						{t('templates.new')}
					</Button>
				}
			/>
		);
	}

	return (
		<>
			<SectionCard
				title={t('templates.title')}
				description={t('templates.description')}
				headerActions={
					<Button size='sm' leftSection={<IconPlus size={16} />} onClick={handleNewTemplate}>
						{t('templates.new')}
					</Button>
				}
			>
				<FilterContainer>
					<TextInput
						placeholder={t('templates.filters.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						rightSection={
							search ? (
								<ActionIcon
									variant='subtle'
									color='gray'
									size='xs'
									onClick={() => setSearch('')}
								>
									<IconX size={16} />
								</ActionIcon>
							) : null
						}
					/>

					<SegmentedControl
						value={categoryFilter}
						onChange={(v) => setCategoryFilter(v as TemplateCategoryFilter)}
						data={[
							{ label: t('templates.filters.all'), value: 'All' },
							{ label: t('templateCategories.ALERT'), value: 'ALERT' },
							{ label: t('templateCategories.RECOGNITION'), value: 'RECOGNITION' },
							{ label: t('templateCategories.SUMMARY'), value: 'SUMMARY' },
						]}
					/>

					{(search || categoryFilter !== 'All') && (
						<Button
							variant='light'
							leftSection={<IconX size={14} />}
							onClick={() => {
								setSearch('');
								setCategoryFilter('All');
							}}
						>
							{t('templates.filters.clear')}
						</Button>
					)}
				</FilterContainer>

				{hasNoMatches ? (
					<EmptyState message={t('templates.empty.noMatches')} />
				) : (
					<BaseTable<MessageTemplate>
						data={filteredTemplates}
						getRowId={(t: MessageTemplate) => t.id}
						onRowClick={(template: MessageTemplate) => handleEditTemplate(template)}
						columns={[
							{
								accessorKey: 'name',
								header: t('templates.columns.name'),
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Group gap='sm' wrap='nowrap'>
										<Text size='sm' fw={600}>
											{row.original.name}
										</Text>
										{row.original.isDefault && (
											<Badge size='xs' variant='light' color='blue'>
												{t('templates.default')}
											</Badge>
										)}
									</Group>
								),
								size: 200,
							},
							{
								accessorKey: 'category',
								header: t('templates.columns.category'),
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Badge
										variant='light'
										color={TEMPLATE_CATEGORY_COLORS[row.original.category as TemplateCategory]}
									>
										{t(`templateCategories.${row.original.category}`)}
									</Badge>
								),
								size: 120,
							},
							{
								accessorKey: 'subject',
								header: t('templates.columns.subject'),
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Text size='sm' lineClamp={1}>
										{row.original.subject}
									</Text>
								),
								size: 250,
							},
							{
								accessorKey: 'body',
								header: t('templates.columns.variables'),
								cell: ({ row }: any) => {
									const vars = extractVariables(row.original.subject + row.original.body);
									return (
										<Group gap={4}>
											{vars.map((v: string) => (
												<Badge key={v} size='xs' variant='outline'>
													{`{{${v}}}`}
												</Badge>
											))}
										</Group>
									);
								},
								size: 180,
							},
							{
								accessorKey: 'usageCount',
								header: t('templates.columns.usedBy'),
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Text size='sm'>
										{row.original.usageCount === 1
											? t('templates.usedBy_one', { count: 1 })
											: t('templates.usedBy_other', { count: row.original.usageCount })}
									</Text>
								),
								size: 100,
							},
							{
								accessorKey: 'updatedAt',
								header: t('templates.columns.updated'),
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Text size='sm'>
										{dateFormatter.format(new Date(row.original.updatedAt))}
									</Text>
								),
								size: 120,
							},
							{
								id: 'actions',
								header: '',
								cell: ({ row }: { row: { original: MessageTemplate } }) => (
									<Menu withinPortal position='bottom-end'>
										<Menu.Target>
											<ActionIcon variant='subtle' color='gray' onClick={(e: React.MouseEvent) => e.stopPropagation()}>
												<IconEdit size={16} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item
												leftSection={<IconEdit size={14} />}
												onClick={(e: React.MouseEvent) => {
													e.stopPropagation();
													handleEditTemplate(row.original);
												}}
											>
												{t('templates.actions.edit')}
											</Menu.Item>
											<Menu.Item
												leftSection={<IconCopy size={14} />}
												onClick={(e: React.MouseEvent) => {
													e.stopPropagation();
													handleDuplicate(row.original);
												}}
											>
												{t('templates.actions.duplicate')}
											</Menu.Item>
											{!row.original.isDefault && (
												<Menu.Item
													leftSection={<IconStar size={14} />}
													onClick={(e: React.MouseEvent) => {
														e.stopPropagation();
														handleSetDefault(row.original);
													}}
												>
													{t('templates.actions.setDefault')}
												</Menu.Item>
											)}
											<Menu.Divider />
											<Tooltip
												label={t('templates.actions.deleteDisabled')}
												disabled={row.original.usageCount === 0}
											>
												<Menu.Item
													leftSection={<IconTrash size={14} />}
													color='red'
													disabled={row.original.usageCount > 0}
													onClick={(e: React.MouseEvent) => {
														e.stopPropagation();
														handleDelete(row.original);
													}}
												>
													{t('templates.actions.delete')}
												</Menu.Item>
											</Tooltip>
										</Menu.Dropdown>
									</Menu>
								),
								size: 50,
							},
						]}
					/>
				)}
			</SectionCard>

			<TemplateEditorDrawer
				opened={editorOpened}
				template={selectedTemplate}
				onClose={() => {
					setEditorOpened(false);
					setSelectedTemplate(null);
				}}
				onSaved={() => {
					setEditorOpened(false);
					setSelectedTemplate(null);
				}}
			/>
		</>
	);
}
