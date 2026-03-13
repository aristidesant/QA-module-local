import {
	Alert,
	Button,
	Divider,
	Group,
	Modal,
	Radio,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import customVariableTemplatesApi from '~/api/customVariableTemplatesApi';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type {
	CreateCustomVariableRequest,
	CustomVariable,
} from '~/models/CustomVariableModel';
import {
	useCreateCustomVariableTemplate,
	useCreateTemplateVariable,
	useGetCustomVariableTemplates,
	useUpdateTemplateVariable,
} from '~/queries/customVariableTemplatesQueries';
import type { AnalyticsDataCollectionRow } from '../../analyticsFormContext';
import styles from './SaveDataCollectionToGroupModal.module.css';

interface SaveDataCollectionToGroupModalProps {
	opened: boolean;
	onClose: () => void;
	rows: AnalyticsDataCollectionRow[];
	onCompleted?: () => void;
}

type SaveMode = 'existing' | 'new';
type SaveAllConflictPolicy = 'skip' | 'replace' | 'duplicate';

interface PreparedAnalyticsVariable {
	rowId: string;
	identifier: string;
	payload: CreateCustomVariableRequest;
}

interface SaveAllSummaryCounts {
	createdCount: number;
	updatedCount: number;
	duplicatedCount: number;
	skippedCount: number;
	invalidCount: number;
}

const DEFAULT_VALUE_TYPE = 'llm_type';

const normalizeIdentifier = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');

const humanizeIdentifier = (value: string): string =>
	value
		.trim()
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
		.join(' ');

const buildPayloadFromRow = (
	row: AnalyticsDataCollectionRow,
	identifier: string
): CreateCustomVariableRequest => ({
	label: humanizeIdentifier(identifier),
	name: identifier,
	categoryId: null,
	value: {
		type: row.type,
		description: row.description || '',
		enum: row.type === 'string' ? row.enum : undefined,
		value_type: DEFAULT_VALUE_TYPE,
		is_system_provided: false,
		dynamic_variable: '',
		constant_value: '',
	},
});

const getUniqueName = (baseName: string, occupied: Set<string>) => {
	if (!occupied.has(baseName)) {
		occupied.add(baseName);
		return baseName;
	}
	let suffix = 2;
	while (occupied.has(`${baseName}_${suffix}`)) {
		suffix += 1;
	}
	const next = `${baseName}_${suffix}`;
	occupied.add(next);
	return next;
};

export default function SaveDataCollectionToGroupModal({
	opened,
	onClose,
	rows,
	onCompleted,
}: SaveDataCollectionToGroupModalProps) {
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
	const { canPerformAction } = usePermissions();
	const canReplace = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.UPDATE
	);

	const [mode, setMode] = useState<SaveMode>('existing');
	const [existingTemplateId, setExistingTemplateId] = useState<string | null>(
		null
	);
	const [newGroupName, setNewGroupName] = useState('');
	const [targetTemplateId, setTargetTemplateId] = useState<number | null>(null);
	const [conflictPolicy, setConflictPolicy] =
		useState<SaveAllConflictPolicy>('skip');
	const [preparedVariables, setPreparedVariables] = useState<
		PreparedAnalyticsVariable[]
	>([]);
	const [conflicts, setConflicts] = useState<
		Array<{ incoming: PreparedAnalyticsVariable; existing: CustomVariable }>
	>([]);
	const [step, setStep] = useState<'setup' | 'conflicts'>('setup');
	const [isProcessing, setIsProcessing] = useState(false);

	const { data: templatesResponse, isLoading: templatesLoading } =
		useGetCustomVariableTemplates({ limit: 100, offset: 0 });
	const createTemplate = useCreateCustomVariableTemplate();
	const createTemplateVariable = useCreateTemplateVariable();
	const updateTemplateVariable = useUpdateTemplateVariable();

	const templateOptions = useMemo(
		() =>
			(templatesResponse?.templates || []).map((template) => ({
				value: String(template.id),
				label: `${template.name} (#${template.id})`,
			})),
		[templatesResponse?.templates]
	);

	const summary = useMemo(() => {
		const total = rows.length;
		const valid = rows.reduce((count, row) => {
			return normalizeIdentifier(row.identifier) ? count + 1 : count;
		}, 0);
		return {
			total,
			valid,
			invalid: total - valid,
		};
	}, [rows]);

	const resetState = () => {
		setMode('existing');
		setExistingTemplateId(null);
		setNewGroupName('');
		setTargetTemplateId(null);
		setConflictPolicy('skip');
		setPreparedVariables([]);
		setConflicts([]);
		setStep('setup');
	};

	const handleClose = () => {
		if (
			isProcessing ||
			createTemplate.isPending ||
			createTemplateVariable.isPending ||
			updateTemplateVariable.isPending
		) {
			return;
		}
		resetState();
		onClose();
	};

	const buildPreparedVariables = (): {
		prepared: PreparedAnalyticsVariable[];
		invalidCount: number;
	} => {
		const prepared: PreparedAnalyticsVariable[] = [];
		let invalidCount = 0;

		for (const row of rows) {
			const identifier = normalizeIdentifier(row.identifier);
			if (!identifier) {
				invalidCount += 1;
				continue;
			}
			prepared.push({
				rowId: row.id,
				identifier,
				payload: buildPayloadFromRow(row, identifier),
			});
		}
		return { prepared, invalidCount };
	};

	const executeSave = async (
		templateId: number,
		prepared: PreparedAnalyticsVariable[],
		existingVariables: CustomVariable[],
		invalidCount: number,
		policy: SaveAllConflictPolicy
	) => {
		const existingByName = new Map(
			existingVariables.map((variable) => [
				variable.name.toLowerCase(),
				variable,
			])
		);
		const occupiedNames = new Set(
			existingVariables.map((variable) => variable.name.toLowerCase())
		);

		const result: SaveAllSummaryCounts = {
			createdCount: 0,
			updatedCount: 0,
			duplicatedCount: 0,
			skippedCount: 0,
			invalidCount,
		};

		for (const item of prepared) {
			const existing = existingByName.get(item.identifier);
			if (!existing) {
				await createTemplateVariable.mutateAsync({
					templateId,
					data: item.payload,
				});
				occupiedNames.add(item.identifier);
				result.createdCount += 1;
				continue;
			}

			if (policy === 'skip') {
				result.skippedCount += 1;
				continue;
			}

			if (policy === 'replace') {
				if (!canReplace) {
					result.skippedCount += 1;
					continue;
				}
				await updateTemplateVariable.mutateAsync({
					templateId,
					variableId: existing.id,
					data: {
						label: item.payload.label,
						name: item.payload.name,
						categoryId: item.payload.categoryId,
						value: item.payload.value,
					},
				});
				result.updatedCount += 1;
				continue;
			}

			const uniqueName = getUniqueName(item.identifier, occupiedNames);
			await createTemplateVariable.mutateAsync({
				templateId,
				data: {
					...item.payload,
					name: uniqueName,
					label: humanizeIdentifier(uniqueName),
				},
			});
			result.duplicatedCount += 1;
		}

		const hasWarnings = result.skippedCount > 0 || result.invalidCount > 0;
		notifications.show({
			title: hasWarnings
				? t('form.analytics.saveAllToGroup.notifications.warning')
				: t('form.analytics.saveAllToGroup.notifications.success'),
			message: t('form.analytics.saveAllToGroup.notifications.resultSummary', {
				createdCount: result.createdCount,
				updatedCount: result.updatedCount,
				duplicatedCount: result.duplicatedCount,
				skippedCount: result.skippedCount,
				invalidCount: result.invalidCount,
			}),
			color: hasWarnings ? 'yellow' : 'green',
		});

		resetState();
		onCompleted?.();
		onClose();
	};

	const precheckAndContinue = async () => {
		setIsProcessing(true);
		try {
			if (summary.valid === 0) {
				notifications.show({
					title: t('status.error', { ns: 'common' }),
					message: t('form.analytics.saveAllToGroup.errors.noValidVariables'),
					color: 'red',
				});
				setIsProcessing(false);
				return;
			}

			let templateId: number | null = null;
			if (mode === 'existing') {
				if (!existingTemplateId) {
					notifications.show({
						title: t('status.error', { ns: 'common' }),
						message: t('form.analytics.saveAllToGroup.errors.groupRequired'),
						color: 'red',
					});
					return;
				}
				templateId = Number(existingTemplateId);
			} else {
				if (!newGroupName.trim()) {
					notifications.show({
						title: t('status.error', { ns: 'common' }),
						message: t(
							'form.analytics.saveAllToGroup.errors.newGroupNameRequired'
						),
						color: 'red',
					});
					return;
				}
				const created = await createTemplate.mutateAsync({
					name: newGroupName.trim(),
				});
				templateId = created.id;
			}

			setTargetTemplateId(templateId);
			const { prepared, invalidCount } = buildPreparedVariables();
			setPreparedVariables(prepared);

			const existingVariables =
				mode === 'existing'
					? await customVariableTemplatesApi().getTemplateVariables(templateId)
					: [];

			const existingByName = new Map(
				existingVariables.map((variable) => [
					variable.name.toLowerCase(),
					variable,
				])
			);

			const nextConflicts = prepared
				.map((incoming) => {
					const existing = existingByName.get(incoming.identifier);
					return existing ? { incoming, existing } : null;
				})
				.filter(
					(
						entry
					): entry is {
						incoming: PreparedAnalyticsVariable;
						existing: CustomVariable;
					} => Boolean(entry)
				);

			setConflicts(nextConflicts);

			if (nextConflicts.length === 0) {
				await executeSave(
					templateId,
					prepared,
					existingVariables,
					invalidCount,
					'skip'
				);
				setIsProcessing(false);
				return;
			}

			setStep('conflicts');
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.analytics.saveAllToGroup.notifications.error'),
				color: 'red',
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSaveWithPolicy = async () => {
		if (!targetTemplateId) return;
		setIsProcessing(true);
		try {
			if (conflictPolicy === 'replace' && !canReplace) {
				notifications.show({
					title: t('status.error', { ns: 'common' }),
					message: t(
						'form.analytics.saveAllToGroup.errors.replacePermissionRequired'
					),
					color: 'red',
				});
				setIsProcessing(false);
				return;
			}

			const existingVariables =
				await customVariableTemplatesApi().getTemplateVariables(
					targetTemplateId
				);
			const invalidCount = rows.length - preparedVariables.length;
			await executeSave(
				targetTemplateId,
				preparedVariables,
				existingVariables,
				invalidCount,
				conflictPolicy
			);
		} catch {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.analytics.saveAllToGroup.notifications.error'),
				color: 'red',
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={t('form.analytics.saveAllToGroup.title')}
			size='xl'
		>
			<Stack gap='sm' className={styles.form}>
				<Text size='sm' c='dimmed'>
					{t('form.analytics.saveAllToGroup.description')}
				</Text>

				{step === 'setup' ? (
					<>
						<div className={styles.section}>
							<Text size='sm' fw={600} className={styles.sectionTitle}>
								{t('form.analytics.saveAllToGroup.sections.destination')}
							</Text>
							<Radio.Group
								value={mode}
								onChange={(value) => setMode(value as SaveMode)}
							>
								<Group gap='md'>
									<Radio
										value='existing'
										label={t(
											'form.analytics.saveAllToGroup.modes.existingGroup'
										)}
									/>
									<Radio
										value='new'
										label={t('form.analytics.saveAllToGroup.modes.newGroup')}
									/>
								</Group>
							</Radio.Group>

							{mode === 'existing' ? (
								<Select
									size='sm'
									label={t('form.analytics.saveAllToGroup.fields.group')}
									placeholder={t(
										'form.analytics.saveAllToGroup.placeholders.group'
									)}
									data={templateOptions}
									value={existingTemplateId}
									onChange={setExistingTemplateId}
									searchable
									disabled={templatesLoading}
								/>
							) : (
								<TextInput
									size='sm'
									label={t('form.analytics.saveAllToGroup.fields.newGroupName')}
									placeholder={t(
										'form.analytics.saveAllToGroup.placeholders.newGroupName'
									)}
									value={newGroupName}
									onChange={(event) =>
										setNewGroupName(event.currentTarget.value)
									}
								/>
							)}
						</div>

						<Divider />

						<div className={styles.section}>
							<Text size='sm' fw={600} className={styles.sectionTitle}>
								{t('form.analytics.saveAllToGroup.sections.summary')}
							</Text>
							<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xs'>
								<div className={styles.metricCard}>
									<Text size='xs' c='dimmed'>
										{t('form.analytics.saveAllToGroup.summary.total')}
									</Text>
									<Text size='sm' fw={600}>
										{summary.total}
									</Text>
								</div>
								<div className={styles.metricCard}>
									<Text size='xs' c='dimmed'>
										{t('form.analytics.saveAllToGroup.summary.valid')}
									</Text>
									<Text size='sm' fw={600}>
										{summary.valid}
									</Text>
								</div>
								<div className={styles.metricCard}>
									<Text size='xs' c='dimmed'>
										{t('form.analytics.saveAllToGroup.summary.invalid')}
									</Text>
									<Text size='sm' fw={600}>
										{summary.invalid}
									</Text>
								</div>
							</SimpleGrid>
							<Text size='xs' c='dimmed'>
								{t('form.analytics.saveAllToGroup.hints.mapping')}
							</Text>
						</div>

						<Group justify='flex-end' gap='xs'>
							<Button
								size='sm'
								variant='subtle'
								onClick={handleClose}
								disabled={
									isProcessing ||
									createTemplate.isPending ||
									createTemplateVariable.isPending ||
									updateTemplateVariable.isPending
								}
							>
								{t('form.analytics.saveAllToGroup.actions.cancel')}
							</Button>
							<Button
								size='sm'
								onClick={precheckAndContinue}
								loading={createTemplate.isPending || isProcessing}
							>
								{t('form.analytics.saveAllToGroup.actions.continue')}
							</Button>
						</Group>
					</>
				) : (
					<>
						<div className={styles.section}>
							<Text size='sm' fw={600} className={styles.sectionTitle}>
								{t('form.analytics.saveAllToGroup.sections.conflicts')}
							</Text>
							<Text size='sm' c='dimmed'>
								{t('form.analytics.saveAllToGroup.summary.conflicts', {
									count: conflicts.length,
								})}
							</Text>
							<Radio.Group
								label={t('form.analytics.saveAllToGroup.fields.policy')}
								value={conflictPolicy}
								onChange={(value) =>
									setConflictPolicy(value as SaveAllConflictPolicy)
								}
							>
								<Stack gap='xs' mt='xs'>
									<Radio
										value='skip'
										label={t('form.analytics.saveAllToGroup.policies.skip')}
									/>
									<Radio
										value='replace'
										label={t('form.analytics.saveAllToGroup.policies.replace')}
										disabled={!canReplace}
									/>
									<Radio
										value='duplicate'
										label={t(
											'form.analytics.saveAllToGroup.policies.duplicate'
										)}
									/>
								</Stack>
							</Radio.Group>
							{!canReplace && (
								<Alert
									icon={<IconAlertCircle size={16} />}
									color='yellow'
									radius='sm'
								>
									<Text size='xs'>
										{t(
											'form.analytics.saveAllToGroup.hints.replacePermissionRequired'
										)}
									</Text>
								</Alert>
							)}

							<Table withTableBorder striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>
											{t('form.analytics.saveAllToGroup.table.identifier')}
										</Table.Th>
										<Table.Th>
											{t('form.analytics.saveAllToGroup.table.currentType')}
										</Table.Th>
										<Table.Th>
											{t('form.analytics.saveAllToGroup.table.incomingType')}
										</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{conflicts.map((conflict) => (
										<Table.Tr key={conflict.incoming.rowId}>
											<Table.Td>
												<Text size='sm' ff='monospace'>
													{conflict.incoming.identifier}
												</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{conflict.existing.value.type}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>
													{conflict.incoming.payload.value.type}
												</Text>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>

						<Group justify='space-between' gap='xs'>
							<Button
								size='sm'
								variant='default'
								onClick={() => setStep('setup')}
								disabled={
									isProcessing ||
									createTemplateVariable.isPending ||
									updateTemplateVariable.isPending
								}
							>
								{t('form.analytics.saveAllToGroup.actions.back')}
							</Button>
							<Group gap='xs'>
								<Button
									size='sm'
									variant='subtle'
									onClick={handleClose}
									disabled={
										isProcessing ||
										createTemplateVariable.isPending ||
										updateTemplateVariable.isPending
									}
								>
									{t('form.analytics.saveAllToGroup.actions.cancel')}
								</Button>
								<Button
									size='sm'
									onClick={handleSaveWithPolicy}
									loading={
										isProcessing ||
										createTemplateVariable.isPending ||
										updateTemplateVariable.isPending
									}
								>
									{t('form.analytics.saveAllToGroup.actions.save')}
								</Button>
							</Group>
						</Group>
					</>
				)}
			</Stack>
		</Modal>
	);
}
