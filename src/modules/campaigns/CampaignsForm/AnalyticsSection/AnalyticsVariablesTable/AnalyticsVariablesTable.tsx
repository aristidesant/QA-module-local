import { Alert, Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconDownload,
	IconInfoCircle,
	IconPlus,
	IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type { CustomVariable } from '~/models/CustomVariableModel';
import BulkImportConflictModal, {
	type BulkConflictResolution,
	type BulkImportConflictItem,
} from '../components/BulkImportConflictModal';
import ImportCustomVariableModal from '../components/ImportCustomVariableModal';
import SaveDataCollectionToGroupModal from '../components/SaveDataCollectionToGroupModal';
import { useAnalyticsFormContext } from '../analyticsFormContext';
import useAnalyticsTableColumns from '../useAnalyticsTableColumns';
import styles from './AnalyticsVariablesTable.module.css';

interface AnalyticsVariablesTableProps {
	onAddRow: () => void;
}

interface PendingConflict extends BulkImportConflictItem {
	variable: CustomVariable;
}

const AnalyticsVariablesTable = ({
	onAddRow,
}: AnalyticsVariablesTableProps) => {
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
	const form = useAnalyticsFormContext();
	const { canAccessModule, canPerformAction } = usePermissions();
	const columns = useAnalyticsTableColumns();
	const canImportVariables = canAccessModule(ModuleEnum.SETTINGS);
	const canSaveAllToGroup = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const [importOpened, setImportOpened] = useState(false);
	const [saveAllOpened, setSaveAllOpened] = useState(false);
	const [bulkConflictOpened, setBulkConflictOpened] = useState(false);
	const [pendingDirectImports, setPendingDirectImports] = useState<
		CustomVariable[]
	>([]);
	const [pendingConflicts, setPendingConflicts] = useState<PendingConflict[]>(
		[]
	);
	const [pendingInvalidCount, setPendingInvalidCount] = useState(0);

	const normalizeType = (value: string | undefined) => {
		if (!value) return 'string';
		const lowered = value.toLowerCase();
		return ['boolean', 'integer', 'number', 'string'].includes(lowered)
			? lowered
			: 'string';
	};

	const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

	const getUniqueIdentifier = (baseIdentifier: string) => {
		const normalized = normalizeIdentifier(baseIdentifier);
		if (!normalized) return '';
		const identifiers = new Set(
			form.values.rows.map((row) => normalizeIdentifier(row.identifier))
		);
		if (!identifiers.has(normalized)) return normalized;

		let suffix = 2;
		while (identifiers.has(`${normalized}_${suffix}`)) {
			suffix += 1;
		}
		return `${normalized}_${suffix}`;
	};

	const mapCustomVariableToRow = (
		variable: CustomVariable,
		overrideIdentifier?: string
	) => {
		const identifier = normalizeIdentifier(overrideIdentifier || variable.name);
		return {
			id: crypto.randomUUID(),
			identifier,
			type: normalizeType(variable.value.type) as
				| 'boolean'
				| 'integer'
				| 'number'
				| 'string',
			description: variable.value.description || '',
			enum:
				normalizeType(variable.value.type) === 'string' &&
				Array.isArray(variable.value.enum)
					? variable.value.enum
					: [],
			value_type: variable.value.value_type,
			constant_value: variable.value.constant_value,
			dynamic_variable: variable.value.dynamic_variable,
			is_system_provided: variable.value.is_system_provided,
			isNew: false,
			source: 'custom-variable' as const,
			linkedCustomVariableId: variable.id,
			linkedTemplateId: variable.templateId,
		};
	};

	const showImportSummary = (counts: {
		importedCount: number;
		replacedCount: number;
		duplicatedCount: number;
		skippedCount: number;
		invalidCount: number;
	}) => {
		const hasWarnings = counts.skippedCount > 0 || counts.invalidCount > 0;
		notifications.show({
			title: hasWarnings
				? t('status.warning', { ns: 'common' })
				: t('status.success', { ns: 'common' }),
			message: t(
				hasWarnings
					? 'form.analytics.import.notifications.summaryWarning'
					: 'form.analytics.import.notifications.summarySuccess',
				counts
			),
			color: hasWarnings ? 'yellow' : 'green',
		});
	};

	const applyBulkImport = (
		directImports: CustomVariable[],
		conflicts: PendingConflict[],
		resolutions: Record<number, BulkConflictResolution>,
		invalidCount: number
	) => {
		let importedCount = 0;
		let replacedCount = 0;
		let duplicatedCount = 0;
		let skippedCount = 0;
		let lastSelectedRowId: string | null = null;

		for (const variable of directImports) {
			const identifier = normalizeIdentifier(variable.name);
			if (!identifier) {
				skippedCount += 1;
				continue;
			}
			const newRow = mapCustomVariableToRow(variable, identifier);
			form.insertListItem('rows', newRow);
			lastSelectedRowId = newRow.id;
			importedCount += 1;
		}

		for (const conflict of conflicts) {
			const action = resolutions[conflict.variableId] || 'skip';
			const identifier = conflict.identifier;

			if (action === 'skip') {
				skippedCount += 1;
				continue;
			}

			if (action === 'replace') {
				const existingIndex = form.values.rows.findIndex(
					(row) => normalizeIdentifier(row.identifier) === identifier
				);

				if (existingIndex >= 0) {
					const existingRow = form.values.rows[existingIndex];
					form.setFieldValue(`rows.${existingIndex}`, {
						...existingRow,
						...mapCustomVariableToRow(conflict.variable, identifier),
						id: existingRow.id,
					});
					lastSelectedRowId = existingRow.id;
					replacedCount += 1;
				} else {
					const fallbackRow = mapCustomVariableToRow(
						conflict.variable,
						identifier
					);
					form.insertListItem('rows', fallbackRow);
					lastSelectedRowId = fallbackRow.id;
					importedCount += 1;
				}
				continue;
			}

			const uniqueIdentifier = getUniqueIdentifier(identifier);
			if (!uniqueIdentifier) {
				skippedCount += 1;
				continue;
			}
			const duplicateRow = mapCustomVariableToRow(
				conflict.variable,
				uniqueIdentifier
			);
			form.insertListItem('rows', duplicateRow);
			lastSelectedRowId = duplicateRow.id;
			duplicatedCount += 1;
		}

		if (lastSelectedRowId) {
			form.setFieldValue('selectedRowId', lastSelectedRowId);
		}

		showImportSummary({
			importedCount,
			replacedCount,
			duplicatedCount,
			skippedCount,
			invalidCount,
		});

		setBulkConflictOpened(false);
		setPendingDirectImports([]);
		setPendingConflicts([]);
		setPendingInvalidCount(0);
	};

	const importVariables = (variables: CustomVariable[]) => {
		const directImports: CustomVariable[] = [];
		const conflicts: PendingConflict[] = [];
		let invalidCount = 0;

		for (const variable of variables) {
			const normalizedIdentifier = normalizeIdentifier(variable.name);
			if (!normalizedIdentifier) {
				invalidCount += 1;
				continue;
			}

			const existingRow = form.values.rows.find(
				(row) => normalizeIdentifier(row.identifier) === normalizedIdentifier
			);

			if (existingRow) {
				conflicts.push({
					variable,
					variableId: variable.id,
					identifier: normalizedIdentifier,
					sourceType: normalizeType(variable.value.type),
					existingType: existingRow.type,
					suggestedDuplicateIdentifier:
						getUniqueIdentifier(normalizedIdentifier),
					existingRow,
				});
				continue;
			}

			directImports.push(variable);
		}

		if (conflicts.length > 0) {
			setPendingDirectImports(directImports);
			setPendingConflicts(conflicts);
			setPendingInvalidCount(invalidCount);
			setImportOpened(false);
			setBulkConflictOpened(true);
			return;
		}

		applyBulkImport(directImports, [], {}, invalidCount);
		setImportOpened(false);
	};

	const handleBulkConflictConfirm = (
		resolutions: Record<number, BulkConflictResolution>
	) => {
		applyBulkImport(
			pendingDirectImports,
			pendingConflicts,
			resolutions,
			pendingInvalidCount
		);
	};

	return (
		<Stack gap='sm'>
			<Paper withBorder radius='md' p='xs'>
				<Group justify='space-between' align='center' gap='xs' wrap='wrap'>
					<Group gap='xs' align='center'>
						<Badge size='sm' variant='light' color='blue'>
							{t('form.analytics.totalVariables', {
								count: form.values.rows.length,
							})}
						</Badge>
						<Text size='xs' c='dimmed'>
							{t('form.analytics.editor.description')}
						</Text>
					</Group>
					<Group gap='xs' className={styles.actionsGroup}>
						<Button
							size='sm'
							leftSection={<IconPlus size={14} />}
							onClick={onAddRow}
						>
							{t('form.analytics.actions.addVariable')}
						</Button>
						{canImportVariables && (
							<Button
								size='sm'
								variant='default'
								leftSection={<IconDownload size={14} />}
								onClick={() => setImportOpened(true)}
							>
								{t('form.analytics.actions.importVariable')}
							</Button>
						)}
						{canSaveAllToGroup && (
							<Button
								size='sm'
								variant='default'
								color='grape'
								leftSection={<IconUpload size={14} />}
								onClick={() => setSaveAllOpened(true)}
							>
								{t('form.analytics.actions.saveAllToGroup')}
							</Button>
						)}
					</Group>
				</Group>
			</Paper>

			{form.values.rows.length === 0 && (
				<Alert
					icon={<IconInfoCircle size={16} />}
					title={t('form.analytics.info.title')}
					color='blue'
					variant='light'
					radius='sm'
				>
					<Text size='sm'>{t('form.analytics.info.message')}</Text>
				</Alert>
			)}

			<BaseTable
				data={form.values.rows}
				columns={columns}
				density='compact'
				emptyMessage={t('form.analytics.empty')}
				selectedRowId={form.values.selectedRowId}
				getRowId={(row) => row.id}
				onRowClick={(row) => form.setFieldValue('selectedRowId', row.id)}
			/>

			<ImportCustomVariableModal
				opened={importOpened}
				onClose={() => setImportOpened(false)}
				onImportMany={importVariables}
			/>

			<SaveDataCollectionToGroupModal
				opened={saveAllOpened}
				onClose={() => setSaveAllOpened(false)}
				rows={form.values.rows}
			/>

			<BulkImportConflictModal
				opened={bulkConflictOpened}
				onClose={() => {
					setBulkConflictOpened(false);
					setPendingDirectImports([]);
					setPendingConflicts([]);
					setPendingInvalidCount(0);
				}}
				conflicts={pendingConflicts.map(
					({ variable, ...conflict }) => conflict
				)}
				onConfirm={handleBulkConflictConfirm}
			/>
		</Stack>
	);
};

export default AnalyticsVariablesTable;
