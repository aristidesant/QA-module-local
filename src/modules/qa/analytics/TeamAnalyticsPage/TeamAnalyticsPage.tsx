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
import { SegmentationView } from './Segmentation';
import { BusinessView } from './Business';
import { FinderView } from './Finder';
import { BurnoutView } from './Burnout';
import { DEFAULT_VIEW, VIEW_PARAM } from '../constants';
import type { TeamAnalyticsView } from '../types';
import styles from './TeamAnalyticsPage.module.css';

function TeamAnalyticsPageContent() {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const role = roleFromPath(location.pathname);

	const params = new URLSearchParams(location.search);
	const currentView =
		(params.get(VIEW_PARAM) as TeamAnalyticsView) || DEFAULT_VIEW;

	const eyebrow = t(`page.eyebrow.${role}`);

	const renderContent = () => {
		switch (currentView) {
			case 'qa':
			case 'sentiment':
			case 'compliance':
				return <SegmentationView viewType={currentView} />;
			case 'business':
				return <BusinessView />;
			case 'finder':
				return <FinderView />;
			case 'burnout':
				return <BurnoutView />;
			default:
				return (
					<Group justify='center' py='xl'>
						<Stack align='center' gap='xs'>
							<Loader type='dots' />
							<Text size='sm' c='dimmed'>
								Loading analytics view...
							</Text>
						</Stack>
					</Group>
				);
		}
	};

	return (
		<ContentContainer contentWidth='full'>
			<div className={styles.pageContainer}>
				<div className={styles.header}>
					<div className={styles.eyebrow}>{eyebrow}</div>
					<div className={styles.titleGroup}>
						<Title order={1}>{t('page.title')}</Title>
						<Text size='sm' c='dimmed'>
							{t(`page.description.${role}`)}
						</Text>
					</div>
				</div>

				<ViewSelector />

				<div className={styles.controlsRow}>
					<FilterBar />
					<div className={styles.controlsAside}>
						<SavedViewsMenu />
					</div>
				</div>

				<KPIStrip />

				<div className={styles.contentArea}>{renderContent()}</div>
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
