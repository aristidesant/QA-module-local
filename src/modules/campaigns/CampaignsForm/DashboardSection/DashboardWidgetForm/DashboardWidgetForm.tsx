import { useEffect, useMemo } from 'react';
import {
	Autocomplete,
	Button,
	Divider,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type {
	CreateDashboardWidgetDto,
	DashboardWidget,
	DashboardWidgetConfig,
	UpdateDashboardWidgetDto,
} from '~/models/AnalyticsDashboard';
import {
	findNextAvailableWidgetLayout,
	normalizeWidgetLayout,
} from '~/modules/campaigns/dashboardLayout';
import {
	useCreateDashboardWidget,
	useDashboardWidgets,
	useMetricDefinitions,
	useUpdateDashboardWidget,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	buildGroupBySuggestions,
	getWidgetTypeLabel,
	supportsGroupedWidget,
	supportsTimeSeriesWidget,
	widgetFormValues,
} from '../DashboardSection.helpers';
import type { WidgetFormValues } from '../DashboardSection.types';
import styles from './DashboardWidgetForm.module.css';

type DashboardWidgetFormProps = {
	campaignId: number | null;
	attributeMetricKeys?: string[];
	dashboardId: number;
	widget?: DashboardWidget | null;
	onCancel: () => void;
	onSuccess: () => void;
};

const DashboardWidgetForm = ({
	campaignId,
	attributeMetricKeys = [],
	dashboardId,
	widget,
	onCancel,
	onSuccess,
}: DashboardWidgetFormProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const createDashboardWidget = useCreateDashboardWidget();
	const updateDashboardWidget = useUpdateDashboardWidget();
	const { data: metricDefinitions = [] } = useMetricDefinitions();
	const { data: existingWidgets = [] } = useDashboardWidgets(dashboardId);
	const isEditing = Boolean(widget?.id);

	const widgetTypeOptions = useMemo(
		() => [
			{ value: 'KPI', label: getWidgetTypeLabel(t, 'KPI') },
			{ value: 'LINE_CHART', label: getWidgetTypeLabel(t, 'LINE_CHART') },
			{ value: 'BAR_CHART', label: getWidgetTypeLabel(t, 'BAR_CHART') },
			{ value: 'PIE_CHART', label: getWidgetTypeLabel(t, 'PIE_CHART') },
			{ value: 'DONUT_CHART', label: getWidgetTypeLabel(t, 'DONUT_CHART') },
			{ value: 'TABLE', label: getWidgetTypeLabel(t, 'TABLE') },
			{ value: 'FUNNEL', label: getWidgetTypeLabel(t, 'FUNNEL') },
		],
		[t]
	);

	const eligibleMetricOptions = useMemo(
		() =>
			metricDefinitions
				.filter((metricDefinition) =>
					campaignId === null
						? metricDefinition.campaignId === null
						: metricDefinition.campaignId === null ||
							metricDefinition.campaignId === campaignId
				)
				.map((metricDefinition) => ({
					value: String(metricDefinition.id),
					label:
						metricDefinition.campaignId === null
							? `${metricDefinition.name} (${t('dashboardBuilder.metricScope.global')})`
							: `${metricDefinition.name} (${t('dashboardBuilder.metricScope.campaign')})`,
				})),
		[campaignId, metricDefinitions, t]
	);

	const form = useForm<WidgetFormValues>({
		initialValues: widgetFormValues(widget),
		validate: {
			title: (value) =>
				value.trim() ? null : t('dashboardBuilder.form.validation.widgetTitle'),
			metricDefinitionId: (value) =>
				value ? null : t('dashboardBuilder.form.validation.metricRequired'),
			width: (value) =>
				value >= 1 ? null : t('dashboardBuilder.form.validation.minSize'),
			height: (value) =>
				value >= 1 ? null : t('dashboardBuilder.form.validation.minSize'),
			groupBy: (value, values) =>
				supportsGroupedWidget(values.widgetType) && !value.trim()
					? t('dashboardBuilder.form.validation.groupByRequired')
					: null,
			limit: (value) =>
				value === '' || value >= 1
					? null
					: t('dashboardBuilder.form.validation.minSize'),
		},
	});

	const selectedMetricDefinition = useMemo(
		() =>
			metricDefinitions.find(
				(metricDefinition) =>
					String(metricDefinition.id) === form.values.metricDefinitionId
			) ?? null,
		[form.values.metricDefinitionId, metricDefinitions]
	);

	const groupBySuggestions = useMemo(
		() =>
			buildGroupBySuggestions(selectedMetricDefinition, attributeMetricKeys),
		[attributeMetricKeys, selectedMetricDefinition]
	);

	const needsGroupedConfig = supportsGroupedWidget(form.values.widgetType);
	const needsTimeSeriesMetric = supportsTimeSeriesWidget(
		form.values.widgetType
	);
	const hasGroupedMetricCompatibility =
		!needsGroupedConfig || selectedMetricDefinition?.supportsGroupBy;
	const hasTimeSeriesCompatibility =
		!needsTimeSeriesMetric || selectedMetricDefinition?.supportsTimeSeries;
	const isAttributeMetric =
		selectedMetricDefinition?.sourceType === 'ATTRIBUTE';
	const groupByDescription = isAttributeMetric
		? t('dashboardBuilder.form.fields.groupByDescriptionAttribute')
		: t('dashboardBuilder.form.fields.groupByDescription');
	const groupByPlaceholder = isAttributeMetric
		? t('dashboardBuilder.form.placeholders.groupByAttribute')
		: t('dashboardBuilder.form.placeholders.groupBy');

	const placementLayout = useMemo(
		() =>
			findNextAvailableWidgetLayout(
				existingWidgets.map((item) => ({
					id: item.id,
					positionX: item.positionX,
					positionY: item.positionY,
					width: item.width,
					height: item.height,
				})),
				{ width: form.values.width, height: form.values.height },
				widget?.id ? { excludeId: widget.id } : undefined
			),
		[existingWidgets, form.values.height, form.values.width, widget?.id]
	);

	useEffect(() => {
		const nextValues = widgetFormValues(widget);

		form.setValues(nextValues);
		form.resetDirty(nextValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [widget]);

	const handleSubmit = form.onSubmit(async (values) => {
		if (needsGroupedConfig && !selectedMetricDefinition?.supportsGroupBy) {
			form.setFieldError(
				'metricDefinitionId',
				t('dashboardBuilder.form.validation.metricMustSupportGroupBy')
			);
			return;
		}

		if (
			needsTimeSeriesMetric &&
			!selectedMetricDefinition?.supportsTimeSeries
		) {
			form.setFieldError(
				'metricDefinitionId',
				t('dashboardBuilder.form.validation.metricMustSupportTimeSeries')
			);
			return;
		}

		const config: DashboardWidgetConfig | null = needsGroupedConfig
			? {
					groupBy: values.groupBy.trim(),
					...(values.limit === '' ? {} : { limit: values.limit }),
				}
			: null;

		const payload: CreateDashboardWidgetDto | UpdateDashboardWidgetDto = {
			...normalizeWidgetLayout({
				positionX: placementLayout.positionX,
				positionY: placementLayout.positionY,
				width: values.width,
				height: values.height,
			}),
			dashboardId,
			metricDefinitionId: Number(values.metricDefinitionId),
			widgetType: values.widgetType,
			title: values.title.trim(),
			description: values.description.trim() || undefined,
			enabled: values.enabled,
			config,
		};

		try {
			if (isEditing && widget) {
				await updateDashboardWidget.mutateAsync({
					id: widget.id,
					data: payload,
				});
			} else {
				await createDashboardWidget.mutateAsync(
					payload as CreateDashboardWidgetDto
				);
			}

			notifications.show({
				title: isEditing
					? t('dashboardBuilder.notifications.widgetUpdatedTitle')
					: t('dashboardBuilder.notifications.widgetCreatedTitle'),
				message: isEditing
					? t('dashboardBuilder.notifications.widgetUpdatedMessage')
					: t('dashboardBuilder.notifications.widgetCreatedMessage'),
				color: 'green',
			});

			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('dashboardBuilder.notifications.errorTitle'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	return (
		<form onSubmit={handleSubmit} className={styles.modalForm}>
			<Stack gap={0}>
				<div className={styles.formSection}>
					<Stack gap='sm'>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
							<TextInput
								label={t('dashboardBuilder.form.fields.widgetTitle')}
								{...form.getInputProps('title')}
							/>
							<Select
								label={t('dashboardBuilder.form.fields.widgetType')}
								allowDeselect={false}
								data={widgetTypeOptions}
								{...form.getInputProps('widgetType')}
							/>
						</SimpleGrid>
						<Textarea
							label={t('dashboardBuilder.form.fields.widgetDescriptionShort')}
							minRows={2}
							{...form.getInputProps('description')}
						/>
						<Select
							label={t('dashboardBuilder.form.fields.metricDefinition')}
							searchable
							data={eligibleMetricOptions}
							placeholder={t(
								'dashboardBuilder.form.placeholders.metricDefinition'
							)}
							{...form.getInputProps('metricDefinitionId')}
						/>
					</Stack>
				</div>

				{needsGroupedConfig && (
					<>
						<Divider />
						<div className={styles.formSection}>
							<Text fw={600} size='sm'>
								{t('dashboardBuilder.form.sections.dataTitle')}
							</Text>
							<Stack gap='sm'>
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
									<Autocomplete
										label={t('dashboardBuilder.form.fields.groupBy')}
										description={groupByDescription || undefined}
										placeholder={groupByPlaceholder}
										data={groupBySuggestions}
										{...form.getInputProps('groupBy')}
									/>
									<NumberInput
										label={t('dashboardBuilder.form.fields.limit')}
										description={
											t('dashboardBuilder.form.fields.limitDescription') ||
											undefined
										}
										placeholder={t('dashboardBuilder.form.placeholders.limit')}
										min={1}
										{...form.getInputProps('limit')}
									/>
								</SimpleGrid>
								{!hasGroupedMetricCompatibility && (
									<Text size='xs' c='red' className={styles.inlineNotice}>
										{t('dashboardBuilder.form.compatibility.groupByRequired')}
									</Text>
								)}
							</Stack>
						</div>
					</>
				)}

				{needsTimeSeriesMetric && !hasTimeSeriesCompatibility && (
					<Text
						size='xs'
						c='red'
						px='xs'
						pb='xs'
						className={styles.inlineNotice}
					>
						{t('dashboardBuilder.form.compatibility.timeSeriesRequired')}
					</Text>
				)}

				<Divider />
				<div className={styles.formSection}>
					<Group justify='space-between' align='center'>
						<Text fw={600} size='sm'>
							{t('dashboardBuilder.form.sections.statusTitle')}
						</Text>
						<Switch
							label={t('dashboardBuilder.form.fields.enabled')}
							checked={form.values.enabled}
							onChange={(event) =>
								form.setFieldValue('enabled', event.currentTarget.checked)
							}
						/>
					</Group>
				</div>
			</Stack>

			<div className={styles.formFooter}>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onCancel}>
						{t('dashboardBuilder.form.actions.cancel')}
					</Button>
					<Button
						type='submit'
						loading={
							createDashboardWidget.isPending || updateDashboardWidget.isPending
						}
					>
						{isEditing
							? t('dashboardBuilder.form.actions.saveWidget')
							: t('dashboardBuilder.form.actions.createWidget')}
					</Button>
				</Group>
			</div>
		</form>
	);
};

export default DashboardWidgetForm;
