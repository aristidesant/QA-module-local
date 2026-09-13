import { useTranslation } from 'react-i18next';
import { Tabs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router';
import { TEAM_ANALYTICS_VIEWS, VIEW_PARAM, DEFAULT_VIEW } from '../constants';
import type { TeamAnalyticsView } from '../types';
import styles from './TeamAnalyticsPage.module.css';

export default function ViewSelector() {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const currentView =
		(params.get(VIEW_PARAM) as TeamAnalyticsView) || DEFAULT_VIEW;

	const handleViewChange = (view: string | null) => {
		if (view) {
			const newParams = new URLSearchParams(location.search);
			newParams.set(VIEW_PARAM, view);
			navigate(`${location.pathname}?${newParams.toString()}`);
		}
	};

	return (
		<div className={styles.viewSelector}>
			<Tabs value={currentView} onChange={handleViewChange}>
				<Tabs.List>
					{TEAM_ANALYTICS_VIEWS.map((view) => (
						<Tabs.Tab key={view} value={view}>
							{t(`page.views.${view}`)}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>
		</div>
	);
}
