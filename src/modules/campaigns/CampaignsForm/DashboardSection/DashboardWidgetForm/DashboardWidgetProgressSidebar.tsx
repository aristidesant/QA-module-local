import { Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SCROLL_AREA_ID } from './DashboardWidgetForm';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';
import styles from './DashboardWidgetProgressSidebar.module.css';

type StepStatus = 'complete' | 'current' | 'pending';

type ProgressStep = {
	key: keyof typeof DASHBOARD_WIDGET_FORM_SECTION_IDS;
	label: string;
	status: StepStatus;
};

const STEP_ORDER: ProgressStep['key'][] = [
	'sourceType',
	'sourceField',
	'aggregation',
	'widgetType',
	'widgetDetails',
	'visibilityScope',
	'advanced',
];

const SCROLL_OFFSET = 16;

const DashboardWidgetProgressSidebar = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const { values, advancedSettingsCount } = state;

	const completionMap: Record<ProgressStep['key'], boolean> = {
		sourceType: Boolean(values.sourceType),
		sourceField: state.isAttributeMetric
			? Boolean(values.metricKey) &&
				(!state.needsValueField || Boolean(values.valueField))
			: Boolean(values.fieldName),
		aggregation: Boolean(values.aggregationType),
		widgetType: Boolean(values.widgetType),
		widgetDetails: Boolean(values.title?.trim()),
		visibilityScope: Boolean(values.visibilityScope),
		advanced: advancedSettingsCount > 0,
	};

	const stepLabels: Record<ProgressStep['key'], string> = {
		sourceType: t('dashboardBuilder.progress.sourceType'),
		sourceField: t('dashboardBuilder.progress.sourceField'),
		aggregation: t('dashboardBuilder.progress.aggregation'),
		widgetType: t('dashboardBuilder.progress.widgetType'),
		widgetDetails: t('dashboardBuilder.progress.widgetDetails'),
		visibilityScope: t('dashboardBuilder.progress.visibilityScope'),
		advanced: t('dashboardBuilder.progress.advanced'),
	};

	const firstIncompleteIndex = STEP_ORDER.findIndex(
		(stepKey) => !completionMap[stepKey]
	);

	const steps: ProgressStep[] = STEP_ORDER.map((key, index) => {
		const isComplete = completionMap[key];
		let status: StepStatus;

		if (isComplete) {
			status = 'complete';
		} else if (
			index === firstIncompleteIndex ||
			(key === 'advanced' && firstIncompleteIndex === -1)
		) {
			status = 'current';
		} else {
			status = 'pending';
		}

		return {
			key,
			label: stepLabels[key],
			status,
		};
	});

	const scrollToSection = (sectionKey: ProgressStep['key']) => {
		const sectionId = DASHBOARD_WIDGET_FORM_SECTION_IDS[sectionKey];

		if (sectionKey === 'advanced' && !state.advancedOpened) {
			state.handlers.setAdvancedOpened(true);
		}

		window.setTimeout(
			() => {
				const scrollArea = document.getElementById(
					DASHBOARD_WIDGET_FORM_SCROLL_AREA_ID
				);
				const section = document.getElementById(sectionId);

				if (!scrollArea || !section) {
					return;
				}

				const scrollAreaRect = scrollArea.getBoundingClientRect();
				const sectionRect = section.getBoundingClientRect();
				const nextScrollTop =
					scrollArea.scrollTop +
					(sectionRect.top - scrollAreaRect.top) -
					SCROLL_OFFSET;

				scrollArea.scrollTo({
					top: Math.max(0, nextScrollTop),
					behavior: 'smooth',
				});
			},
			sectionKey === 'advanced' && !state.advancedOpened ? 60 : 0
		);
	};

	return (
		<div className={styles.progressCard}>
			<Text className={styles.sectionLabel} tt='uppercase' size='xs' fw={700}>
				{t('dashboardBuilder.progress.title')}
			</Text>

			<div className={styles.progressList}>
				{steps.map((step) => (
					<button
						key={step.key}
						type='button'
						className={styles.stepButton}
						data-status={step.status}
						aria-current={step.status === 'current' ? 'step' : undefined}
						onClick={() => scrollToSection(step.key)}
					>
						<div className={styles.stepIcon} data-status={step.status}>
							{step.status === 'complete' ? (
								<IconCircleCheck
									size={12}
									color='var(--mantine-color-green-7)'
									stroke={2.25}
								/>
							) : (
								<span className={styles.stepDot} data-status={step.status} />
							)}
						</div>

						<Text className={styles.stepLabel} data-status={step.status}>
							{step.label}
						</Text>
					</button>
				))}
			</div>
		</div>
	);
};

export default DashboardWidgetProgressSidebar;
