import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	CloseButton,
	Loader,
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
	IconInfoCircle,
	IconMessages,
} from '@tabler/icons-react';
import {
	ReportValueDataType,
	ReportValueOriginType,
	type ReportValue,
} from '~/models/ReportValue';
import type { CampaignContactSchemaField } from '~/models/CampaignContactSchemaModel';
import {
	useCreateReportValue,
	useUpdateReportValue,
} from '~/queries/reportValuesQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetLatestSchemaByCampaignId } from '~/queries/campaignContactSchemasQueries';
import {
	getDataCollectionFromAgentConfig,
	type DataCollectionItem,
} from '~/modules/campaigns/CampaignsForm/AnalyticsSection/analyticsFormContext';
import { getErrorMessage } from '~/utils/httpClient';
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

// ─── Type-inference helpers ────────────────────────────────────

/** CampaignContactSchemaField.type → ReportValueDataType */
const schemaTypeToDataType = (
	type: CampaignContactSchemaField['type']
): ReportValueDataType | null => {
	switch (type) {
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
		default:
			return null;
	}
};

/** DataCollectionItem.type → ReportValueDataType */
const dcTypeToDataType = (
	type: DataCollectionItem['type']
): ReportValueDataType | null => {
	switch (type) {
		case 'string':
			return ReportValueDataType.STRING;
		case 'integer':
		case 'number':
			return ReportValueDataType.NUMBER;
		case 'boolean':
			return ReportValueDataType.BOOLEAN;
		default:
			return null;
	}
};

// ─── Origin card options ───────────────────────────────────────

const ORIGIN_OPTIONS: {
	value: ReportValueOriginType;
	icon: React.ReactNode;
	nameKey: keyof { SQL: string; DYNAMIC: string; OBJECT: string };
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
];

// ─── Contextual key field labels ───────────────────────────────

const KEY_FIELD_LABELS: Record<ReportValueOriginType, string> = {
	[ReportValueOriginType.SQL]: 'reportValues.form.keyFieldLabels.SQL',
	[ReportValueOriginType.DYNAMIC]: 'reportValues.form.keyFieldLabels.DYNAMIC',
	[ReportValueOriginType.OBJECT]: 'reportValues.form.keyFieldLabels.OBJECT',
};

// ─── Props & form types ────────────────────────────────────────

interface ReportValueFormModalProps {
	opened: boolean;
	onClose: () => void;
	campaignId: number;
	reportValue?: ReportValue;
	existingColumns?: ReportValue[];
}

interface FormValues {
	originType: ReportValueOriginType | '';
	key: string;
	label: string;
	dataType: ReportValueDataType | null;
}

// ─── Component ────────────────────────────────────────────────

const ReportValueFormModal = ({
	opened,
	onClose,
	campaignId,
	reportValue,
	existingColumns = [],
}: ReportValueFormModalProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const isEdit = !!reportValue;

	const createMutation = useCreateReportValue(campaignId);
	const updateMutation = useUpdateReportValue(campaignId);
	const isPending = createMutation.isPending || updateMutation.isPending;

	// Fetch campaign for OBJECT keys (agentConfig.dataCollection)
	const { data: campaign, isLoading: isCampaignLoading } = useGetCampaign(
		String(campaignId)
	);

	// Fetch latest dynamic schema fields by campaign ID (optional — falls back to free-text if absent)
	const { data: latestSchema, isLoading: isSchemasLoading } =
		useGetLatestSchemaByCampaignId(campaignId, opened);

	// ── Derived data ──────────────────────────────────────────

	/** Schema fields from the contact variable data schema */
	const mergedDynamicFields = useMemo<CampaignContactSchemaField[]>(
		() => latestSchema?.schemaFields ?? [],
		[latestSchema?.schemaFields]
	);

	/** Returns a Set of already-used keys for a given origin, excluding the record being edited */
	const usedKeysFor = (origin: ReportValueOriginType): Set<string> =>
		new Set(
			existingColumns
				.filter((c) => c.originType === origin && c.id !== reportValue?.id)
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mergedDynamicFields, existingColumns, reportValue?.id]);

	const objectKeyOptions = useMemo(() => {
		if (!campaign?.agentConfig) return [];
		const dc = getDataCollectionFromAgentConfig(campaign.agentConfig);
		const used = usedKeysFor(ReportValueOriginType.OBJECT);
		return Object.keys(dc)
			.filter((key) => !used.has(key))
			.map((key) => ({ value: key, label: key }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [campaign?.agentConfig, existingColumns, reportValue?.id]);

	// ── Form ─────────────────────────────────────────────────

	const form = useForm<FormValues>({
		initialValues: {
			originType: '',
			key: '',
			label: '',
			dataType: null,
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
		},
	});

	useEffect(() => {
		if (opened) {
			if (reportValue) {
				form.setValues({
					originType: reportValue.originType,
					key: reportValue.key,
					label: reportValue.label,
					dataType: reportValue.dataType,
				});
			} else {
				form.reset();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, reportValue]);

	const dataTypeOptions = [
		{
			value: ReportValueDataType.STRING,
			label: t('reportValues.dataType.STRING'),
		},
		{
			value: ReportValueDataType.NUMBER,
			label: t('reportValues.dataType.NUMBER'),
		},
		{
			value: ReportValueDataType.BOOLEAN,
			label: t('reportValues.dataType.BOOLEAN'),
		},
		{ value: ReportValueDataType.DATE, label: t('reportValues.dataType.DATE') },
		{
			value: ReportValueDataType.DATETIME,
			label: t('reportValues.dataType.DATETIME'),
		},
	];

	const sqlKeyOptions = SQL_KEYS.filter(
		(k) => !usedKeysFor(ReportValueOriginType.SQL).has(k)
	).map((k) => ({
		value: k,
		label: `${t(`reportValues.sqlKeys.${k}`)} — ${k}`,
	}));

	const selectedOrigin = form.values.originType as ReportValueOriginType | '';

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

		// Always overwrite label and dataType when a key is selected
		form.setFieldValue('label', humanizeKey(newKey));

		let inferred: ReportValueDataType | null = null;
		if (origin === ReportValueOriginType.SQL) {
			inferred = SQL_TYPE_MAP[newKey] ?? null;
		} else if (origin === ReportValueOriginType.DYNAMIC) {
			const field = mergedDynamicFields.find((f) => f.name === newKey);
			inferred = field ? schemaTypeToDataType(field.type) : null;
		} else if (origin === ReportValueOriginType.OBJECT) {
			const dc = getDataCollectionFromAgentConfig(campaign?.agentConfig ?? {});
			const item = dc[newKey] as DataCollectionItem | undefined;
			inferred = item ? dcTypeToDataType(item.type) : null;
		}
		form.setFieldValue('dataType', inferred);
	};

	/** Handler for free-text key inputs — fires on blur to batch humanize/infer */
	const handleKeyTextBlur = () => {
		const key = form.values.key;
		if (!key) return;
		form.setFieldValue('label', humanizeKey(key));
	};

	const handleSubmit = async (values: FormValues) => {
		if (!values.originType || values.dataType === null) return;

		try {
			if (isEdit && reportValue) {
				await updateMutation.mutateAsync({
					id: reportValue.id,
					dto: {
						originType: values.originType,
						key: values.key,
						label: values.label,
						dataType: values.dataType,
					},
				});
				notifications.show({
					message: t('reportValues.notifications.updated'),
					color: 'green',
				});
			} else {
				await createMutation.mutateAsync({
					originType: values.originType,
					key: values.key,
					label: values.label,
					dataType: values.dataType,
					campaignId,
				});
				notifications.show({
					message: t('reportValues.notifications.created'),
					color: 'green',
				});
			}
			onClose();
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
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
					<span className={styles.headerEyebrow}>
						{isEdit
							? t('reportValues.form.headerEyebrow.edit')
							: t('reportValues.form.headerEyebrow.new')}
					</span>
					<h2 className={styles.headerTitle}>
						{isEdit
							? t('reportValues.form.editTitle')
							: t('reportValues.form.createTitle')}
					</h2>
				</div>
				<CloseButton
					className={styles.closeBtn}
					onClick={onClose}
					size='sm'
					aria-label={t('reportValues.form.aria.close')}
				/>
			</div>

			{/* ── Form body ── */}
			<form onSubmit={form.onSubmit((v) => void handleSubmit(v))}>
				<div className={styles.body}>
					{/* Section 1: Data source */}
					<div className={styles.section}>
						<Text className={styles.sectionLabel}>
							{t('reportValues.form.sections.dataSource')}
						</Text>

						{/* Origin type card picker */}
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

					{/* Section 2: Display settings */}
					<div className={styles.section}>
						<Text className={styles.sectionLabel}>
							{t('reportValues.form.sections.displaySettings')}
						</Text>

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
