import {
	ActionIcon,
	Button,
	Group,
	Pill,
	PillGroup,
	Select,
	SimpleGrid,
	Stack,
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
import RightSectionCard from '~/components/RightSectionCard';
import SaveToGroupModal from '../components/SaveToGroupModal';
import {
	useAnalyticsFormContext,
	type AnalyticsDataCollectionRow,
	type DataCollectionType,
} from '../analyticsFormContext';

const AnalyticsVariableEditor = () => {
	const { t } = useTranslation(['campaigns', 'common']);
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
				label: t('form.analytics.types.boolean', { ns: 'campaigns' }),
			},
			{
				value: 'integer',
				label: t('form.analytics.types.integer', { ns: 'campaigns' }),
			},
			{
				value: 'number',
				label: t('form.analytics.types.number', { ns: 'campaigns' }),
			},
			{
				value: 'string',
				label: t('form.analytics.types.string', { ns: 'campaigns' }),
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

	const handleCancel = () => {
		if (selectedRow.isNew) {
			form.removeListItem('rows', selectedIndex);
		}
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
	};

	return (
		<RightSectionCard
			title={t('form.analytics.editor.title', { ns: 'campaigns' })}
			description={t('form.analytics.editor.description', { ns: 'campaigns' })}
			rightSection={
				<ActionIcon
					size='sm'
					variant='subtle'
					color='red'
					onClick={() => {
						form.removeListItem('rows', selectedIndex);
						form.setFieldValue('selectedRowId', null);
					}}
				>
					<IconTrash size={14} />
				</ActionIcon>
			}
		>
			<Stack gap='xs'>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
					<Select
						size='sm'
						label={t('form.analytics.fields.type', { ns: 'campaigns' })}
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
						label={t('form.analytics.fields.identifier', { ns: 'campaigns' })}
						placeholder={t('form.analytics.placeholders.identifier', {
							ns: 'campaigns',
						})}
						error={
							!draft.identifier.trim()
								? t('form.analytics.validation.identifierRequired', {
										ns: 'campaigns',
									})
								: hasDuplicateIdentifier
									? t('form.analytics.validation.identifierUnique', {
											ns: 'campaigns',
										})
									: undefined
						}
						value={draft.identifier}
						onChange={(event) => {
							const nextIdentifier = event.currentTarget.value;
							return setDraft((current) =>
								current ? { ...current, identifier: nextIdentifier } : current
							);
						}}
					/>
				</SimpleGrid>

				<Textarea
					size='sm'
					label={t('form.analytics.fields.description', { ns: 'campaigns' })}
					placeholder={t('form.analytics.placeholders.description', {
						ns: 'campaigns',
					})}
					autosize
					minRows={3}
					maxRows={5}
					value={draft.description}
					onChange={(event) => {
						const nextDescription = event.currentTarget.value;
						return setDraft((current) =>
							current ? { ...current, description: nextDescription } : current
						);
					}}
				/>

				<Text size='xs' c='dimmed'>
					{t('form.analytics.descriptionHint', { ns: 'campaigns' })}
				</Text>

				{draft.type === 'string' && (
					<Stack gap='xs'>
						<Text size='sm' fw={600}>
							{t('form.analytics.fields.enumValues', { ns: 'campaigns' })}
						</Text>
						<Group gap='xs' align='flex-end' wrap='nowrap'>
							<TextInput
								size='sm'
								placeholder={t('form.analytics.placeholders.enumValue', {
									ns: 'campaigns',
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
								style={{ flex: 1 }}
							/>
							<Button
								size='sm'
								variant='default'
								onClick={addEnumValue}
								px='xs'
							>
								<IconPlus size={14} />
							</Button>
						</Group>

						{enumValues.length > 0 && (
							<Stack gap='xs'>
								<Text size='sm' fw={500}>
									{t('form.analytics.fields.enumValuesCount', {
										ns: 'campaigns',
										count: enumValues.length,
									})}
								</Text>
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
							</Stack>
						)}

						<Text size='xs' c='dimmed'>
							{t('form.analytics.enumHint', { ns: 'campaigns' })}
						</Text>
					</Stack>
				)}

				<Text size='xs' c='dimmed'>
					{t('form.analytics.editor.stringHint', { ns: 'campaigns' })}
				</Text>

				<Group justify='flex-end' gap='xs'>
					{canSaveToGroup && (
						<Button
							size='sm'
							variant='light'
							color='grape'
							onClick={() => setSaveToGroupOpened(true)}
							disabled={hasIdentifierError}
						>
							{t('form.analytics.actions.saveToGroup', { ns: 'campaigns' })}
						</Button>
					)}
					<Button size='sm' variant='default' onClick={handleCancel}>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						size='sm'
						onClick={handleSave}
						disabled={hasIdentifierError || !isDraftDirty}
					>
						{t('form.actions.save', { ns: 'campaigns' })}
					</Button>
				</Group>
			</Stack>

			<SaveToGroupModal
				opened={saveToGroupOpened}
				onClose={() => setSaveToGroupOpened(false)}
				row={draft}
				onSaved={() => setSaveToGroupOpened(false)}
			/>
		</RightSectionCard>
	);
};

export default AnalyticsVariableEditor;
