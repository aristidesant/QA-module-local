import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Alert,
	ActionIcon,
	Button,
	Center,
	Loader,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconBraces,
	IconCategory,
	IconDatabase,
	IconFileAnalytics,
	IconRefresh,
	IconX,
} from '@tabler/icons-react';
import {
	ReportValueDataType,
	ReportValueOriginType,
	type ReportValue,
} from '~/models/ReportValue';
import type { DataCollectionTemplateGroup } from '~/models/DataCollectionTemplateModel';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import {
	useGetCustomVariableTemplates,
	useGetTemplateVariables,
} from '~/queries/dataCollectionTemplateGroupsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	validateSheetColumnUniqueness,
	isSameSheetColumn,
} from './reportTemplateUtils';
import styles from './ReportTemplateColumnFormModal.module.css';

const humanizeKey = (key: string): string =>
	key
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

const SQL_KEYS = [
	'first_name',
	'last_name',
	'identifier',
	'identifier_type',
	'birth_date',
	'address',
	'phone_number',
] as const;

const SQL_TYPE_MAP: Record<string, ReportValueDataType> = {
	first_name: ReportValueDataType.STRING,
	last_name: ReportValueDataType.STRING,
	identifier: ReportValueDataType.STRING,
	identifier_type: ReportValueDataType.STRING,
	birth_date: ReportValueDataType.DATE,
	address: ReportValueDataType.STRING,
	phone_number: ReportValueDataType.STRING,
};

const SUPPORTED_DATA_TYPES: ReportValueDataType[] = [
	ReportValueDataType.STRING,
	ReportValueDataType.NUMBER,
	ReportValueDataType.BOOLEAN,
	ReportValueDataType.DATE,
	ReportValueDataType.DATETIME,
];

const SUPPORTED_DATA_TYPE_SET = new Set<ReportValueDataType>(
	SUPPORTED_DATA_TYPES
);

const CUSTOM_VARIABLE_TYPE_TO_DATA_TYPE: Record<
	string,
	ReportValueDataType | null
> = {
	string: ReportValueDataType.STRING,
	integer: ReportValueDataType.NUMBER,
	number: ReportValueDataType.NUMBER,
	boolean: ReportValueDataType.BOOLEAN,
	date: ReportValueDataType.DATE,
	datetime: ReportValueDataType.DATETIME,
	timestamp: ReportValueDataType.DATETIME,
};

const normalizeSupportedDataType = (
	dataType: ReportValueDataType | string | null | undefined,
	fallback: ReportValueDataType | null = ReportValueDataType.STRING
): ReportValueDataType | null => {
	if (
		typeof dataType === 'string' &&
		SUPPORTED_DATA_TYPE_SET.has(dataType as ReportValueDataType)
	) {
		return dataType as ReportValueDataType;
	}

	return fallback;
};

interface ConversationMetadataField {
	label: string;
	name: string;
	type: string;
}

const DEFAULT_METADATA_FIELDS: ConversationMetadataField[] = [
	{ label: 'Duration', name: 'duration', type: 'number' },
	{ label: 'Start Date', name: 'start_date', type: 'string' },
	{ label: 'End Date', name: 'end_date', type: 'string' },
	{ label: 'Outcome', name: 'outcome', type: 'string' },
	{ label: 'Cost', name: 'cost', type: 'number' },
];

const METADATA_CONFIG_KEY = 'conversation_metadata_config';

const metadataTypeToDataType = (type: string): ReportValueDataType | null => {
	const normalizedType = String(type).toLowerCase();

	switch (normalizedType) {
		case 'string':
			return ReportValueDataType.STRING;
		case 'number':
			return ReportValueDataType.NUMBER;
		case 'boolean':
			return ReportValueDataType.BOOLEAN;
		case 'date':
			return ReportValueDataType.DATE;
		case 'datetime':
		case 'timestamp':
			return ReportValueDataType.DATETIME;
		default:
			return null;
	}
};

const customVariableTypeToDataType = (
	type: string | null | undefined
): ReportValueDataType | null => {
	if (!type) {
		return null;
	}

	const normalizedType = String(type).toLowerCase();
	return CUSTOM_VARIABLE_TYPE_TO_DATA_TYPE[normalizedType] ?? null;
};

const ORIGIN_OPTIONS: {
	value: ReportValueOriginType;
	icon: React.ReactNode;
	nameKey: string;
}[] = [
	{
		value: ReportValueOriginType.SQL,
		icon: <IconDatabase size={20} strokeWidth={1.5} />,
		nameKey: 'SQL',
	},
	{
		value: ReportValueOriginType.DYNAMIC,
		icon: <IconBraces size={20} strokeWidth={1.5} />,
		nameKey: 'DYNAMIC',
	},
	{
		value: ReportValueOriginType.METADATA,
		icon: <IconFileAnalytics size={20} strokeWidth={1.5} />,
		nameKey: 'METADATA',
	},
	{
		value: ReportValueOriginType.OBJECT,
		icon: <IconCategory size={20} strokeWidth={1.5} />,
		nameKey: 'OBJECT',
	},
];

interface ReportTemplateColumnFormModalProps {
	opened: boolean;
	onClose: () => void;
	templateId: number;
	reportValue?: ReportValue;
	templateColumn?: ReportValue;
	mode?: 'create' | 'edit' | 'move' | 'duplicate';
	existingColumns?: ReportValue[];
	availableSheets?: Array<{
		sheet: number;
		sheetName: string;
	}>;
	defaultSheet?: {
		sheet: number;
		sheetName: string;
	};
	onSubmitDraft: (
		values: FormValues,
		reportValue?: ReportValue
	) => Promise<void> | void;
	onSubmitDuplicate?: (
		values: FormValues,
		sourceReportValue: ReportValue
	) => Promise<void> | void;
	isSubmittingDraft?: boolean;
	isSubmittingDuplicate?: boolean;
}

export interface FormValues {
	originType: ReportValueOriginType | '';
	key: string;
	label: string;
	dataType: ReportValueDataType | null;
	sheet: number;
	sheetName: string;
}

const ReportTemplateColumnFormModal = ({
	opened,
	onClose,
	reportValue,
	templateColumn,
	mode = 'create',
	existingColumns = [],
	availableSheets = [],
	defaultSheet,
	onSubmitDraft,
	onSubmitDuplicate,
	isSubmittingDraft = false,
	isSubmittingDuplicate = false,
}: ReportTemplateColumnFormModalProps) => {
	const { t } = useTranslation('report-templates');
	const isEdit = mode === 'edit' || mode === 'move';
	const isWorksheetOnly = mode === 'move';
	const sourceColumn = reportValue ?? templateColumn;

	const isPending =
		mode === 'duplicate' ? isSubmittingDuplicate : isSubmittingDraft;

	const { data: metadataConfig } = useGetClientConfig(METADATA_CONFIG_KEY);

	const conversationMetadataFields = useMemo<
		ConversationMetadataField[]
	>(() => {
		if (!metadataConfig?.value) return DEFAULT_METADATA_FIELDS;
		try {
			const parsed = JSON.parse(
				metadataConfig.value
			) as ConversationMetadataField[];
			return Array.isArray(parsed) && parsed.length > 0
				? parsed
				: DEFAULT_METADATA_FIELDS;
		} catch {
			return DEFAULT_METADATA_FIELDS;
		}
	}, [metadataConfig]);

	const filteredAvailableSheets = useMemo(() => {
		if (!sourceColumn || (mode !== 'move' && mode !== 'duplicate')) {
			return availableSheets;
		}

		return availableSheets.filter((sheetOption) => {
			if (sheetOption.sheet === sourceColumn.sheet) {
				return false;
			}

			return !existingColumns.some(
				(item) =>
					item.sheet === sheetOption.sheet &&
					isSameSheetColumn(item, sourceColumn)
			);
		});
	}, [availableSheets, existingColumns, mode, sourceColumn]);

	const form = useForm<FormValues>({
		initialValues: {
			originType: '',
			key: '',
			label: '',
			dataType: null,
			sheet: defaultSheet?.sheet ?? 1,
			sheetName: defaultSheet?.sheetName ?? 'Report 1',
		},
		validate: {
			originType: (v) => (!v ? t('form.validation.originTypeRequired') : null),
			key: (v) => (!v.trim() ? t('form.validation.keyRequired') : null),
			label: (v) => (!v.trim() ? t('form.validation.labelRequired') : null),
			dataType: (v) =>
				v === null ? t('form.validation.dataTypeRequired') : null,
			sheet: (v) => {
				if (!Number.isInteger(v) || v < 1) {
					return t('validation.sheetRequired');
				}

				return validateSheetColumnUniqueness(
					v,
					sourceColumn,
					existingColumns,
					reportValue,
					t
				);
			},
		},
	});

	const selectedOrigin = form.values.originType as ReportValueOriginType | '';
	const [
		selectedCustomVariableTemplateId,
		setSelectedCustomVariableTemplateId,
	] = useState<number | null>(null);
	const {
		data: customVariableTemplatesResponse,
		isLoading: isLoadingTemplates,
		isError: isTemplatesError,
		error: templatesError,
		refetch: refetchTemplates,
	} = useGetCustomVariableTemplates({ limit: 200, offset: 0 });

	const usedKeysFor = (origin: ReportValueOriginType): Set<string> =>
		new Set(
			existingColumns
				.filter(
					(c) =>
						c.sheet === form.values.sheet &&
						c.originType === origin &&
						c.id !== reportValue?.id &&
						c.id !== templateColumn?.id
				)
				.map((c) => c.key)
		);

	const customVariableTemplates =
		customVariableTemplatesResponse?.templates ?? [];
	const customVariableTemplateOptions = useMemo(
		() =>
			customVariableTemplates.map((template) => ({
				value: String(template.id),
				label: `${template.name} (#${template.id})`,
			})),
		[customVariableTemplates]
	);

	const selectedCustomVariableTemplate =
		useMemo<DataCollectionTemplateGroup | null>(() => {
			if (selectedOrigin !== ReportValueOriginType.OBJECT) {
				return null;
			}

			if (selectedCustomVariableTemplateId !== null) {
				return (
					customVariableTemplates.find(
						(template) => template.id === selectedCustomVariableTemplateId
					) ?? null
				);
			}

			if (!form.values.key) {
				return null;
			}

			return (
				customVariableTemplates.find((template) =>
					template.customVariables?.some(
						(variable) => variable.name === form.values.key
					)
				) ?? null
			);
		}, [
			customVariableTemplates,
			form.values.key,
			selectedCustomVariableTemplateId,
			selectedOrigin,
		]);
	const activeCustomVariableTemplateId =
		selectedCustomVariableTemplateId ??
		selectedCustomVariableTemplate?.id ??
		null;

	const shouldLoadTemplateVariables =
		opened &&
		selectedOrigin === ReportValueOriginType.OBJECT &&
		(activeCustomVariableTemplateId !== null ||
			selectedCustomVariableTemplate !== null);
	const {
		data: customVariables = [],
		isLoading: isLoadingCustomVariables,
		isError: isCustomVariablesError,
		error: customVariablesError,
		refetch: refetchCustomVariables,
	} = useGetTemplateVariables(
		activeCustomVariableTemplateId ?? 0,
		shouldLoadTemplateVariables
	);

	useEffect(() => {
		if (opened) {
			if (reportValue) {
				form.setValues({
					originType: reportValue.originType,
					key: reportValue.key,
					label: reportValue.label,
					dataType: normalizeSupportedDataType(reportValue.dataType),
					sheet: reportValue.sheet,
					sheetName: reportValue.sheetName,
				});
			} else if (templateColumn) {
				form.setValues({
					originType: templateColumn.originType,
					key: templateColumn.key,
					label: templateColumn.label,
					dataType: normalizeSupportedDataType(templateColumn.dataType),
					sheet: defaultSheet?.sheet ?? templateColumn.sheet,
					sheetName:
						defaultSheet?.sheetName ?? templateColumn.sheetName ?? 'Report 1',
				});
			} else {
				form.setValues({
					originType: '',
					key: '',
					label: '',
					dataType: null,
					sheet: defaultSheet?.sheet ?? filteredAvailableSheets[0]?.sheet ?? 1,
					sheetName:
						defaultSheet?.sheetName ??
						filteredAvailableSheets[0]?.sheetName ??
						'Report 1',
				});
				form.resetDirty();
			}
			return;
		}
		setSelectedCustomVariableTemplateId(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		opened,
		reportValue,
		templateColumn,
		defaultSheet,
		filteredAvailableSheets,
	]);

	useEffect(() => {
		if (
			opened &&
			selectedOrigin === ReportValueOriginType.OBJECT &&
			selectedCustomVariableTemplateId === null &&
			selectedCustomVariableTemplate
		) {
			setSelectedCustomVariableTemplateId(selectedCustomVariableTemplate.id);
		}
	}, [
		opened,
		selectedCustomVariableTemplate,
		selectedCustomVariableTemplateId,
		selectedOrigin,
	]);

	const dataTypeOptions = SUPPORTED_DATA_TYPES.map((dataType) => ({
		value: dataType,
		label: t(`dataType.${dataType}`),
	}));

	const sqlKeyOptions = SQL_KEYS.filter(
		(k) => !usedKeysFor(ReportValueOriginType.SQL).has(k)
	).map((k) => ({
		value: k,
		label: `${humanizeKey(k)} — ${k}`,
	}));

	const handleOriginSelect = (value: ReportValueOriginType) => {
		form.setValues({
			originType: value,
			key: '',
			label: '',
			dataType: null,
		});
		setSelectedCustomVariableTemplateId(null);
		form.clearFieldError('originType');
	};

	const handleCustomVariableTemplateSelect = (value: string | null) => {
		setSelectedCustomVariableTemplateId(value ? Number(value) : null);
		form.setValues({
			key: '',
			label: '',
			dataType: null,
		});
		form.clearFieldError('key');
		form.clearFieldError('label');
		form.clearFieldError('dataType');
	};

	const handleCustomVariableSelect = (value: string | null) => {
		const nextKey = value ?? '';
		const variable = customVariables.find((item) => item.name === nextKey);

		form.setFieldValue('key', nextKey);

		if (!variable) {
			return;
		}

		form.setFieldValue('label', variable.label || humanizeKey(variable.name));
		form.setFieldValue(
			'dataType',
			customVariableTypeToDataType(variable.value.type)
		);
		form.clearFieldError('key');
		form.clearFieldError('label');
		form.clearFieldError('dataType');
	};

	const handleKeySelect = (
		key: string | null,
		origin: ReportValueOriginType | '' = selectedOrigin
	) => {
		const newKey = key ?? '';
		form.setFieldValue('key', newKey);
		if (!newKey) return;

		if (origin === ReportValueOriginType.METADATA) {
			const field = conversationMetadataFields.find((f) => f.name === newKey);
			form.setFieldValue('label', field?.label ?? humanizeKey(newKey));
		} else {
			form.setFieldValue('label', humanizeKey(newKey));
		}

		let inferred: ReportValueDataType | null = null;
		if (origin === ReportValueOriginType.SQL) {
			inferred = SQL_TYPE_MAP[newKey] ?? null;
		} else if (origin === ReportValueOriginType.METADATA) {
			const field = conversationMetadataFields.find((f) => f.name === newKey);
			inferred = field ? metadataTypeToDataType(field.type) : null;
		}
		form.setFieldValue(
			'dataType',
			normalizeSupportedDataType(inferred, ReportValueDataType.STRING)
		);
	};

	const handleKeyBlur = () => {
		handleKeySelect(form.values.key);
	};

	const handleSubmit = async (values: FormValues) => {
		if (!values.originType) return;

		if (
			mode === 'move' &&
			sourceColumn &&
			values.sheet === sourceColumn.sheet
		) {
			notifications.show({
				message: t('validation.targetSheetMustBeDifferent'),
				color: 'red',
			});
			return;
		}

		if (
			mode === 'duplicate' &&
			sourceColumn &&
			values.sheet === sourceColumn.sheet
		) {
			notifications.show({
				message: t('validation.duplicateTargetSheetMustBeDifferent'),
				color: 'red',
			});
			return;
		}

		const normalizedDataType = normalizeSupportedDataType(
			values.dataType,
			ReportValueDataType.STRING
		);

		if (!normalizedDataType) return;

		const uniquenessError = validateSheetColumnUniqueness(
			values.sheet,
			sourceColumn,
			existingColumns,
			reportValue,
			t
		);
		if (uniquenessError) {
			notifications.show({
				message: uniquenessError,
				color: 'red',
			});
			return;
		}

		try {
			const payload = {
				...values,
				dataType: normalizedDataType,
				sheetName: values.sheetName.trim(),
			};

			if (mode === 'duplicate' && sourceColumn && onSubmitDuplicate) {
				await onSubmitDuplicate(payload, sourceColumn);
			} else {
				await onSubmitDraft(payload, reportValue);
			}
			onClose();
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const headerTitleKey =
		mode === 'move'
			? 'form.moveTitle'
			: mode === 'duplicate'
				? 'form.duplicateTitle'
				: isEdit
					? 'form.editTitle'
					: 'form.createTitle';

	const handleSheetSelect = (value: string | null) => {
		const nextSheet = Number(value);
		if (!Number.isInteger(nextSheet) || nextSheet < 1) {
			return;
		}

		const selectedSheet = filteredAvailableSheets.find(
			(item) => item.sheet === nextSheet
		);
		form.setFieldValue('sheet', nextSheet);
		if (selectedSheet) {
			form.setFieldValue('sheetName', selectedSheet.sheetName);
		}
	};

	const renderKeyField = () => {
		if (selectedOrigin === ReportValueOriginType.SQL) {
			return (
				<Select
					label={t('form.keyFieldLabels.SQL')}
					data={sqlKeyOptions}
					value={form.values.key || null}
					onChange={(value) => handleKeySelect(value)}
					error={form.errors.key}
					disabled={isWorksheetOnly}
				/>
			);
		}

		if (selectedOrigin === ReportValueOriginType.OBJECT) {
			return (
				<Stack gap='xs'>
					<Select
						label={t('form.customVariables.templateLabel')}
						placeholder={t('form.customVariables.templatePlaceholder')}
						data={customVariableTemplateOptions}
						value={activeCustomVariableTemplateId?.toString() ?? null}
						onChange={handleCustomVariableTemplateSelect}
						error={isTemplatesError ? getErrorMessage(templatesError) : null}
						disabled={isWorksheetOnly || isLoadingTemplates || isTemplatesError}
						searchable
						allowDeselect={false}
						nothingFoundMessage={t('form.customVariables.noTemplates')}
					/>

					{isLoadingTemplates ? (
						<Center py='xs'>
							<Stack gap={4} align='center'>
								<Loader size='sm' />
								<Text size='xs' c='dimmed'>
									{t('form.customVariables.loadingTemplates')}
								</Text>
							</Stack>
						</Center>
					) : isTemplatesError ? (
						<Alert
							variant='light'
							color='red'
							icon={<IconAlertCircle size={16} />}
						>
							<Stack gap={6}>
								<Text size='sm'>
									{getErrorMessage(templatesError) ||
										t('form.customVariables.templateLoadError')}
								</Text>
								<Button
									size='xs'
									variant='light'
									leftSection={<IconRefresh size={14} />}
									onClick={() => void refetchTemplates()}
								>
									{t('form.customVariables.retry')}
								</Button>
							</Stack>
						</Alert>
					) : activeCustomVariableTemplateId ? (
						isLoadingCustomVariables ? (
							<Center py='xs'>
								<Stack gap={4} align='center'>
									<Loader size='sm' />
									<Text size='xs' c='dimmed'>
										{t('form.customVariables.loadingVariables')}
									</Text>
								</Stack>
							</Center>
						) : isCustomVariablesError ? (
							<Alert
								variant='light'
								color='red'
								icon={<IconAlertCircle size={16} />}
							>
								<Stack gap={6}>
									<Text size='sm'>
										{getErrorMessage(customVariablesError) ||
											t('form.customVariables.loadError')}
									</Text>
									<Button
										size='xs'
										variant='light'
										leftSection={<IconRefresh size={14} />}
										onClick={() => void refetchCustomVariables()}
									>
										{t('form.customVariables.retry')}
									</Button>
								</Stack>
							</Alert>
						) : customVariables.length === 0 ? (
							<Alert
								variant='light'
								color='gray'
								icon={<IconAlertCircle size={16} />}
							>
								<Text size='sm'>{t('form.customVariables.emptyTemplate')}</Text>
							</Alert>
						) : (
							<Select
								label={t('form.customVariables.variableLabel')}
								placeholder={t('form.customVariables.variablePlaceholder')}
								data={customVariables.map((variable) => ({
									value: variable.name,
									label: variable.label
										? `${variable.label} (${variable.name})`
										: humanizeKey(variable.name),
								}))}
								value={form.values.key || null}
								onChange={handleCustomVariableSelect}
								error={form.errors.key}
								disabled={isWorksheetOnly}
								searchable
								allowDeselect={false}
								nothingFoundMessage={t('form.customVariables.noVariablesMatch')}
							/>
						)
					) : (
						<Text size='xs' c='dimmed'>
							{t('form.customVariables.templateHint')}
						</Text>
					)}
				</Stack>
			);
		}

		if (selectedOrigin === ReportValueOriginType.METADATA) {
			const metadataKeyOptions = conversationMetadataFields
				.filter((f) => !usedKeysFor(ReportValueOriginType.METADATA).has(f.name))
				.map((f) => ({
					value: f.name,
					label: `${f.label} (${f.name})`,
				}));

			return (
				<Select
					label={t('form.keyFieldLabels.METADATA')}
					data={metadataKeyOptions}
					value={form.values.key || null}
					onChange={(value) => handleKeySelect(value)}
					error={form.errors.key}
					disabled={isWorksheetOnly}
				/>
			);
		}

		return (
			<TextInput
				label={t('form.keyFieldLabels.default')}
				value={form.values.key}
				onChange={(event) =>
					form.setFieldValue('key', event.currentTarget.value)
				}
				onBlur={handleKeyBlur}
				error={form.errors.key}
				disabled={isWorksheetOnly}
				classNames={{ input: styles.keyInput }}
			/>
		);
	};

	return (
		<Modal.Root
			opened={opened}
			onClose={onClose}
			size='md'
			closeOnClickOutside={false}
		>
			<Modal.Overlay />
			<Modal.Content className={styles.modalContent}>
				{/* Custom header */}
				<div className={styles.header}>
					<div className={styles.headerMeta}>
						{selectedOrigin && (
							<span className={styles.headerEyebrow}>
								{t(`originType.${selectedOrigin}`)}
							</span>
						)}
						<h2 className={styles.headerTitle}>{t(headerTitleKey)}</h2>
					</div>
					<ActionIcon
						className={styles.closeBtn}
						variant='subtle'
						color='gray'
						size='sm'
						onClick={onClose}
						aria-label='Close'
					>
						<IconX size={14} />
					</ActionIcon>
				</div>

				<Modal.Body className={styles.body}>
					<form onSubmit={form.onSubmit(handleSubmit)}>
						{/* Origin type section */}
						{!isWorksheetOnly && (
							<div className={styles.section}>
								<span className={styles.sectionLabel}>
									{t('form.originType')}
								</span>

								{isEdit ? (
									<div className={styles.summaryFieldBlock}>
										<Text size='xs' c='dimmed'>
											{t('form.originType')}
										</Text>
										<Text size='sm' fw={500}>
											{t(`originType.${form.values.originType}`)}
										</Text>
									</div>
								) : (
									<>
										<div className={styles.originCards}>
											{ORIGIN_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type='button'
													className={styles.originCard}
													data-selected={
														form.values.originType === opt.value
															? 'true'
															: undefined
													}
													onClick={() => handleOriginSelect(opt.value)}
												>
													<span className={styles.originCardIcon}>
														{opt.icon}
													</span>
													<span className={styles.originCardLabel}>
														{t(`originType.${opt.value}`)}
													</span>
												</button>
											))}
										</div>
										{form.errors.originType && (
											<span className={styles.originCardsError}>
												{form.errors.originType}
											</span>
										)}
									</>
								)}
							</div>
						)}

						{/* Field configuration section — only if origin is selected */}
						{!isWorksheetOnly && selectedOrigin && (
							<>
								<div className={styles.sectionDivider} />
								<div className={styles.section}>
									{renderKeyField()}
									<div className={styles.fieldRow}>
										<TextInput
											label={t('form.label')}
											value={form.values.label}
											onChange={(event) =>
												form.setFieldValue('label', event.currentTarget.value)
											}
											error={form.errors.label}
											disabled={isWorksheetOnly}
										/>
										<Select
											label={t('form.dataType')}
											data={dataTypeOptions}
											value={form.values.dataType}
											onChange={(value) =>
												form.setFieldValue(
													'dataType',
													value as ReportValueDataType | null
												)
											}
											error={form.errors.dataType}
											disabled={isWorksheetOnly}
											allowDeselect={false}
										/>
									</div>
								</div>
							</>
						)}

						{/* Sheet section */}
						<div className={styles.sectionDivider} />
						<div className={styles.section}>
							<span className={styles.sectionLabel}>{t('form.sheet')}</span>
							<Select
								label={t('form.sheet')}
								data={filteredAvailableSheets.map((item) => ({
									value: String(item.sheet),
									label: `${item.sheetName} (${t('form.sheetNumber', {
										sheet: item.sheet,
									})})`,
								}))}
								value={String(form.values.sheet)}
								onChange={handleSheetSelect}
								error={form.errors.sheet}
								allowDeselect={false}
							/>
						</div>

						{/* Footer */}
						<div className={styles.footer}>
							<Button
								variant='default'
								size='sm'
								onClick={onClose}
								disabled={isPending}
							>
								{t('actions.cancel')}
							</Button>
							<Button
								type='submit'
								size='sm'
								className={styles.saveBtn}
								loading={isPending}
							>
								{t(mode === 'duplicate' ? 'actions.duplicate' : 'actions.save')}
							</Button>
						</div>
					</form>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
};

export default ReportTemplateColumnFormModal;
