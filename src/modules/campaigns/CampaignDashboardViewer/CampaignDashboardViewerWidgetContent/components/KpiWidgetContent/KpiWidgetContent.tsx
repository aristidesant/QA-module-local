import { useTranslation } from 'react-i18next';
import KpiCard from '~/components/KpiCard';
import type { WidgetContentBaseProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const KpiWidgetContent = ({
	widget,
	accentColor,
	comparison,
}: WidgetContentBaseProps) => {
	const { t } = useTranslation('campaign.form.dashboards');

	return (
		<KpiCard
			title={widget.title}
			value={
				widget.result?.kind === 'single_value' ? widget.result.value : null
			}
			accentColor={accentColor}
			isLive={widget.status === 'SUCCESS'}
			liveLabel={t('dashboard.liveBadge')}
			isUnsupported={
				widget.status !== 'SUCCESS' || widget.result?.kind !== 'single_value'
			}
			unsupportedMessage={widget.message || t('dashboard.unsupportedMessage')}
			className={styles.kpiCard}
			comparison={comparison}
		/>
	);
};

export default KpiWidgetContent;
