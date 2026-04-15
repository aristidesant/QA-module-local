import { Text } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import {
	DashboardSectionProvider,
	useDashboardSectionModals,
} from './DashboardSection.context';
import DashboardPreviewView from './DashboardPreviewView';
import DashboardListPanel from './DashboardListPanel';
import DashboardModals from './DashboardModals';
import DashboardWidgetFormOverlay from './DashboardWidgetFormOverlay';
import WidgetListPanel from './WidgetListPanel';
import styles from './DashboardSection.module.css';

const DashboardSectionContent = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { previewDashboard } = useDashboardSectionModals();

	if (previewDashboard) {
		return <DashboardPreviewView />;
	}

	return (
		<>
			<SectionCard
				title={t('dashboardBuilder.title')}
				description={t('dashboardBuilder.description')}
				icon={IconLayoutDashboard}
			>
				<div className={styles.builderShell}>
					<div className={styles.manageLayout}>
						<div className={styles.sidebar}>
							<DashboardListPanel />
						</div>
						<div className={styles.main}>
							<WidgetListPanel />
						</div>
					</div>
				</div>
			</SectionCard>

			<DashboardModals />
			<DashboardWidgetFormOverlay />
		</>
	);
};

const DashboardSection = ({
	campaignId,
	attributeMetricKeys = [],
	allowGlobal = false,
	fullHeight = false,
	overlayTopOffset = 70,
}: {
	campaignId?: number | null;
	attributeMetricKeys?: string[];
	allowGlobal?: boolean;
	fullHeight?: boolean;
	overlayTopOffset?: number;
}) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);

	if (!campaignId && !allowGlobal) {
		return (
			<SectionCard
				title={t('dashboardBuilder.emptyDraftTitle')}
				description={t('dashboardBuilder.emptyDraftDescription')}
				icon={IconLayoutDashboard}
			>
				<Text size='sm' c='dimmed'>
					{t('dashboardBuilder.emptyDraftMessage')}
				</Text>
			</SectionCard>
		);
	}

	return (
		<DashboardSectionProvider
			campaignId={campaignId ?? null}
			attributeMetricKeys={attributeMetricKeys}
			overlayTopOffset={overlayTopOffset}
		>
			<div className={fullHeight ? styles.fullHeight : undefined}>
				<DashboardSectionContent />
			</div>
		</DashboardSectionProvider>
	);
};

export default DashboardSection;
