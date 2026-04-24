import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Modal,
	Select,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconBraces,
	IconDatabase,
	IconFileAnalytics,
	IconX,
} from '@tabler/icons-react';
import {
	ReportValueDataType,
	ReportValueOriginType,
	type ReportValue,
} from '~/models/ReportValue';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
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
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		opened,
		reportValue,
		templateColumn,
		defaultSheet,
		filteredAvailableSheets,
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

	const selectedOrigin = form.values.originType as ReportValueOriginType | '';

	const handleOriginSelect = (value: ReportValueOriginType) => {
		form.setValues({
			originType: value,
			key: '',
			label: '',
			dataType: null,
		});
		form.clearFieldError('originType');
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
