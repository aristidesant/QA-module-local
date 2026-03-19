import { Alert, Box, Card, Group, Loader, LoadingOverlay } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AnalyticsTimeRange,
	DashboardRenderResponse,
} from '~/models/AnalyticsDashboard';
import CampaignDashboardViewerGrid from '../CampaignDashboardViewerGrid';
import CampaignDashboardViewerLayoutEditor from '../CampaignDashboardViewerLayoutEditor';
import useCampaignDashboardViewerStore from '../store/useCampaignDashboardViewerStore';
import type { ViewerWidgetLayout, WidgetComparisonData } from '../types';
import styles from './CampaignDashboardViewerContent.module.css';

interface CampaignDashboardViewerContentProps {
	activeLayoutMap: Map<number, ViewerWidgetLayout>;
	editorWidth: number;
	errorMessage?: string;
	isError: boolean;
	isMobile: boolean;
	isSavingLayout: boolean;
	renderLoading: boolean;
	renderResult: DashboardRenderResponse | undefined;
	comparisonMap?: Map<number, WidgetComparisonData>;
	comparisonPeriodLabel?: string;
	selectedTimeRange?: AnalyticsTimeRange | null;
	widgetsCount: number;
	onLayoutChange: (layout: ViewerWidgetLayout[]) => void;
}

const CampaignDashboardViewerContent = ({
	activeLayoutMap,
	editorWidth,
	errorMessage,
	isError,
	isMobile,
	isSavingLayout,
	renderLoading,
	renderResult,
	comparisonMap,
	comparisonPeriodLabel,
	selectedTimeRange,
	widgetsCount,
	onLayoutChange,
}: CampaignDashboardViewerContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const isEditingLayout = useCampaignDashboardViewerStore(
		(state) => state.isEditingLayout
	);

	return (
		<>
			{isMobile && widgetsCount > 0 ? (
				<Alert color='blue' variant='light' radius='md'>
					{t('dashboard.layoutEditor.mobileUnavailable')}
				</Alert>
			) : null}

			{isError ? (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color='red'
					variant='light'
					radius='md'
				>
					{errorMessage || t('dashboard.renderError')}
				</Alert>
			) : null}

			<Box pos='relative'>
				<LoadingOverlay
					visible={isSavingLayout}
					zIndex={10}
					loaderProps={{ size: 'sm' }}
					overlayProps={{ radius: 'lg', blur: 1 }}
				/>

				{renderLoading ? (
					<Card radius='lg' padding='xl' className={styles.emptyStateCard}>
						<Group justify='center'>
							<Loader size='sm' />
						</Group>
					</Card>
				) : renderResult ? (
					isEditingLayout ? (
						<CampaignDashboardViewerLayoutEditor
							widgets={renderResult.widgets}
							activeLayoutMap={activeLayoutMap}
							editorWidth={editorWidth}
							isInteractionDisabled={isSavingLayout}
							onLayoutChange={onLayoutChange}
						/>
					) : (
						<CampaignDashboardViewerGrid
							widgets={renderResult.widgets}
							activeLayoutMap={activeLayoutMap}
							comparisonMap={comparisonMap}
							comparisonPeriodLabel={comparisonPeriodLabel}
							selectedTimeRange={selectedTimeRange}
						/>
					)
				) : null}
			</Box>
		</>
	);
};

export default CampaignDashboardViewerContent;
