import { memo, useEffect, useMemo, useRef } from 'react';
import {
	Badge,
	Button,
	Divider,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateMetricDefinition,
	useUpdateMetricDefinition,
} from '~/queries/analyticsDashboardsQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import type { CreateMetricDefinitionDto } from '~/models/AnalyticsDashboard';
import { getErrorMessage } from '~/utils/httpClient';
import { getDataCollectionFromAgentConfig } from '~/modules/campaigns/CampaignsForm/AnalyticsSection/analyticsFormContext';
import {
	getMetricAggregationOptions,
	getMetricResultTypeOptions,
	getMetricScopeOptions,
	getMetricSourceOptions,
} from '../../MetricCatalogPage.helpers';
import {
	buildMetricDefinitionPayload,
	isAttributeMetricSource,
	isCampaignDependentSource,
	isDispositionMetricSource,
	parseMetricColumnsConfig,
	toFormValues,
} from './MetricDefinitionForm.helpers';
import type {
	MetricColumnConfigEntry,
	MetricDefinitionFormProps,
	MetricDefinitionFormValues,
} from './MetricDefinitionForm.types';

const METRIC_COLUMNS_CONFIG_KEY = 'metric_columns';

const SectionLabel = ({ children }: { children: string }) => (
	<Divider
		labelPosition='left'
		label={
			<Text size='xs' fw={700} tt='uppercase' c='dimmed' lts={0.8}>
				{children}
			</Text>
		}
	/>
);

const buildMetricColumnOption = (entry: MetricColumnConfigEntry) => ({
	value: entry.value,
	label: `${entry.label} (${entry.value})`,
});

const MetricDefinitionForm = ({
	metric,
	campaignOptions,
	onCancel,
	onSuccess,
}: MetricDefinitionFormProps) => {
	const { t } = useTranslation('metric-catalog');
	const createMetricDefinition = useCreateMetricDefinition();
	const updateMetricDefinition = useUpdateMetricDefinition();
	const isEditing = Boolean(metric?.id);

	const initialValues = useMemo(() => toFormValues(metric), [metric]);
	const scopeOptions = useMemo(() => getMetricScopeOptions(t), [t]);
	const allSourceOptions = useMemo(() => getMetricSourceOptions(t), [t]);
	const aggregationOptions = useMemo(() => getMetricAggregationOptions(t), [t]);
	const resultTypeOptions = useMemo(() => getMetricResultTypeOptions(t), [t]);
	const { data: metricColumnsConfig, isLoading: isMetricColumnsLoading } =
		useGetClientConfig(METRIC_COLUMNS_CONFIG_KEY);

	const form = useForm<MetricDefinitionFormValues>({
		initialValues,
		validate: {
			name: (value) =>
				value.trim() ? null : t('form.validation.nameRequired'),
			campaignId: (value, values) =>
				values.scope === 'campaign' && !value
					? t('form.validation.campaignRequired')
					: null,
			fieldName: (value, values) =>
				!isAttributeMetricSource(values.sourceType) && !value.trim()
					? t('form.validation.fieldNameRequired')
					: null,
			metricKey: (value, values) =>
				isAttributeMetricSource(values.sourceType) && !value.trim()
					? t('form.validation.metricKeyRequired')
					: null,
			// valueField is hidden — validation skipped
			valueField: () => null,
			defaultFilterJson: (value) => {
				if (!value.trim()) return null;
				try {
					JSON.parse(value);
					return null;
				} catch {
					return t('form.validation.defaultFilterInvalid');
				}
			},
		},
	});
	const sourceOptions = useMemo(
		() =>
			form.values.scope === 'campaign'
				? allSourceOptions
				: allSourceOptions.filter((option) => option.value !== 'ATTRIBUTE'),
		[allSourceOptions, form.values.scope]
	);

	const isAttributeSource = isAttributeMetricSource(form.values.sourceType);
	const isDispositionSource = isDispositionMetricSource(form.values.sourceType);
	const hasCampaignSelected = !!form.values.campaignId;
	const hasCampaignDependentSource = isCampaignDependentSource(
		form.values.sourceType
	);
	const parsedMetricColumns = useMemo(
		() => parseMetricColumnsConfig(metricColumnsConfig?.value),
		[metricColumnsConfig?.value]
	);
	const conversationFieldOptions = useMemo(
		() => parsedMetricColumns.conversation.map(buildMetricColumnOption),
		[parsedMetricColumns.conversation]
	);
	const dispositionFieldOptions = useMemo(
		() => parsedMetricColumns.disposition.map(buildMetricColumnOption),
		[parsedMetricColumns.disposition]
	);
	const hasMetricColumnsForConversation = conversationFieldOptions.length > 0;
	const hasMetricColumnsForDisposition = dispositionFieldOptions.length > 0;

	useEffect(() => {
		if (form.values.scope !== 'global') {
			return;
		}

		if (hasCampaignDependentSource) {
			form.setFieldValue('sourceType', 'CONVERSATION');
		}

		if (form.values.campaignId) {
			form.setFieldValue('campaignId', '');
		}

		if (form.values.metricKey) {
			form.setFieldValue('metricKey', '');
		}
	}, [
		form,
		form.values.scope,
		form.values.campaignId,
		form.values.metricKey,
		hasCampaignDependentSource,
	]);

	useEffect(() => {
		if (isAttributeSource) {
			if (form.values.fieldName) {
				form.setFieldValue('fieldName', '');
			}
			return;
		}

		const supportedOptions = isDispositionSource
			? dispositionFieldOptions
			: conversationFieldOptions;
		const currentFieldName = form.values.fieldName;
		const hasCurrentField = supportedOptions.some(
			(option) => option.value === currentFieldName
		);

		if (currentFieldName && !hasCurrentField) {
			form.setFieldValue('fieldName', '');
		}
	}, [
		conversationFieldOptions,
		dispositionFieldOptions,
		form,
		form.values.fieldName,
		isAttributeSource,
		isDispositionSource,
	]);

	const previousCampaignIdRef = useRef<string | null>(null);

	useEffect(() => {
		const currentCampaignId = form.values.campaignId || null;
		const previousCampaignId = previousCampaignIdRef.current;
		const hasCampaignChanged =
			previousCampaignId !== null && previousCampaignId !== currentCampaignId;

		if (
			hasCampaignChanged &&
			form.values.scope === 'campaign' &&
			isDispositionSource &&
			form.values.fieldName
		) {
			form.setFieldValue('fieldName', '');
		}

		previousCampaignIdRef.current = currentCampaignId;
	}, [form, form.values.campaignId, form.values.fieldName, form.values.scope]);

	// Fetch selected campaign to extract dataCollection keys for the metricKey dropdown
	const { data: selectedCampaign, isLoading: isCampaignLoading } =
		useGetCampaign(form.values.campaignId, {
			enabled: isAttributeSource && hasCampaignSelected,
		});

	const metricKeyOptions = useMemo(() => {
		if (!isAttributeSource || !selectedCampaign) return [];
		const dc = getDataCollectionFromAgentConfig(selectedCampaign.agentConfig);
		return Object.keys(dc)
			.filter((k) => k.trim().length > 0)
			.sort()
			.map((k) => ({ value: k, label: k }));
	}, [isAttributeSource, selectedCampaign]);

	const handleSubmit = form.onSubmit(async (values) => {
		const payload = buildMetricDefinitionPayload(values);

		try {
			if (isEditing && metric) {
				await updateMetricDefinition.mutateAsync({
					id: metric.id,
					data: payload,
				});
				notifications.show({
					title: t('notifications.updatedTitle'),
					message: t('notifications.updatedMessage'),
					color: 'green',
				});
			} else {
				await createMetricDefinition.mutateAsync(
					payload as CreateMetricDefinitionDto
				);
				notifications.show({
					title: t('notifications.createdTitle'),
					message: t('notifications.createdMessage'),
					color: 'green',
				});
			}

			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('notifications.errorTitle'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap='md'>
				{/* ── Identification ─────────────────────────────── */}
				<SectionLabel>{t('form.sections.identification')}</SectionLabel>

				<Group gap='sm' align='flex-start' wrap='nowrap'>
					<TextInput
						label={t('form.fields.name')}
						style={{ flex: 1 }}
						{...form.getInputProps('name')}
					/>
				</Group>

				<Textarea
					label={t('form.fields.description')}
					minRows={2}
					autosize
					{...form.getInputProps('description')}
				/>

				{/* ── Scope ──────────────────────────────────────── */}
				<SectionLabel>{t('form.sections.scope')}</SectionLabel>

				<Group gap='sm' align='flex-start' wrap='nowrap'>
					<Select
						label={t('form.fields.scope')}
						data={scopeOptions}
						allowDeselect={false}
						style={{ flex: 1 }}
						{...form.getInputProps('scope')}
					/>
					<Select
						label={t('form.fields.campaign')}
						placeholder={t('form.placeholders.campaign')}
						data={campaignOptions}
						disabled={form.values.scope !== 'campaign'}
						searchable
						clearable={form.values.scope === 'campaign'}
						style={{ flex: 2 }}
						{...form.getInputProps('campaignId')}
					/>
				</Group>

				{/* ── Source configuration ───────────────────────── */}
				<SectionLabel>{t('form.sections.sourceConfig')}</SectionLabel>

				<Group gap='sm' align='flex-start' wrap='nowrap'>
					<Select
						label={t('form.fields.sourceType')}
						data={sourceOptions}
						allowDeselect={false}
						style={{ flex: 1 }}
						{...form.getInputProps('sourceType')}
					/>
					<Select
						label={t('form.fields.aggregationType')}
						data={aggregationOptions}
						allowDeselect={false}
						style={{ flex: 1 }}
						{...form.getInputProps('aggregationType')}
					/>
					<Select
						label={t('form.fields.resultType')}
						data={resultTypeOptions}
						allowDeselect={false}
						style={{ flex: 1 }}
						{...form.getInputProps('resultType')}
					/>
				</Group>

				{isAttributeSource ? (
					<Select
						label={t('form.fields.metricKey')}
						data={metricKeyOptions}
						searchable
						clearable
						disabled={!hasCampaignSelected || isCampaignLoading}
						placeholder={
							hasCampaignSelected
								? isCampaignLoading
									? t('form.placeholders.loadingVariables')
									: t('form.placeholders.selectVariable')
								: t('form.placeholders.selectCampaignFirst')
						}
						{...form.getInputProps('metricKey')}
					/>
				) : isDispositionSource ? (
					<Select
						label={t('form.fields.fieldName')}
						data={dispositionFieldOptions}
						searchable
						clearable
						disabled={isMetricColumnsLoading || !hasMetricColumnsForDisposition}
						placeholder={
							isMetricColumnsLoading
								? t('form.placeholders.loadingMetricColumns')
								: t('form.placeholders.metricColumnsUnavailable')
						}
						description={
							hasMetricColumnsForDisposition
								? t('form.fields.dispositionFieldDescription')
								: t('form.fields.metricColumnsUnavailableDescription')
						}
						nothingFoundMessage={t(
							'form.placeholders.metricColumnsUnavailable'
						)}
						{...form.getInputProps('fieldName')}
					/>
				) : (
					<Select
						label={t('form.fields.conversationField')}
						data={conversationFieldOptions}
						searchable
						clearable
						disabled={
							isMetricColumnsLoading || !hasMetricColumnsForConversation
						}
						placeholder={
							isMetricColumnsLoading
								? t('form.placeholders.loadingMetricColumns')
								: hasMetricColumnsForConversation
									? t('form.placeholders.selectConversationField')
									: t('form.placeholders.metricColumnsUnavailable')
						}
						nothingFoundMessage={t(
							'form.placeholders.metricColumnsUnavailable'
						)}
						description={
							hasMetricColumnsForConversation
								? t('form.fields.conversationFieldDescription')
								: t('form.fields.metricColumnsUnavailableDescription')
						}
						{...form.getInputProps('fieldName')}
					/>
				)}

				{/* ── Capabilities ───────────────────────────────── */}
				<SectionLabel>{t('form.sections.capabilities')}</SectionLabel>

				<Group gap='xl'>
					<Switch
						label={t('form.fields.supportsGroupBy')}
						checked={form.values.supportsGroupBy}
						onChange={(event) =>
							form.setFieldValue('supportsGroupBy', event.currentTarget.checked)
						}
					/>
					<Switch
						label={t('form.fields.supportsTimeSeries')}
						checked={form.values.supportsTimeSeries}
						onChange={(event) =>
							form.setFieldValue(
								'supportsTimeSeries',
								event.currentTarget.checked
							)
						}
					/>
				</Group>

				{/* ── Footer ─────────────────────────────────────── */}
				<Group justify='space-between' mt='xs'>
					<Badge
						variant='light'
						color={form.values.scope === 'global' ? 'gray' : 'blue'}
						size='sm'
					>
						{t('form.scopeNote', {
							scope:
								form.values.scope === 'global'
									? t('form.scope.global')
									: t('form.scope.campaign'),
						})}
					</Badge>
					<Group gap='xs'>
						<Button variant='default' onClick={onCancel}>
							{t('form.actions.cancel')}
						</Button>
						<Button
							type='submit'
							loading={
								createMetricDefinition.isPending ||
								updateMetricDefinition.isPending
							}
						>
							{isEditing ? t('form.actions.save') : t('form.actions.create')}
						</Button>
					</Group>
				</Group>
			</Stack>
		</form>
	);
};

export default memo(MetricDefinitionForm);
