import { useTranslation } from 'react-i18next';
import KpiCard from '~/components/KpiCard';
import type { WidgetContentBaseProps } from '../widgetContent.types';

const UnsupportedWidgetContent = ({
	widget,
	accentColor,
}: WidgetContentBaseProps) => {
	const { t } = useTranslation('campaign.form.dashboards');

	return (
		<KpiCard
			title={widget.title}
			accentColor={accentColor}
			isUnsupported
			unsupportedMessage={widget.message || t('dashboard.unsupportedMessage')}
		/>
	);
};

export default UnsupportedWidgetContent;
