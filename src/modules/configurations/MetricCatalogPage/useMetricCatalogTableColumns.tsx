import { memo, useMemo } from 'react';
import {
	ActionIcon,
	Badge,
	Code,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { Campaign } from '~/models/CampaignsModel';
import type { MetricDefinition } from '~/models/AnalyticsDashboard';
import {
	getMetricAggregationTypeBadgeColor,
	getMetricAggregationTypeLabel,
	getMetricResultTypeBadgeColor,
	getMetricResultTypeLabel,
	getMetricSourceTypeBadgeColor,
	getMetricSourceTypeLabel,
} from './MetricCatalogPage.helpers';

type UseMetricCatalogTableColumnsParams = {
	handleEdit: (metric: MetricDefinition) => void;
	handleDelete: (metric: MetricDefinition) => void;
	campaigns: Campaign[];
};

type MetricCatalogActionCellProps = {
	metric: MetricDefinition;
	onEdit: (metric: MetricDefinition) => void;
	onDelete: (metric: MetricDefinition) => void;
	editLabel: string;
	deleteLabel: string;
};

const MetricCatalogActionCell = memo(
	({
		metric,
		onEdit,
		onDelete,
		editLabel,
		deleteLabel,
	}: MetricCatalogActionCellProps) => (
		<Group gap={4} justify='flex-end' wrap='nowrap'>
			<Tooltip label={editLabel}>
				<ActionIcon variant='subtle' onClick={() => onEdit(metric)}>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={deleteLabel}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(metric)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	)
);

MetricCatalogActionCell.displayName = 'MetricCatalogActionCell';

const useMetricCatalogTableColumns = ({
	handleEdit,
	handleDelete,
	campaigns,
}: UseMetricCatalogTableColumnsParams): BaseTableColumnDef<MetricDefinition>[] => {
	const { t } = useTranslation('metric-catalog');
	const editLabel = t('table.actions.edit');
	const deleteLabel = t('table.actions.delete');

	const campaignMap = useMemo(
		() => new Map(campaigns.map((c) => [c.id, c.name])),
		[campaigns]
	);

	return useMemo(
		() => [
			{
				accessorKey: 'name',
				header: t('table.columns.name'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={600}>
							{row.original.name}
						</Text>
						<Code>{row.original.key}</Code>
						{row.original.description && (
							<Text size='xs' c='dimmed' lineClamp={1}>
								{row.original.description}
							</Text>
						)}
					</Stack>
				),
			},
			{
				id: 'scope',
				header: t('table.columns.scope'),
				cell: ({ row }) => {
					const campaignName = row.original.campaignId
						? campaignMap.get(row.original.campaignId)
						: null;
					return (
						<Stack gap={2}>
							<Badge
								variant='light'
								color={row.original.campaignId ? 'blue' : 'gray'}
							>
								{row.original.campaignId
									? t('table.scope.campaign')
									: t('table.scope.global')}
							</Badge>
							{campaignName && (
								<Text size='xs' c='dimmed' lineClamp={1}>
									{campaignName}
								</Text>
							)}
						</Stack>
					);
				},
			},
			{
				accessorKey: 'sourceType',
				header: t('table.columns.source'),
				cell: ({ row }) => (
					<Badge
						variant='light'
						color={getMetricSourceTypeBadgeColor(row.original.sourceType)}
					>
						{getMetricSourceTypeLabel(t, row.original.sourceType)}
					</Badge>
				),
			},
			{
				accessorKey: 'aggregationType',
				header: t('table.columns.aggregation'),
				cell: ({ row }) => (
					<Badge
						variant='light'
						color={getMetricAggregationTypeBadgeColor(
							row.original.aggregationType
						)}
					>
						{getMetricAggregationTypeLabel(t, row.original.aggregationType)}
					</Badge>
				),
			},
			{
				accessorKey: 'resultType',
				header: t('table.columns.resultType'),
				cell: ({ row }) => (
					<Badge
						variant='light'
						color={getMetricResultTypeBadgeColor(row.original.resultType)}
					>
						{getMetricResultTypeLabel(t, row.original.resultType)}
					</Badge>
				),
			},
			{
				id: 'features',
				header: t('table.columns.features'),
				cell: ({ row }) => {
					const hasGroupBy = row.original.supportsGroupBy;
					const hasTimeSeries = row.original.supportsTimeSeries;

					if (!hasGroupBy && !hasTimeSeries) {
						return (
							<Text size='sm' c='dimmed'>
								—
							</Text>
						);
					}

					return (
						<Group gap={4}>
							{hasGroupBy && (
								<Badge variant='dot' color='teal'>
									{t('table.features.groupBy')}
								</Badge>
							)}
							{hasTimeSeries && (
								<Badge variant='dot' color='orange'>
									{t('table.features.timeSeries')}
								</Badge>
							)}
						</Group>
					);
				},
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<MetricCatalogActionCell
						metric={row.original}
						onEdit={handleEdit}
						onDelete={handleDelete}
						editLabel={editLabel}
						deleteLabel={deleteLabel}
					/>
				),
			},
		],
		[campaignMap, deleteLabel, editLabel, handleDelete, handleEdit, t]
	);
};

export default useMetricCatalogTableColumns;
