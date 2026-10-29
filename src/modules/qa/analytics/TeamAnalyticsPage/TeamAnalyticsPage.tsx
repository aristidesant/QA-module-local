import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Title, Text } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import { analyticsRoleFromPath } from '../helpers';
import { TeamAnalyticsProvider } from './TeamAnalyticsContext';
import ViewSelector from './ViewSelector';
import FilterBar from './FilterBar';
import SavedViewsMenu from './SavedViewsMenu';
import { BusinessView } from './Business';
import { SurveysView } from './Surveys';
import { BurnoutView } from './Burnout';
import ComplianceView from './Compliance/ComplianceView';
import DisputesView from './Disputes/DisputesView';
import { FinderView } from './Finder';
import HumanVsAiView from './HumanVsAi/HumanVsAiView';
import OperationalView from './Operational/OperationalView';
import OverviewView from './Overview/OverviewView';
import QaView from './Quality/QaView';
import SentimentView from './Sentiment/SentimentView';
import { DEFAULT_VIEW, VIEW_PARAM } from '../constants';
import type { TeamAnalyticsView } from '../types';
import styles from './TeamAnalyticsPage.module.css';

const VIEWS: Record<TeamAnalyticsView, ComponentType> = {
	overview: OverviewView,
	operational: OperationalView,
	qa: QaView,
	compliance: ComplianceView,
	business: BusinessView,
	sentiment: SentimentView,
	surveys: SurveysView,
	humanVsAi: HumanVsAiView,
	burnout: BurnoutView,
	disputes: DisputesView,
	finder: FinderView,
};

function TeamAnalyticsPageContent() {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const analyticsRole = analyticsRoleFromPath(location.pathname);

	const params = new URLSearchParams(location.search);
	const requested = params.get(VIEW_PARAM) as TeamAnalyticsView | null;
	const currentView: TeamAnalyticsView =
		requested && requested in VIEWS ? requested : DEFAULT_VIEW;
	const View = VIEWS[currentView];

	/** Burnout reads fixed trailing windows, so it ignores the filters. */
	const filtersApply = currentView !== 'burnout';

	return (
		<ContentContainer contentWidth='full'>
			<div className={styles.pageContainer}>
				<div className={styles.header}>
					<div className={styles.eyebrow}>
						{t(`page.eyebrow.${analyticsRole}`)}
					</div>
					<div className={styles.titleGroup}>
						<Title order={1}>{t('page.title')}</Title>
						<Text size='sm' c='dimmed'>
							{t(`page.description.${analyticsRole}`)}
						</Text>
					</div>
				</div>

				<div className={styles.controlsRow}>
					<FilterBar disabled={!filtersApply} />
					<div className={styles.controlsAside}>
						<SavedViewsMenu disabled={!filtersApply} />
					</div>
				</div>
				{!filtersApply && (
					<Text size='xs' c='dimmed'>
						{t('filters.burnoutNotice')}
					</Text>
				)}

				<ViewSelector />

				<div className={styles.contentArea}>
					<View />
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
