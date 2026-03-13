import { useCallback, useMemo } from 'react';
import { Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconChartBar, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard';
import type { MetricDefinition } from '~/models/AnalyticsDashboard';
import {
	useDeleteMetricDefinition,
	useMetricDefinitions,
} from '~/queries/analyticsDashboardsQueries';
import { useGetAllCampaigns } from '~/queries/campaignsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import MetricCatalogFilters from './components/MetricCatalogFilters';
import MetricDefinitionModal from './components/MetricDefinitionModal';
import useFilteredMetricDefinitions from './hooks/useFilteredMetricDefinitions';
import useMetricCatalogStore from './store/useMetricCatalogStore';
import useMetricCatalogTableColumns from './useMetricCatalogTableColumns';

const MetricCatalogPage = () => {
	const { t } = useTranslation('metric-catalog');
	const scopeFilter = useMetricCatalogStore((state) => state.scopeFilter);
	const sourceFilter = useMetricCatalogStore((state) => state.sourceFilter);
	const campaignFilter = useMetricCatalogStore((state) => state.campaignFilter);
	const timeSeriesFilter = useMetricCatalogStore(
		(state) => state.timeSeriesFilter
	);
	const selectedMetricId = useMetricCatalogStore(
		(state) => state.selectedMetricId
	);
	const openCreateModal = useMetricCatalogStore(
		(state) => state.openCreateModal
	);
	const openEditModal = useMetricCatalogStore((state) => state.openEditModal);

	const deleteMetricDefinition = useDeleteMetricDefinition();
	const { data: metrics = [], isLoading } = useMetricDefinitions();
	const { data: campaigns = [] } = useGetAllCampaigns();

	const selectedMetric = useMemo(
		() => metrics.find((metric) => metric.id === selectedMetricId) ?? null,
		[metrics, selectedMetricId]
	);

	const campaignOptions = useMemo(
		() =>
			campaigns.map((campaign) => ({
				value: String(campaign.id),
				label: campaign.name,
			})),
		[campaigns]
	);

	const filteredMetrics = useFilteredMetricDefinitions({
		metrics,
		scopeFilter,
		sourceFilter,
		campaignFilter,
		timeSeriesFilter,
	});

	const handleCreate = useCallback(() => {
		openCreateModal();
	}, [openCreateModal]);

	const handleEdit = useCallback(
		(metric: MetricDefinition) => {
			openEditModal(metric.id);
		},
		[openEditModal]
	);

	const handleDelete = useCallback(
		(metric: MetricDefinition) => {
			modals.openConfirmModal({
				title: t('delete.title'),
				children: t('delete.message', { name: metric.name }),
				labels: {
					confirm: t('delete.confirm'),
					cancel: t('delete.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteMetricDefinition.mutateAsync(metric.id);
						notifications.show({
							title: t('notifications.deletedTitle'),
							message: t('notifications.deletedMessage'),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('notifications.errorTitle'),
							message: getErrorMessage(error),
							color: 'red',
						});
					}
				},
			});
		},
		[deleteMetricDefinition, t]
	);

	const columns = useMetricCatalogTableColumns({
		handleEdit,
		handleDelete,
		campaigns,
	});
	const sectionActions = useMemo(
		() => ({
			primary: {
				kind: 'add' as const,
				icon: IconPlus,
				label: t('actions.create'),
				onClick: handleCreate,
			},
		}),
		[handleCreate, t]
	);

	return (
		<>
			<SectionCard
				title={t('title')}
				description={t('description')}
				icon={IconChartBar}
				actions={sectionActions}
			>
				<Stack gap='sm'>
					<MetricCatalogFilters campaignOptions={campaignOptions} />

					<BaseTable<MetricDefinition>
						data={filteredMetrics}
						columns={columns}
						isLoading={isLoading}
						emptyMessage={t('table.empty')}
					/>
				</Stack>
			</SectionCard>

			<MetricDefinitionModal
				metric={selectedMetric}
				campaignOptions={campaignOptions}
			/>
		</>
	);
};

export default MetricCatalogPage;
