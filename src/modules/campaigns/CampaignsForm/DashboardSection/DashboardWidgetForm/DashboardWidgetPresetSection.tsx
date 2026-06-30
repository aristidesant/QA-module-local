import {
	Alert,
	MultiSelect,
	Select,
	SegmentedControl,
	Stack,
	Switch,
	TagsInput,
	Text,
	TextInput,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDispositionFlowsByCampaignPath } from '../../../../../queries/dispositionFlowQueries';
import {
	PRESET_FIELDS_BY_SOURCE,
	PRESET_VALUES_BY_FIELD,
} from './DashboardWidgetForm.helpers';
import styles from './DashboardWidgetForm.module.css';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';

const ALIAS_OPTIONS = ['CONTACTABILITY_RATE'] as const;

type DispositionOption = { value: string; label: string };

function flattenDispositionTree(
	nodes: {
		name: string;
		children?: { name: string; children?: unknown[] }[];
	}[],
	parentLabel?: string
): DispositionOption[] {
	const result: DispositionOption[] = [];
	for (const node of nodes) {
		const label = parentLabel ? `${parentLabel} / ${node.name}` : node.name;
		result.push({ value: node.name, label });
		if (node.children?.length) {
			result.push(
				...flattenDispositionTree(
					node.children as {
						name: string;
						children?: { name: string; children?: unknown[] }[];
					}[],
					label
				)
			);
		}
	}
	return result;
}

const DashboardWidgetPresetSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards']);
	const state = useDashboardWidgetFormState();
	const { values, handlers } = state;

	const isDispositionNameField = values.presetField === 'dispositionName';
	const { data: dispositionFlow } = useDispositionFlowsByCampaignPath(
		isDispositionNameField && state.campaignId ? state.campaignId : undefined
	);
	const dispositionNameOptions = dispositionFlow?.flowJson?.dispositionNodes
		? flattenDispositionTree(dispositionFlow.flowJson.dispositionNodes)
		: [];

	if (values.widgetType !== 'KPI') {
		return null;
	}

	const {
		handlePresetEnabledChange,
		handlePresetAliasChange,
		handlePresetKindChange,
		handlePresetSourceChange,
		handlePresetFieldChange,
		handlePresetValuesChange,
		handlePresetDisplayLabelChange,
		handlePresetIncludeChildrenChange,
	} = handlers;

	const aliasOptions = [
		{ value: '', label: t('dashboardBuilder.form.preset.customOption') },
		...ALIAS_OPTIONS.map((alias) => ({
			value: alias,
			label: t(`dashboardBuilder.form.preset.aliases.${alias}`),
		})),
	];

	const fieldOptions = values.presetSource
		? (PRESET_FIELDS_BY_SOURCE[values.presetSource] ?? []).map((f) => ({
				value: f,
				label: t(`dashboardBuilder.form.preset.fields.${f}`, {
					defaultValue: f,
				}),
			}))
		: [];

	const BOOLEAN_FIELDS = new Set([
		'isVoiceMail',
		'isAbandoned',
		'doNotCall',
		'requiresReschedule',
	]);

	const valueOptions = values.presetField
		? (PRESET_VALUES_BY_FIELD[values.presetField] ?? []).map((v) => {
				let labelKey: string;
				if (values.presetField === 'callStatus') {
					labelKey = `dashboardBuilder.form.preset.callStatus.${v}`;
				} else if (BOOLEAN_FIELDS.has(values.presetField!)) {
					labelKey = `dashboardBuilder.form.options.boolean.${v}`;
				} else {
					labelKey = `dashboardBuilder.form.preset.contactStatus.${v}`;
				}
				return { value: v, label: t(labelKey, { defaultValue: v }) };
			})
		: [];

	const isFreeTextField =
		values.presetField !== null &&
		!(values.presetField in PRESET_VALUES_BY_FIELD);

	const aliasDescription = values.presetAlias
		? t(
				`dashboardBuilder.form.preset.aliases.${values.presetAlias}_description`,
				{
					defaultValue: '',
				}
			)
		: null;
	const showIncludeChildren =
		values.presetField === 'dispositionName' && !values.presetAlias;

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.preset}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={values.presetEnabled || undefined}
				>
					<IconSparkles
						size={14}
						stroke={1.75}
						className={styles.sectionHeaderIconGlyph}
					/>
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.preset.sectionTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.preset.sectionDescription')}
					</span>
				</div>
				<div className={styles.sectionHeaderActions}>
					<Switch
						checked={values.presetEnabled}
						onChange={(e) => handlePresetEnabledChange(e.currentTarget.checked)}
						label={t('dashboardBuilder.form.preset.toggleLabel')}
						size='xs'
					/>
				</div>
			</div>

			{values.presetEnabled && (
				<Stack gap='sm' mt='xs'>
					<Select
						label={t('dashboardBuilder.form.preset.aliasLabel')}
						data={aliasOptions}
						value={values.presetAlias ?? ''}
						onChange={handlePresetAliasChange}
						clearable={false}
					/>

					{aliasDescription && (
						<Alert
							color='blue'
							variant='light'
							icon={<IconSparkles size={14} />}
						>
							<Text size='xs'>{aliasDescription}</Text>
						</Alert>
					)}

					{!values.presetAlias && (
						<>
							<SegmentedControl
								fullWidth
								value={values.presetKind ?? ''}
								onChange={handlePresetKindChange}
								data={[
									{
										value: 'COUNT',
										label: t('dashboardBuilder.form.preset.kind.COUNT'),
									},
									{
										value: 'RATE',
										label: t('dashboardBuilder.form.preset.kind.RATE'),
									},
								]}
							/>

							<SegmentedControl
								fullWidth
								value={values.presetSource ?? ''}
								onChange={handlePresetSourceChange}
								data={[
									{
										value: 'CONVERSATION',
										label: t(
											'dashboardBuilder.form.options.sourceType.CONVERSATION'
										),
									},
									{
										value: 'DISPOSITION',
										label: t(
											'dashboardBuilder.form.options.sourceType.DISPOSITION'
										),
									},
								]}
							/>

							{values.presetSource && (
								<Select
									label={t('dashboardBuilder.form.preset.fieldLabel')}
									data={fieldOptions}
									value={values.presetField}
									onChange={handlePresetFieldChange}
									clearable
								/>
							)}

							{values.presetField && !isFreeTextField && (
								<MultiSelect
									label={t('dashboardBuilder.form.preset.valuesLabel')}
									data={valueOptions}
									value={values.presetValues}
									onChange={handlePresetValuesChange}
								/>
							)}

							{values.presetField && isFreeTextField && (
								<TagsInput
									label={t('dashboardBuilder.form.preset.valuesLabel')}
									value={values.presetValues}
									onChange={handlePresetValuesChange}
									clearable
									data={
										isDispositionNameField ? dispositionNameOptions : undefined
									}
								/>
							)}

							{showIncludeChildren && (
								<Switch
									checked={values.includeChildren}
									onChange={(e) =>
										handlePresetIncludeChildrenChange(e.currentTarget.checked)
									}
									label={t('dashboardBuilder.form.preset.includeChildrenLabel')}
									description={t(
										'dashboardBuilder.form.preset.includeChildrenDescription'
									)}
									size='sm'
								/>
							)}
						</>
					)}

					<TextInput
						label={t('dashboardBuilder.form.preset.displayLabelLabel')}
						value={values.presetDisplayLabel}
						onChange={(e) =>
							handlePresetDisplayLabelChange(e.currentTarget.value)
						}
						maxLength={120}
					/>
				</Stack>
			)}
		</div>
	);
};

export default DashboardWidgetPresetSection;
