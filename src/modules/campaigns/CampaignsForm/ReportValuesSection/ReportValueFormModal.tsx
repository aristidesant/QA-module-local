import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	CloseButton,
	Loader,
	Modal,
	Select,
	NumberInput,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconBraces,
	IconDatabase,
	IconFileAnalytics,
	IconInfoCircle,
	IconMessages,
} from '@tabler/icons-react';
import {
	ReportValueDataType,
	ReportValueOriginType,
	type ReportValue,
} from '~/models/ReportValue';
import type { CampaignContactSchemaField } from '~/models/CampaignContactSchemaModel';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetLatestSchemaByCampaignId } from '~/queries/campaignContactSchemasQueries';
import {
	getDataCollectionFromAgentConfig,
	type DataCollectionItem,
} from '~/modules/campaigns/CampaignsForm/AnalyticsSection/analyticsFormContext';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	validateWorksheetName,
	validateSheetColumnUniqueness,
	isSameSheetColumn,
} from './reportValueUtils';
import styles from './ReportValueFormModal.module.css';

// ─── Utilities ────────────────────────────────────────────────

/** snake_case → "Title Case" */
const humanizeKey = (key: string): string =>
	key
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

// ─── SQL ──────────────────────────────────────────────────────

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

// ─── Type-inference helpers ────────────────────────────────────

/** CampaignContactSchemaField.type → ReportValueDataType */
const schemaTypeToDataType = (
	type: CampaignContactSchemaField['type']
): ReportValueDataType | null => {
	const normalizedType = String(type).toLowerCase();

	switch (normalizedType) {
		case 'string':
		case 'email':
		case 'phone':
		case 'address':
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

/** DataCollectionItem.type → ReportValueDataType */
const dcTypeToDataType = (
	type: DataCollectionItem['type']
): ReportValueDataType | null => {
	const normalizedType = String(type).toLowerCase();

	switch (normalizedType) {
		case 'string':
			return ReportValueDataType.STRING;
		case 'integer':
		case 'number':
			return ReportValueDataType.NUMBER;
		case 'boolean':
			return ReportValueDataType.BOOLEAN;
		case 'datetime':
		case 'timestamp':
			return ReportValueDataType.DATETIME;
		default:
			return null;
	}
};

// ─── Conversation Metadata ───────────────────────────────────

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
];

const METADATA_CONFIG_KEY = 'conversation_metadata_config';

/** ConversationMetadataField.type → ReportValueDataType */
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

// ─── Origin card options ───────────────────────────────────────

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
		value: ReportValueOriginType.OBJECT,
		icon: <IconMessages size={20} strokeWidth={1.5} />,
		nameKey: 'OBJECT',
	},
	{
		value: ReportValueOriginType.METADATA,
		icon: <IconFileAnalytics size={20} strokeWidth={1.5} />,
		nameKey: 'METADATA',
	},
];

// ─── Contextual key field labels ───────────────────────────────

const KEY_FIELD_LABELS: Partial<Record<ReportValueOriginType, string>> = {
	[ReportValueOriginType.SQL]: 'reportValues.form.keyFieldLabels.SQL',
	[ReportValueOriginType.DYNAMIC]: 'reportValues.form.keyFieldLabels.DYNAMIC',
	[ReportValueOriginType.OBJECT]: 'reportValues.form.keyFieldLabels.OBJECT',
	[ReportValueOriginType.METADATA]: 'reportValues.form.keyFieldLabels.METADATA',
};

// ─── Props & form types ────────────────────────────────────────

interface ReportValueFormModalProps {
	opened: boolean;
	onClose: () => void;
	campaignId: number;
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

// ─── Component ────────────────────────────────────────────────

const ReportValueFormModal = ({
	opened,
	onClose,
	campaignId,
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
}: ReportValueFormModalProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const isEdit = mode === 'edit' || mode === 'move';
	const isWorksheetOnly = mode === 'move';
	const sourceColumn = reportValue ?? templateColumn;

	const isPending =
		mode === 'duplicate' ? isSubmittingDuplicate : isSubmittingDraft;

	// Fetch campaign for OBJECT keys (agentConfig.dataCollection)
	const { data: campaign, isLoading: isCampaignLoading } = useGetCampaign(
		String(campaignId)
	);

	// Fetch latest dynamic schema fields by campaign ID (optional — falls back to free-text if absent)
	const { data: latestSchema, isLoading: isSchemasLoading } =
		useGetLatestSchemaByCampaignId(campaignId, opened);

	// Fetch conversation metadata config
	const { data: metadataConfig, isLoading: isMetadataLoading } =
		useGetClientConfig(METADATA_CONFIG_KEY);

	// ── Derived data ──────────────────────────────────────────

	/** Schema fields from the contact variable data schema */
	const mergedDynamicFields = useMemo<CampaignContactSchemaField[]>(
		() => latestSchema?.schemaFields ?? [],
		[latestSchema?.schemaFields]
	);

	/** Conversation metadata fields — parsed from config with fallback to defaults */
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

	// ── Form ─────────────────────────────────────────────────

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
			originType: (v) =>
				!v ? t('reportValues.form.validation.originTypeRequired') : null,
			key: (v) =>
				!v.trim() ? t('reportValues.form.validation.keyRequired') : null,
			label: (v) =>
				!v.trim() ? t('reportValues.form.validation.labelRequired') : null,
			dataType: (v) =>
				v === null ? t('reportValues.form.validation.dataTypeRequired') : null,
			sheet: (v) => {
				if (!Number.isInteger(v) || v < 1) {
					return t('reportValues.validation.sheetRequired');
				}

				return validateSheetColumnUniqueness(
					v,
					sourceColumn,
					existingColumns,
					reportValue,
					t
				);
			},
			sheetName: (v, values) =>
				validateWorksheetName(
					v,
					values.sheet,
					filteredAvailableSheets,
					reportValue,
					t
				),
		},
	});

	/** Returns used keys within the current sheet, excluding the record being edited */
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

	const dynamicKeyOptions = useMemo(() => {
		const used = usedKeysFor(ReportValueOriginType.DYNAMIC);
		return mergedDynamicFields
			.filter((f) => !used.has(f.name))
			.map((f) => ({
				value: f.name,
				label: `${f.label} (${f.name})`,
			}));
	}, [
		mergedDynamicFields,
		existingColumns,
		reportValue?.id,
		templateColumn?.id,
		form.values.sheet,
	]);

	const objectKeyOptions = useMemo(() => {
		const agentConfig =
			campaign?.agents?.find((a) => a.isPrincipal)?.agent?.config ??
			campaign?.agents?.[0]?.agent?.config;
		if (!agentConfig) return [];
		const dc = getDataCollectionFromAgentConfig(agentConfig);
		const used = usedKeysFor(ReportValueOriginType.OBJECT);
		return Object.keys(dc)
			.filter((key) => !used.has(key))
			.map((key) => ({ value: key, label: key }));
	}, [
		campaign?.agents,
		existingColumns,
		reportValue?.id,
		templateColumn?.id,
		form.values.sheet,
	]);

	const metadataKeyOptions = useMemo(() => {
		const used = usedKeysFor(ReportValueOriginType.METADATA);
		return conversationMetadataFields
			.filter((f) => !used.has(f.name))
			.map((f) => ({
				value: f.name,
				label: `${f.label} (${f.name})`,
			}));
	}, [
		conversationMetadataFields,
		existingColumns,
		reportValue?.id,
		templateColumn?.id,
		form.values.sheet,
	]);

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
		label: t(`reportValues.dataType.${dataType}`),
	}));

	const sqlKeyOptions = SQL_KEYS.filter(
		(k) => !usedKeysFor(ReportValueOriginType.SQL).has(k)
	).map((k) => ({
		value: k,
		label: `${t(`reportValues.sqlKeys.${k}`)} — ${k}`,
	}));

	const selectedOrigin = form.values.originType as ReportValueOriginType | '';
	const sheetSelectOptions = filteredAvailableSheets.map((item) => ({
		value: String(item.sheet),
		label: `${item.sheetName} (${t('reportValues.form.sheetNumber', {
			sheet: item.sheet,
		})})`,
	}));

	// ── Handlers ─────────────────────────────────────────────

	const handleOriginSelect = (value: ReportValueOriginType) => {
		form.setValues({
			originType: value,
			key: '',
			label: '',
			dataType: null,
		});
		form.clearFieldError('originType');
	};

	/**
	 * Central key-selection handler — sets key, auto-fills label (if empty),
	 * and infers data type (if empty) from field metadata.
	 */
	const handleKeySelect = (
		key: string | null,
		origin: ReportValueOriginType | '' = selectedOrigin
	) => {
		const newKey = key ?? '';
		form.setFieldValue('key', newKey);
		if (!newKey) return;

		// For conversation metadata, use the config's label directly
		if (origin === ReportValueOriginType.METADATA) {
			const field = conversationMetadataFields.find((f) => f.name === newKey);
			form.setFieldValue('label', field?.label ?? humanizeKey(newKey));
		} else {
			form.setFieldValue('label', humanizeKey(newKey));
		}

		let inferred: ReportValueDataType | null = null;
		if (origin === ReportValueOriginType.SQL) {
			inferred = SQL_TYPE_MAP[newKey] ?? null;
		} else if (origin === ReportValueOriginType.DYNAMIC) {
			const field = mergedDynamicFields.find((f) => f.name === newKey);
			inferred = field ? schemaTypeToDataType(field.type) : null;
		} else if (origin === ReportValueOriginType.OBJECT) {
			const dc = getDataCollectionFromAgentConfig(
				campaign?.agents?.find((a) => a.isPrincipal)?.agent?.config ??
					campaign?.agents?.[0]?.agent?.config ??
					{}
			);
			const item = dc[newKey] as DataCollectionItem | undefined;
			inferred = item ? dcTypeToDataType(item.type) : null;
		} else if (origin === ReportValueOriginType.METADATA) {
			const field = conversationMetadataFields.find((f) => f.name === newKey);
			inferred = field ? metadataTypeToDataType(field.type) : null;
		}
		form.setFieldValue(
			'dataType',
			normalizeSupportedDataType(inferred, ReportValueDataType.STRING)
		);
	};

	/** Handler for free-text key inputs — fires on blur to batch humanize/infer */
	const handleKeyTextBlur = () => {
		const key = form.values.key;
		if (!key) return;
		form.setFieldValue('label', humanizeKey(key));
	};

	const handleSubmit = async (values: FormValues) => {
		if (!values.originType) return;

		if (
			mode === 'move' &&
			sourceColumn &&
			values.sheet === sourceColumn.sheet
		) {
			notifications.show({
				message: t('reportValues.validation.targetSheetMustBeDifferent'),
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
				message: t(
					'reportValues.validation.duplicateTargetSheetMustBeDifferent'
				),
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

	const headerEyebrowKey =
		mode === 'move'
			? 'reportValues.form.headerEyebrow.move'
			: mode === 'duplicate'
				? 'reportValues.form.headerEyebrow.duplicate'
				: isEdit
					? 'reportValues.form.headerEyebrow.edit'
					: 'reportValues.form.headerEyebrow.new';

	const headerTitleKey =
		mode === 'move'
			? 'reportValues.form.moveTitle'
			: mode === 'duplicate'
				? 'reportValues.form.duplicateTitle'
				: isEdit
					? 'reportValues.form.editTitle'
					: 'reportValues.form.createTitle';

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

	const handleSheetNumberChange = (value: string | number) => {
		const nextSheet = Number(value);
		if (!Number.isInteger(nextSheet) || nextSheet < 1) {
			form.setFieldValue('sheet', 1);
			return;
		}

		form.setFieldValue('sheet', nextSheet);
		const selectedSheet = filteredAvailableSheets.find(
			(item) => item.sheet === nextSheet
		);
		if (selectedSheet) {
			form.setFieldValue('sheetName', selectedSheet.sheetName);
		}
	};

	// ── Key field renderer ────────────────────────────────────

	const renderKeyField = () => {
		/** Contextual label — changes with selected origin */
		const label =
			selectedOrigin && KEY_FIELD_LABELS[selectedOrigin]
				? t(KEY_FIELD_LABELS[selectedOrigin])
				: t('reportValues.form.keyLabel');

		const { error } = form.getInputProps('key');

		if (selectedOrigin === ReportValueOriginType.SQL) {
			return (
				<Select
					label={label}
					data={sqlKeyOptions}
					required
					size='sm'
					value={form.values.key || null}
					onChange={(v) => handleKeySelect(v, ReportValueOriginType.SQL)}
					error={error}
				/>
			);
		}

		if (selectedOrigin === ReportValueOriginType.DYNAMIC) {
			const isDynamicLoading = isSchemasLoading;
			if (isDynamicLoading) {
				return (
					<TextInput
						label={label}
						disabled
						size='sm'
						rightSection={<Loader size={14} />}
						placeholder={t(
							'reportValues.form.placeholders.loadingSchemaFields'
						)}
					/>
				);
			}
			if (dynamicKeyOptions.length > 0) {
				return (
					<Select
						label={label}
						data={dynamicKeyOptions}
						required
						size='sm'
						searchable
						placeholder={t('reportValues.form.placeholders.selectSchemaField')}
						value={form.values.key || null}
						onChange={(v) => handleKeySelect(v, ReportValueOriginType.DYNAMIC)}
						error={error}
					/>
				);
			}
			return (
				<>
					<div className={styles.emptyState}>
						<IconInfoCircle size={13} className={styles.emptyStateIcon} />
						<span>{t('reportValues.form.emptyState.noSchemaFields')}</span>
					</div>
					<TextInput
						label={label}
						placeholder={t('reportValues.form.keyPlaceholderDynamic')}
						required
						size='sm'
						classNames={{ input: styles.keyInput }}
						{...form.getInputProps('key')}
						onBlur={handleKeyTextBlur}
					/>
				</>
			);
		}

		if (selectedOrigin === ReportValueOriginType.OBJECT) {
			if (isCampaignLoading) {
				return (
					<TextInput
						label={label}
						disabled
						size='sm'
						rightSection={<Loader size={14} />}
						placeholder={t(
							'reportValues.form.placeholders.loadingConversationFields'
						)}
					/>
				);
			}
			if (objectKeyOptions.length > 0) {
				return (
					<Select
						label={label}
						data={objectKeyOptions}
						required
						size='sm'
						searchable
						placeholder={t(
							'reportValues.form.placeholders.selectConversationField'
						)}
						value={form.values.key || null}
						onChange={(v) => handleKeySelect(v, ReportValueOriginType.OBJECT)}
						error={error}
					/>
				);
			}
			return (
				<>
					<div className={styles.emptyState}>
						<IconInfoCircle size={13} className={styles.emptyStateIcon} />
						<span>
							{t('reportValues.form.emptyState.noDataCollectionFields')}
						</span>
					</div>
					<TextInput
						label={label}
						placeholder={t('reportValues.form.keyPlaceholderObject')}
						required
						size='sm'
						classNames={{ input: styles.keyInput }}
						{...form.getInputProps('key')}
						onBlur={handleKeyTextBlur}
					/>
				</>
			);
		}

		if (selectedOrigin === ReportValueOriginType.METADATA) {
			if (isMetadataLoading) {
				return (
					<TextInput
						label={label}
						disabled
						size='sm'
						rightSection={<Loader size={14} />}
						placeholder={t(
							'reportValues.form.placeholders.loadingMetadataFields'
						)}
					/>
				);
			}
			if (metadataKeyOptions.length > 0) {
				return (
					<Select
						label={label}
						data={metadataKeyOptions}
						required
						size='sm'
						searchable
						placeholder={t(
							'reportValues.form.placeholders.selectMetadataField'
						)}
						value={form.values.key || null}
						onChange={(v) => handleKeySelect(v, ReportValueOriginType.METADATA)}
						error={error}
					/>
				);
			}
			return (
				<>
					<div className={styles.emptyState}>
						<IconInfoCircle size={13} className={styles.emptyStateIcon} />
						<span>{t('reportValues.form.emptyState.noMetadataFields')}</span>
					</div>
					<TextInput
						label={label}
						placeholder={t('reportValues.form.keyPlaceholderMetadata')}
						required
						size='sm'
						classNames={{ input: styles.keyInput }}
						{...form.getInputProps('key')}
						onBlur={handleKeyTextBlur}
					/>
				</>
			);
		}

		// No origin selected yet
		return (
			<TextInput
				label={t('reportValues.form.keyLabel')}
				disabled
				size='sm'
				placeholder={t('reportValues.form.placeholders.selectSourceFirst')}
			/>
		);
	};

	// ── Render ────────────────────────────────────────────────

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			size='lg'
			padding={0}
			withCloseButton={false}
			classNames={{ content: styles.modalContent }}
		>
			{/* ── Custom header ── */}
			<div className={styles.header}>
				<div className={styles.headerMeta}>
					<span className={styles.headerEyebrow}>{t(headerEyebrowKey)}</span>
					<h2 className={styles.headerTitle}>{t(headerTitleKey)}</h2>
				</div>
				<CloseButton
					className={styles.closeBtn}
					onClick={onClose}
					size='sm'
					aria-label={t('reportValues.form.aria.close')}
				/>
			</div>

			{/* ── Form body ── */}
			<form onSubmit={form.onSubmit((v: FormValues) => void handleSubmit(v))}>
				<div className={styles.body}>
					{/* Section 1: Data source */}
					{!isWorksheetOnly ? (
						<>
							<div className={styles.section}>
								<Text className={styles.sectionLabel}>
									{t('reportValues.form.sections.dataSource')}
								</Text>

								<div className={styles.originCards}>
									{ORIGIN_OPTIONS.map((opt) => (
										<button
											key={opt.value}
											type='button'
											className={styles.originCard}
											data-selected={
												selectedOrigin === opt.value ? 'true' : undefined
											}
											onClick={() => handleOriginSelect(opt.value)}
										>
											<span className={styles.originCardIcon}>{opt.icon}</span>
											<span className={styles.originCardLabel}>
												{t(`reportValues.originType.${opt.nameKey}`)}
											</span>
											<span className={styles.originCardSub}>
												{t(`reportValues.form.originSub.${opt.nameKey}`)}
											</span>
										</button>
									))}
								</div>

								{form.errors.originType && (
									<Text className={styles.originCardsError}>
										{form.errors.originType}
									</Text>
								)}

								{renderKeyField()}
							</div>

							<div className={styles.sectionDivider} />
						</>
					) : null}

					{/* Section 2: Display settings */}
					<div className={styles.section}>
						<Text className={styles.sectionLabel}>
							{t(
								isWorksheetOnly
									? 'reportValues.form.sections.worksheet'
									: 'reportValues.form.sections.displaySettings'
							)}
						</Text>

						<div className={styles.fieldRow}>
							<Select
								label={t('reportValues.form.sheetSelectLabel')}
								data={sheetSelectOptions}
								size='sm'
								value={
									filteredAvailableSheets.some(
										(item) => item.sheet === form.values.sheet
									)
										? String(form.values.sheet)
										: null
								}
								onChange={handleSheetSelect}
								placeholder={t('reportValues.form.sheetSelectPlaceholder')}
								clearable={false}
							/>

							<NumberInput
								label={t('reportValues.form.sheetNumberLabel')}
								size='sm'
								min={1}
								allowDecimal={false}
								allowNegative={false}
								value={form.values.sheet}
								onChange={handleSheetNumberChange}
								error={form.errors.sheet}
							/>
						</div>

						<TextInput
							label={t('reportValues.form.sheetNameLabel')}
							placeholder={t('reportValues.form.sheetNamePlaceholder')}
							required
							size='sm'
							{...form.getInputProps('sheetName')}
						/>

						{!isWorksheetOnly ? (
							<>
								<TextInput
									label={t('reportValues.form.labelLabel')}
									placeholder={t('reportValues.form.labelPlaceholder')}
									required
									size='sm'
									{...form.getInputProps('label')}
								/>

								<Select
									label={t('reportValues.form.dataTypeLabel')}
									data={dataTypeOptions}
									required
									size='sm'
									{...form.getInputProps('dataType')}
								/>
							</>
						) : (
							<div className={styles.summaryFieldBlock}>
								<Text size='sm' fw={600}>
									{sourceColumn?.label ?? form.values.label}
								</Text>
								<Text size='xs' c='dimmed' ff='monospace'>
									{sourceColumn?.key ?? form.values.key}
								</Text>
							</div>
						)}
					</div>

					{/* ── Footer ── */}
					<div className={styles.footer}>
						<Button
							variant='default'
							size='sm'
							onClick={onClose}
							disabled={isPending}
						>
							{t('reportValues.form.cancel')}
						</Button>
						<Button
							type='submit'
							size='sm'
							loading={isPending}
							className={styles.saveBtn}
						>
							{t('reportValues.form.save')}
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default ReportValueFormModal;
