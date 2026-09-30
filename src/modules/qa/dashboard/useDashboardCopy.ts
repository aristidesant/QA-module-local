import { useTranslation } from 'react-i18next';

export type DashboardCopyRole = 'agent' | 'supervisor' | 'qaManager';
export type DashboardMeasure =
	| 'operational'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'business';

/** Page title, subtitle and "{scope} · {measure}" card subtitles, so every role words the same metric the same way. */
export const useDashboardCopy = (role: DashboardCopyRole) => {
	const { t } = useTranslation('qa.dashboard');
	return {
		title: t(`roleDashboard.title.${role}`),
		subtitle: t(`roleDashboard.subtitle.${role}`),
		cardSubtitle: (measure: DashboardMeasure) =>
			t('roleDashboard.scoped', {
				scope: t(`roleDashboard.scope.${role}`),
				measure: t(`roleDashboard.measure.${measure}`),
			}),
	};
};
