import { Button, Group } from '@mantine/core';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import type { DashboardWidget } from '~/models/AnalyticsDashboard';
import DashboardWidgetAdvancedSection from './DashboardWidgetAdvancedSection';
import DashboardWidgetBasicsSection from './DashboardWidgetBasicsSection';
import DashboardWidgetBreakdownSection from './DashboardWidgetBreakdownSection';
import DashboardWidgetMetricSourceSection from './DashboardWidgetMetricSourceSection';
import DashboardWidgetPreviewPanel from './DashboardWidgetPreviewPanel';
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

const DashboardWidgetForm = (props: DashboardWidgetFormProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { form, state, handleSubmit, isSubmitting, isEditing, onCancel } =
		useDashboardWidgetFormController(props);
	const deferredValues = useDeferredValue(state.values);
	const deferredPreview = useDeferredValue(state.guidedState.preview);

	return (
		<DashboardWidgetFormProvider form={form}>
			<DashboardWidgetFormStateProvider state={state}>
				<form onSubmit={handleSubmit} className={styles.modalForm}>
					<div className={styles.layout}>
						<div className={styles.formColumn}>
							<DashboardWidgetBasicsSection />
							<DashboardWidgetMetricSourceSection />
							<DashboardWidgetBreakdownSection />
							<DashboardWidgetAdvancedSection />
						</div>
						<DashboardWidgetPreviewPanel
							campaignId={state.campaignId}
							values={deferredValues}
							fallbackPreview={deferredPreview}
							sizePreset={state.sizePreset}
							placementLayout={state.placementLayout}
						/>
					</div>

					<div className={styles.formFooter}>
						<Group justify='flex-end' gap='xs'>
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
