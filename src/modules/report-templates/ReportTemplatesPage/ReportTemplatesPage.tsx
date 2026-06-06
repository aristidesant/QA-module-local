import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { IconTemplate } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

const ReportTemplatesPage = () => {
	const { t } = useTranslation('report-templates');

	return (
		<ContentContainer
			title={t('title')}
			description={t('description')}
			titleIcon={<IconTemplate size={20} />}
		>
			<Outlet />
		</ContentContainer>
	);
};

export default ReportTemplatesPage;
