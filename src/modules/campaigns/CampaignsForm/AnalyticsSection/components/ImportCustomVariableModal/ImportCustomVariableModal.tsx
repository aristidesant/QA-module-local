import {
	Button,
	Checkbox,
	Divider,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { CustomVariable } from '~/models/CustomVariableModel';
import {
	useGetCustomVariableTemplates,
	useGetTemplateVariables,
} from '~/queries/customVariableTemplatesQueries';
import styles from './ImportCustomVariableModal.module.css';

interface ImportCustomVariableModalProps {
	opened: boolean;
	onClose: () => void;
	onImportMany: (variables: CustomVariable[]) => void;
}

const normalizeType = (value: string | undefined): string => {
	if (!value) return 'string';
	const lowered = value.toLowerCase();
	if (['boolean', 'integer', 'number', 'string'].includes(lowered)) {
		return lowered;
	}
	return 'string';
};

export default function ImportCustomVariableModal({
	opened,
	onClose,
	onImportMany,
}: ImportCustomVariableModalProps) {
	const { t } = useTranslation('campaigns');
	const [templateId, setTemplateId] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

	const { data: templatesResponse, isLoading: templatesLoading } =
		useGetCustomVariableTemplates({ limit: 100, offset: 0 });
	const { data: variables = [], isLoading: variablesLoading } =
		useGetTemplateVariables(
			templateId ? Number(templateId) : 0,
			Boolean(templateId)
		);

	const templateOptions = useMemo(
		() =>
			(templatesResponse?.templates || []).map((template) => ({
				value: String(template.id),
				label: `${template.name} (#${template.id})`,
			})),
		[templatesResponse?.templates]
	);

	const filteredVariables = useMemo(() => {
		if (!search.trim()) return variables;
		const term = search.trim().toLowerCase();
		return variables.filter((variable) => {
			const description = variable.value.description || '';
			const label = variable.label || '';
			return (
				variable.name.toLowerCase().includes(term) ||
				label.toLowerCase().includes(term) ||
				description.toLowerCase().includes(term)
			);
		});
	}, [variables, search]);

	useEffect(() => {
		if (!opened) {
			setTemplateId(null);
			setSearch('');
			setSelectedIds(new Set());
		}
	}, [opened]);

	const handleTemplateChange = (value: string | null) => {
		setTemplateId(value);
		setSearch('');
		setSelectedIds(new Set());
	};

	const visibleIds = useMemo(
		() => filteredVariables.map((variable) => variable.id),
		[filteredVariables]
	);

	const allVisibleSelected =
		visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
	const someVisibleSelected =
		visibleIds.length > 0 && visibleIds.some((id) => selectedIds.has(id));

	const toggleSelected = (id: number, checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	};

	const toggleSelectAllVisible = (checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			for (const id of visibleIds) {
				if (checked) next.add(id);
				else next.delete(id);
			}
			return next;
		});
	};

	const selectedVariables = useMemo(
		() => filteredVariables.filter((variable) => selectedIds.has(variable.id)),
		[filteredVariables, selectedIds]
	);

	const selectedCount = selectedIds.size;

	const columns = useMemo<BaseTableColumnDef<CustomVariable>[]>(
		() => [
			{
				id: 'select',
				header: () => (
					<Checkbox
						size='sm'
						aria-label={t('form.analytics.import.selection.selectAllVisible')}
						checked={allVisibleSelected}
						indeterminate={!allVisibleSelected && someVisibleSelected}
						onChange={(event) =>
							toggleSelectAllVisible(event.currentTarget.checked)
						}
						disabled={!templateId || filteredVariables.length === 0}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						size='sm'
						checked={selectedIds.has(row.original.id)}
						onChange={(event) =>
							toggleSelected(row.original.id, event.currentTarget.checked)
						}
						aria-label={t('form.analytics.import.selection.selectRow', {
							identifier: row.original.name,
						})}
					/>
				),
			},
			{
				accessorKey: 'label',
				header: t('form.analytics.import.table.label'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm'>{row.original.label || row.original.name}</Text>
						<Text size='xs' c='dimmed' ff='monospace'>
							{row.original.name}
						</Text>
					</Stack>
				),
			},
			{
				id: 'type',
				header: t('form.analytics.import.table.type'),
				cell: ({ row }) => (
					<Text size='sm'>
						{t(
							`form.analytics.types.${normalizeType(row.original.value.type)}`
						)}
					</Text>
				),
			},
			{
				id: 'description',
				header: t('form.analytics.import.table.description'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed' lineClamp={1}>
						{row.original.value.description || '-'}
					</Text>
				),
			},
		],
		[
			allVisibleSelected,
			filteredVariables.length,
			someVisibleSelected,
			selectedIds,
			templateId,
			t,
		]
	);

	const handleImportSelected = () => {
		if (selectedVariables.length === 0) return;
		onImportMany(selectedVariables);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.analytics.import.title')}
			size='lg'
		>
			<Stack gap='sm' className={styles.form}>
				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('form.analytics.import.sections.source')}
					</Text>
					<Group gap='xs' grow className={styles.toolbar}>
						<Select
							size='sm'
							label={t('form.analytics.import.fields.group')}
							placeholder={t('form.analytics.import.placeholders.group')}
							data={templateOptions}
							value={templateId}
							onChange={handleTemplateChange}
							searchable
							disabled={templatesLoading}
						/>
						<TextInput
							size='sm'
							label={t('form.analytics.import.fields.search')}
							placeholder={t('form.analytics.import.placeholders.search')}
							value={search}
							onChange={(event) => setSearch(event.currentTarget.value)}
							leftSection={<IconSearch size={14} />}
							disabled={!templateId}
						/>
					</Group>
				</div>

				<Divider />

				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('form.analytics.import.sections.table')}
					</Text>

					{selectedCount > 0 && (
						<Group justify='space-between' className={styles.selectionBar}>
							<Text size='sm' fw={500}>
								{t('form.analytics.import.selection.selectedCount', {
									count: selectedCount,
								})}
							</Text>
							<Group gap='xs' className={styles.actions}>
								<Button
									size='sm'
									variant='subtle'
									onClick={() => setSelectedIds(new Set())}
								>
									{t('form.analytics.import.selection.clear')}
								</Button>
								<Button size='sm' onClick={handleImportSelected}>
									{t('form.analytics.import.selection.importSelected')}
								</Button>
							</Group>
						</Group>
					)}

					{!templateId ? (
						<EmptyState
							message={t('form.analytics.import.empty.selectGroupTitle')}
							description={t(
								'form.analytics.import.empty.selectGroupDescription'
							)}
						/>
					) : filteredVariables.length === 0 && !variablesLoading ? (
						<EmptyState
							message={
								search.trim()
									? t('form.analytics.import.empty.noSearchResultsTitle')
									: t('form.analytics.import.empty.noVariablesTitle')
							}
							description={
								search.trim()
									? t('form.analytics.import.empty.noSearchResultsDescription')
									: t('form.analytics.import.empty.noVariablesDescription')
							}
						/>
					) : (
						<div className={styles.tableWrap}>
							<BaseTable
								data={filteredVariables}
								columns={columns}
								isLoading={variablesLoading}
								density='compact'
							/>
						</div>
					)}
				</div>

				<Group justify='flex-end'>
					<Button size='sm' variant='default' onClick={onClose}>
						{t('form.analytics.import.actions.close')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
