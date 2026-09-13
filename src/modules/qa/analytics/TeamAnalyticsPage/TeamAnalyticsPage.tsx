import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Title, Text, Group, Stack, Loader } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { TeamAnalyticsProvider } from './TeamAnalyticsContext';
import ViewSelector from './ViewSelector';
import FilterBar from './FilterBar';
import KPIStrip from './KPIStrip';
import SavedViewsMenu from './SavedViewsMenu';
import styles from './TeamAnalyticsPage.module.css';

function TeamAnalyticsPageContent() {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const role = roleFromPath(location.pathname);
	const isManager = role === 'qa-manager';

	const eyebrow = isManager
		? t('page.eyebrow.manager')
		: t('page.eyebrow.supervisor');

	return (
		<ContentContainer contentWidth='full'>
			<div className={styles.pageContainer}>
				<div className={styles.header}>
					<div className={styles.eyebrow}>{eyebrow}</div>
					<div className={styles.titleGroup}>
						<Title order={1}>{t('page.title')}</Title>
						<Text size='sm' c='dimmed'>
							{t('page.description')}
						</Text>
					</div>
				</div>

				<ViewSelector />

				<div className={styles.controlsRow}>
					<FilterBar />
					<SavedViewsMenu />
				</div>

				<KPIStrip />

				<div className={styles.contentArea}>
					<Group justify='center' py='xl'>
						<Stack align='center' gap='xs'>
							<Loader type='dots' />
							<Text size='sm' c='dimmed'>
								Loading analytics view...
							</Text>
						</Stack>
					</Group>
				</div>
			</div>
		</ContentContainer>
	);
}

export default function TeamAnalyticsPage() {
	return (
		<TeamAnalyticsProvider>
			<TeamAnalyticsPageContent />
		</TeamAnalyticsProvider>
	);
}
