import {
	Button,
	Divider,
	Group,
	Modal,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import {
	useCreateTemplateVariable,
	useGetCustomVariableTemplates,
} from '~/queries/customVariableTemplatesQueries';
import type { AnalyticsDataCollectionRow } from '../../analyticsFormContext';
import styles from './SaveToGroupModal.module.css';

interface SaveToGroupModalProps {
	opened: boolean;
	onClose: () => void;
	row: AnalyticsDataCollectionRow | null;
	onSaved?: () => void;
}

const normalizeIdentifier = (identifier: string): string => {
	return identifier
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');
};

const humanizeIdentifier = (identifier: string): string => {
	return identifier
		.trim()
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map(
			(part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
		)
		.join(' ');
};

export default function SaveToGroupModal({
	opened,
	onClose,
	row,
	onSaved,
}: SaveToGroupModalProps) {
	const { t } = useTranslation(['campaigns', 'common']);
	const [templateId, setTemplateId] = useState<string | null>(null);
	const [categorySearch, setCategorySearch] = useState('');
	const [categoryId, setCategoryId] = useState<string | null>(null);
	const [label, setLabel] = useState('');

	const { data: templatesResponse, isLoading: templatesLoading } =
		useGetCustomVariableTemplates({ limit: 100, offset: 0 });
	const { data: categoriesResponse } = useGetCampaignCategories({
		active: true,
		limit: 10,
		offset: 0,
		...(categorySearch.trim() ? { name: categorySearch.trim() } : {}),
	});
	const createTemplateVariable = useCreateTemplateVariable();

	const templateOptions = useMemo(
		() =>
			(templatesResponse?.templates || []).map((template) => ({
				value: String(template.id),
				label: `${template.name} (#${template.id})`,
			})),
		[templatesResponse?.templates]
	);

	const categoryOptions = useMemo(
		() =>
			(categoriesResponse?.data || []).map((category) => ({
				value: String(category.id),
				label: category.name,
			})),
		[categoriesResponse?.data]
	);

	const technicalName = normalizeIdentifier(row?.identifier ?? '');
	const canSave = Boolean(templateId && label.trim() && technicalName);

	useEffect(() => {
		if (!opened) return;
		const normalizedName = normalizeIdentifier(row?.identifier ?? '');
		const defaultLabel = humanizeIdentifier(
			normalizedName || row?.identifier || ''
		);
		setLabel(defaultLabel);
		setTemplateId(null);
		setCategoryId(null);
		setCategorySearch('');
	}, [opened, row?.identifier]);

	const handleClose = () => {
		setTemplateId(null);
		setCategoryId(null);
		setCategorySearch('');
		setLabel('');
		onClose();
	};

	const handleSave = async () => {
		if (!row || !templateId) return;

		if (!label.trim()) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.analytics.saveToGroup.errors.labelRequired'),
				color: 'red',
			});
			return;
		}

		if (!technicalName) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.analytics.saveToGroup.errors.invalidIdentifier'),
				color: 'red',
			});
			return;
		}

		try {
			await createTemplateVariable.mutateAsync({
				templateId: Number(templateId),
				data: {
					label: label.trim(),
					name: technicalName,
					categoryId: categoryId ? Number(categoryId) : null,
					value: {
						type: row.type,
						description: row.description,
						enum: row.type === 'string' ? row.enum : undefined,
						value_type: 'llm_type',
						is_system_provided: false,
						dynamic_variable: '',
						constant_value: '',
					},
				},
			});

			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('form.analytics.saveToGroup.notifications.success'),
				color: 'green',
			});
			onSaved?.();
			handleClose();
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.analytics.saveToGroup.notifications.error'),
				color: 'red',
			});
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={t('form.analytics.saveToGroup.title')}
			size='md'
		>
			<Stack gap='sm' className={styles.form}>
				<Text size='sm' c='dimmed'>
					{t('form.analytics.saveToGroup.description')}
				</Text>
				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('form.analytics.saveToGroup.sections.identity')}
					</Text>
					<TextInput
						size='sm'
						label={t('form.analytics.saveToGroup.fields.label')}
						placeholder={t('form.analytics.saveToGroup.placeholders.label')}
						value={label}
						onChange={(event) => setLabel(event.currentTarget.value)}
						required
					/>
					<Text size='xs' c='dimmed' className={styles.sectionHint}>
						{t('form.analytics.saveToGroup.hints.label')}
					</Text>
					<div className={styles.identifierBlock}>
						<Text size='sm' fw={500}>
							{t('form.analytics.saveToGroup.fields.identifierPreview')}
						</Text>
						<Text
							size='sm'
							className={`${styles.identifierValue} ${!technicalName ? styles.identifierEmpty : ''}`}
						>
							{technicalName || '--'}
						</Text>
						<Text size='xs' c='dimmed' className={styles.sectionHint}>
							{t('form.analytics.saveToGroup.hints.identifier')}
						</Text>
					</div>
				</div>

				<Divider />

				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('form.analytics.saveToGroup.sections.destination')}
					</Text>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<Select
							size='sm'
							label={t('form.analytics.saveToGroup.fields.group')}
							placeholder={t('form.analytics.saveToGroup.placeholders.group')}
							data={templateOptions}
							value={templateId}
							onChange={setTemplateId}
							searchable
							disabled={templatesLoading}
							required
						/>
						<Select
							size='sm'
							label={t('form.analytics.saveToGroup.fields.category')}
							placeholder={t(
								'form.analytics.saveToGroup.placeholders.category'
							)}
							data={categoryOptions}
							value={categoryId}
							onChange={setCategoryId}
							searchable
							clearable
							searchValue={categorySearch}
							onSearchChange={setCategorySearch}
						/>
					</SimpleGrid>
				</div>

				<Group justify='flex-end' gap='xs' className={styles.actions}>
					<Button
						size='sm'
						variant='subtle'
						onClick={handleClose}
						disabled={createTemplateVariable.isPending}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						size='sm'
						onClick={handleSave}
						disabled={!canSave}
						loading={createTemplateVariable.isPending}
					>
						{t('form.analytics.saveToGroup.actions.save')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
