import { useTranslation } from 'react-i18next';
import { Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';

export default function TeamAnalyticsPage() {
	const { t } = useTranslation('qa.teamAnalytics');

	return (
		<ContentContainer contentWidth="full">
			<Title order={1}>{t('page.title')}</Title>
		</ContentContainer>
	);
}
