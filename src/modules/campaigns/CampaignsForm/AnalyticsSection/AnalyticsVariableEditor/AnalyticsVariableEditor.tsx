import {
	Badge,
	Button,
	Group,
	Paper,
	Pill,
	PillGroup,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import SaveToGroupModal from '../components/SaveToGroupModal';
import {
	useAnalyticsFormContext,
	type AnalyticsDataCollectionRow,
	type DataCollectionType,
} from '../analyticsFormContext';
import styles from './AnalyticsVariableEditor.module.css';

interface AnalyticsVariableEditorProps {
	onClose: () => void;
	onDeleteRequest: (rowId: string, identifier: string) => void;
}

const AnalyticsVariableEditor = ({
	onClose,
	onDeleteRequest,
}: AnalyticsVariableEditorProps) => {
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
	const form = useAnalyticsFormContext();
	const { canPerformAction } = usePermissions();
	const [enumInputValue, setEnumInputValue] = useState('');
	const [draft, setDraft] = useState<AnalyticsDataCollectionRow | null>(null);
	const [saveToGroupOpened, setSaveToGroupOpened] = useState(false);

	const selectedIndex = useMemo(
		() =>
			form.values.rows.findIndex((row) => row.id === form.values.selectedRowId),
		[form.values.rows, form.values.selectedRowId]
	);

	const selectedRow =
		selectedIndex >= 0 ? form.values.rows[selectedIndex] : null;
	const canSaveToGroup = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);

	useEffect(() => {
		setDraft(
			selectedRow
				? { ...selectedRow, enum: [...(selectedRow.enum ?? [])] }
				: null
		);
		setEnumInputValue('');
	}, [selectedRow?.id]);

	const dataTypeOptions = useMemo(
		() => [
			{
				value: 'boolean',
				label: t('form.analytics.types.boolean', {
					ns: 'campaign.form.analytics',
				}),
			},
			{
				value: 'integer',
				label: t('form.analytics.types.integer', {
					ns: 'campaign.form.analytics',
				}),
			},
			{
				value: 'number',
				label: t('form.analytics.types.number', {
					ns: 'campaign.form.analytics',
				}),
			},
			{
				value: 'string',
				label: t('form.analytics.types.string', {
					ns: 'campaign.form.analytics',
				}),
			},
		],
		[t]
	);

	if (!selectedRow || !draft) {
		return null;
	}

	const enumValues = draft.enum ?? [];
	const identifierCounts = form.values.rows.reduce<Record<string, number>>(
		(acc, row) => {
			const key =
				row.id === draft.id
					? draft.identifier.trim().toLowerCase()
					: row.identifier.trim().toLowerCase();
			if (!key) return acc;
			acc[key] = (acc[key] ?? 0) + 1;
			return acc;
		},
		{}
	);

	const normalizedIdentifier = draft.identifier.trim().toLowerCase();
	const hasDuplicateIdentifier =
		normalizedIdentifier.length > 0 &&
		(identifierCounts[normalizedIdentifier] ?? 0) > 1;
	const hasIdentifierError = !draft.identifier.trim() || hasDuplicateIdentifier;

	const isDraftDirty =
		JSON.stringify({
			...selectedRow,
			enum: [...(selectedRow.enum ?? [])],
		}) !==
		JSON.stringify({
			...draft,
			enum: [...(draft.enum ?? [])],
		});

	const addEnumValue = () => {
		const nextValue = enumInputValue.trim();
		if (!nextValue) return;
		const exists = enumValues.some(
			(value) => value.toLowerCase() === nextValue.toLowerCase()
		);
		if (exists) return;
		setDraft((current) =>
			current
				? { ...current, enum: [...(current.enum ?? []), nextValue] }
				: current
		);
		setEnumInputValue('');
	};

	const removeEnumValue = (valueToRemove: string) => {
		setDraft((current) =>
			current
				? {
						...current,
						enum: (current.enum ?? []).filter(
							(value) => value !== valueToRemove
						),
					}
				: current
		);
	};

	const handleDelete = () => {
		const row = form.values.rows[selectedIndex];

		if (row?.isSystemDefault) {
			onDeleteRequest(row.id, row.identifier);
			return;
		}

		form.removeListItem('rows', selectedIndex);
		form.setFieldValue('selectedRowId', null);
	};

	const handleSave = () => {
		if (hasIdentifierError || !draft) return;
		form.setFieldValue(`rows.${selectedIndex}`, {
			...draft,
			isNew: false,
			enum: draft.type === 'string' ? (draft.enum ?? []) : [],
			source: draft.source ?? 'manual',
		});
		form.setFieldValue('selectedRowId', null);
	};

	return (
		<>
			<div className={styles.editorRoot}>
				<div className={styles.editorContent}>
					<Paper withBorder radius='md' p='sm'>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<Select
								size='sm'
								label={t('form.analytics.fields.type', {
									ns: 'campaign.form.analytics',
								})}
								data={dataTypeOptions}
								value={draft.type}
								onChange={(value) => {
									if (!value) return;
									setDraft((current) =>
										current
											? {
													...current,
													type: value as DataCollectionType,
													enum: value === 'string' ? (current.enum ?? []) : [],
												}
											: current
									);
								}}
							/>
							<TextInput
								size='sm'
								label={t('form.analytics.fields.identifier', {
									ns: 'campaign.form.analytics',
								})}
								placeholder={t('form.analytics.placeholders.identifier', {
									ns: 'campaign.form.analytics',
								})}
								error={
									!draft.identifier.trim()
										? t('form.analytics.validation.identifierRequired', {
												ns: 'campaign.form.analytics',
											})
										: hasDuplicateIdentifier
											? t('form.analytics.validation.identifierUnique', {
													ns: 'campaign.form.analytics',
												})
											: undefined
								}
								value={draft.identifier}
								onChange={(event) => {
									const nextIdentifier = event.currentTarget.value;
									return setDraft((current) =>
										current
											? { ...current, identifier: nextIdentifier }
											: current
									);
								}}
							/>
						</SimpleGrid>
					</Paper>

					<Paper withBorder radius='md' p='sm'>
						<Group justify='space-between' align='center' gap='md'>
							<div className={styles.activationCopy}>
								<Text size='sm' fw={600}>
									{t('form.analytics.fields.isActive', {
										ns: 'campaign.form.analytics',
									})}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('form.analytics.activationHint', {
										ns: 'campaign.form.analytics',
									})}
								</Text>
							</div>
							<Stack gap={4} align='flex-end'>
								<Badge
									size='sm'
									variant={draft.isActive ? 'light' : 'outline'}
									color={draft.isActive ? 'teal' : 'gray'}
								>
									{draft.isActive
										? t('form.analytics.table.active', {
												ns: 'campaign.form.analytics',
											})
										: t('form.analytics.table.inactive', {
												ns: 'campaign.form.analytics',
											})}
								</Badge>
								<Switch
									size='md'
									checked={draft.isActive}
									onChange={(event) => {
										const checked = event.currentTarget.checked;
										setDraft((current) =>
											current ? { ...current, isActive: checked } : current
										);
									}}
								/>
							</Stack>
						</Group>
					</Paper>

					<Paper withBorder radius='md' p='sm'>
						<Stack gap='xs'>
							<Group justify='space-between' align='center'>
								<Text size='sm' fw={600}>
									{t('form.analytics.fields.description', {
										ns: 'campaign.form.analytics',
									})}
								</Text>
								<Badge
									size='sm'
									variant='light'
									color={isDraftDirty ? 'yellow' : 'green'}
								>
									{isDraftDirty
										? t('form.analytics.editor.states.draft', {
												ns: 'campaign.form.analytics',
											})
										: t('form.analytics.editor.states.saved', {
												ns: 'campaign.form.analytics',
											})}
								</Badge>
							</Group>
							<Textarea
								size='sm'
								placeholder={t('form.analytics.placeholders.description', {
									ns: 'campaign.form.analytics',
								})}
								autosize
								minRows={8}
								maxRows={14}
								value={draft.description}
								onChange={(event) => {
									const nextDescription = event.currentTarget.value;
									return setDraft((current) =>
										current
											? { ...current, description: nextDescription }
											: current
									);
								}}
							/>
							<Text size='xs' c='dimmed'>
								{t('form.analytics.descriptionHint', {
									ns: 'campaign.form.analytics',
								})}
							</Text>
						</Stack>
					</Paper>

					{draft.type === 'string' && (
						<Paper withBorder radius='md' p='sm'>
							<Stack gap='xs'>
								<Group justify='space-between' align='center'>
									<Text size='sm' fw={600}>
										{t('form.analytics.fields.enumValues', {
											ns: 'campaign.form.analytics',
										})}
									</Text>
									<Badge size='sm' variant='light' color='violet'>
										{t('form.analytics.fields.enumValuesCount', {
											ns: 'campaign.form.analytics',
											count: enumValues.length,
										})}
									</Badge>
								</Group>
								<Group gap='xs' align='flex-end' wrap='nowrap'>
									<TextInput
										size='sm'
										className={styles.enumInput}
										placeholder={t('form.analytics.placeholders.enumValue', {
											ns: 'campaign.form.analytics',
										})}
										value={enumInputValue}
										onChange={(event) =>
											setEnumInputValue(event.currentTarget.value)
										}
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
												event.preventDefault();
												addEnumValue();
											}
										}}
										aria-label={t('form.analytics.fields.enumValues', {
											ns: 'campaign.form.analytics',
										})}
									/>
									<Button
										size='sm'
										variant='default'
										onClick={addEnumValue}
										px='xs'
										aria-label={t('form.analytics.fields.enumValues', {
											ns: 'campaign.form.analytics',
										})}
									>
										<IconPlus size={14} />
									</Button>
								</Group>

								{enumValues.length > 0 && (
									<PillGroup>
										{enumValues.map((value) => (
											<Pill
												key={value}
												withRemoveButton
												onRemove={() => removeEnumValue(value)}
												removeButtonProps={{ icon: <IconX size={10} /> }}
											>
												{value}
											</Pill>
										))}
									</PillGroup>
								)}
							</Stack>
						</Paper>
					)}
				</div>

				<Paper withBorder radius='md' p='sm'>
					<Group justify='space-between' align='center' wrap='wrap' gap='xs'>
						<Button
							size='sm'
							variant='subtle'
							color='red'
							leftSection={<IconTrash size={14} />}
							onClick={handleDelete}
						>
							{t('actions.delete', { ns: 'common' })}
						</Button>

						<Group gap='xs' className={styles.footerActions}>
							{canSaveToGroup && (
								<Button
									size='sm'
									variant='light'
									color='grape'
									onClick={() => setSaveToGroupOpened(true)}
									disabled={hasIdentifierError}
								>
									{t('form.analytics.actions.saveToGroup', {
										ns: 'campaign.form.analytics',
									})}
								</Button>
							)}
							<Button size='sm' variant='default' onClick={onClose}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								size='sm'
								onClick={handleSave}
								disabled={hasIdentifierError || !isDraftDirty}
							>
								{t('actions.save', { ns: 'common' })}
							</Button>
						</Group>
					</Group>
				</Paper>
			</div>

			<SaveToGroupModal
				opened={saveToGroupOpened}
				onClose={() => setSaveToGroupOpened(false)}
				row={draft}
				onSaved={() => setSaveToGroupOpened(false)}
			/>
		</>
	);
};

export default AnalyticsVariableEditor;
