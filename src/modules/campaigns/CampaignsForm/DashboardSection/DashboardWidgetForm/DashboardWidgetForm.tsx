import { ActionIcon, Breadcrumbs, Button, Group, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import type { DashboardWidget } from '~/models/AnalyticsDashboard';
import DashboardWidgetAggregationSection from './DashboardWidgetAggregationSection';
import DashboardWidgetAdvancedSection from './DashboardWidgetAdvancedSection';
import DashboardWidgetBasicsSection from './DashboardWidgetBasicsSection';
import DashboardWidgetMetricSourceSection from './DashboardWidgetMetricSourceSection';
import DashboardWidgetTypeSection from './DashboardWidgetTypeSection';
import DashboardWidgetVisibilityScopeSection from './DashboardWidgetVisibilityScopeSection';
import DashboardWidgetPreviewPanel from './DashboardWidgetPreviewPanel';
import DashboardWidgetProgressSidebar from './DashboardWidgetProgressSidebar';
import {
	DashboardWidgetFormProvider,
	DashboardWidgetFormStateProvider,
} from './DashboardWidgetForm.context';
import styles from './DashboardWidgetForm.module.css';
import useDashboardWidgetFormController from './useDashboardWidgetFormController';

type DashboardWidgetFormProps = {
	campaignId: number | null;
	attributeMetricKeys?: string[];
	dashboardId: number;
	widget?: DashboardWidget | null;
	onCancel: () => void;
	onSuccess: () => void;
};

export const DASHBOARD_WIDGET_FORM_SCROLL_AREA_ID =
	'dashboard-widget-form-scroll-area';

const DashboardWidgetForm = (props: DashboardWidgetFormProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { form, state, handleSubmit, isSubmitting, isEditing, onCancel } =
		useDashboardWidgetFormController(props);
	const deferredValues = useDeferredValue(state.values);
	const deferredPreview = useDeferredValue(state.guidedState.preview);

	const pageTitle = isEditing
		? t('dashboardBuilder.drawer.editWidgetTitle')
		: t('dashboardBuilder.drawer.createWidgetTitle');

	const pageSubtitle = isEditing
		? t('dashboardBuilder.drawer.editWidgetSubtitle')
		: t('dashboardBuilder.drawer.createWidgetSubtitle');

	return (
		<DashboardWidgetFormProvider form={form}>
			<DashboardWidgetFormStateProvider state={state}>
				<form onSubmit={handleSubmit} className={styles.pageLayout}>
					<header className={styles.pageHeader}>
						<div className={styles.pageHeaderTop}>
							<ActionIcon
								variant='default'
								size='md'
								radius='md'
								onClick={onCancel}
								aria-label={t('common:back')}
							>
								<IconArrowLeft size={16} />
							</ActionIcon>
							<Breadcrumbs
								separator='›'
								separatorMargin={6}
								styles={{
									separator: {
										color: 'var(--mantine-color-gray-4)',
										fontSize: '0.9rem',
									},
								}}
							>
								<Text size='xs' c='gray.5' fw={500}>
									{t('dashboardBuilder.breadcrumb.root')}
								</Text>
								<Text size='xs' c='gray.8' fw={600}>
									{pageTitle}
								</Text>
							</Breadcrumbs>
						</div>

						<div className={styles.pageHeaderIntro}>
							<Text className={styles.pageTitle}>{pageTitle}</Text>
							<Text className={styles.pageSubtitle}>{pageSubtitle}</Text>
						</div>
					</header>

					<div
						id={DASHBOARD_WIDGET_FORM_SCROLL_AREA_ID}
						className={styles.pageBody}
					>
						<div className={styles.pageBodyInner}>
							<div className={styles.formColumn}>
								<DashboardWidgetMetricSourceSection />
								<DashboardWidgetAggregationSection />
								<DashboardWidgetTypeSection />
								<DashboardWidgetBasicsSection />
								<DashboardWidgetVisibilityScopeSection />
								<DashboardWidgetAdvancedSection />
							</div>

							<aside className={styles.sidebarColumn}>
								<DashboardWidgetProgressSidebar />
								<DashboardWidgetPreviewPanel
									campaignId={state.campaignId}
									values={deferredValues}
									fallbackPreview={deferredPreview}
									sizePreset={state.sizePreset}
									metricKeyOptions={state.metricKeyOptions}
									parsedMetricColumns={state.parsedMetricColumns}
								/>
							</aside>
						</div>
					</div>

					<div className={styles.pageFooter}>
						<div>
							<Text size='sm' fw={700}>
								{isEditing
									? t('dashboardBuilder.form.footerTitleEdit')
									: t('dashboardBuilder.form.footerTitle')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('dashboardBuilder.form.footerHint')}
							</Text>
						</div>
						<Group gap='xs'>
							<Button
								type='button'
								variant='default'
								size='sm'
								onClick={onCancel}
							>
								{t('dashboardBuilder.form.actions.cancel')}
							</Button>
							<Button type='submit' size='sm' loading={isSubmitting}>
								{isEditing
									? t('dashboardBuilder.form.actions.saveWidget')
									: t('dashboardBuilder.form.actions.createWidget')}
							</Button>
						</Group>
					</div>
				</form>
			</DashboardWidgetFormStateProvider>
		</DashboardWidgetFormProvider>
	);
};

export default DashboardWidgetForm;
