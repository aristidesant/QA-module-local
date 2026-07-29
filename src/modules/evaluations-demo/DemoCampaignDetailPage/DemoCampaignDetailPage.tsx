import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	ActionIcon,
	Anchor,
	Badge,
	Breadcrumbs,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Tabs,
	Title,
	Tooltip,
} from '@mantine/core';
import { IconActivity, IconSettings, IconUsers } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import { getDemoCampaign } from '../mockData';
import type { DemoEvaluation } from '../mockData';
import { DEMO_HEALTH_COLORS } from '../demoBadgeColors';
import {
	DEMO_CATEGORY_COLORS,
	DEMO_CATEGORY_ICONS,
	DEMO_CATEGORY_LABELS,
} from '../demoCategoryMeta';
import DemoStatRow from '../components/DemoStatRow';
import EvaluationCard from '../components/EvaluationCard';
import EvaluationFilterChips from '../components/EvaluationFilterChips';
import type { EvaluationHealthFilter } from '../components/EvaluationFilterChips';
import GridListToggle from '../components/GridListToggle';
import type { DemoViewMode } from '../components/GridListToggle';
import DemoResultsPanel from '../components/DemoResultsPanel';
import DemoRosterPanel from '../components/DemoRosterPanel';
import DemoCampaignSettingsDrawer from '../components/DemoCampaignSettingsDrawer';
import styles from './DemoCampaignDetailPage.module.css';

const DemoCampaignDetailPage: React.FC = () => {
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();
	const campaign = getDemoCampaign(campaignId);
	const [healthFilter, setHealthFilter] = useState<EvaluationHealthFilter>('all');
	const [viewMode, setViewMode] = useState<DemoViewMode>('list');
	const [settingsOpened, setSettingsOpened] = useState(false);

	const evaluationColumns = useMemo<BaseTableColumnDef<DemoEvaluation>[]>(
		() => [
			{
				accessorKey: 'title',
				header: 'Evaluation Name',
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						<div className={styles.rowIcon}>
							{DEMO_CATEGORY_ICONS[row.original.category]}
						</div>
						<Text size='sm' fw={600} c='blue.7'>
							{row.original.title}
						</Text>
					</Group>
				),
			},
			{
				accessorKey: 'category',
				header: 'Category',
				cell: ({ row }) => (
					<Badge
						color={DEMO_CATEGORY_COLORS[row.original.category]}
						variant='light'
						size='sm'
					>
						{DEMO_CATEGORY_LABELS[row.original.category]}
					</Badge>
				),
				size: 180,
			},
			{
				accessorKey: 'stats.passRate',
				header: 'Pass Rate',
				cell: ({ row }) => (
					<Badge
						color={DEMO_HEALTH_COLORS[row.original.health]}
						variant='light'
						size='sm'
					>
						{row.original.stats.passRate}%
					</Badge>
				),
				size: 120,
			},
		],
		[]
	);

	const filteredEvaluations = useMemo(() => {
		if (!campaign) return [];
		if (healthFilter === 'all') return campaign.evaluations;
		return campaign.evaluations.filter((e) => e.health === healthFilter);
	}, [campaign, healthFilter]);

	if (!campaign) {
		return (
			<ContentContainer
				contentWidth='full'
				title='Campaign not found'
				showBackButton
				onBackClick={() => navigate('/evaluations-demo')}
			>
				<EmptyState message='This campaign does not exist in the demo data.' />
			</ContentContainer>
		);
	}

	const hasRoster = campaign.source !== 'CMX';

	const stats = [
		{
			key: 'totalEvaluations',
			title: 'Total Evaluations',
			value: campaign.stats.totalEvaluations,
			subtitle: 'For this group',
		},
		{
			key: 'totalCalls',
			title: 'Total Calls',
			value: campaign.stats.totalCalls,
			subtitle: 'In campaign',
		},
		{
			key: 'passRate',
			title: 'Pass Rate',
			value: `${campaign.stats.passRate}%`,
			subtitle: 'Evaluations passed',
		},
		{
			key: 'analyzedToday',
			title: 'Analyzed Today',
			value: campaign.stats.analyzedToday,
			subtitle: 'Calls',
		},
		{
			key: 'autoFails',
			title: 'Auto Fails',
			value: campaign.stats.autoFails,
			subtitle: 'Automatically failed calls',
			color: 'var(--mantine-color-red-6)',
			badge: (
				<Badge variant='light' color='gray' size='sm'>
					This week
				</Badge>
			),
		},
		{
			key: 'disputes',
			title: 'Disputes',
			value: campaign.stats.disputes,
			subtitle: 'Disputed or review requested',
			color: 'var(--mantine-color-orange-6)',
			badge: (
				<Badge variant='light' color='gray' size='sm'>
					This week
				</Badge>
			),
		},
	];

	return (
		<ContentContainer
			contentWidth='full'
			title={
				<Breadcrumbs>
					<Anchor onClick={() => navigate('/evaluations-demo')} size='sm'>
						Campaigns
					</Anchor>
					<Anchor component='span' size='sm' fw={600}>
						{campaign.groupLabel}
					</Anchor>
				</Breadcrumbs>
			}
			description='Available evaluations for this conversation group'
			titleRight={
				<Tooltip label='Settings' withArrow>
					<ActionIcon
						variant='default'
						size='lg'
						aria-label='Settings'
						onClick={() => setSettingsOpened(true)}
					>
						<IconSettings size={18} />
					</ActionIcon>
				</Tooltip>
			}
		>
			<Stack gap='md'>
				<DemoStatRow stats={stats} />

				<Tabs defaultValue='evaluations' color='green'>
					<Tabs.List>
						<Tabs.Tab value='evaluations' leftSection={<IconActivity size={16} />}>
							Evaluations
						</Tabs.Tab>
						<Tabs.Tab value='results' leftSection={<IconActivity size={16} />}>
							Results
						</Tabs.Tab>
						{hasRoster && (
							<Tabs.Tab value='roster' leftSection={<IconUsers size={16} />}>
								Roster
							</Tabs.Tab>
						)}
					</Tabs.List>

					<Tabs.Panel value='evaluations' pt='md'>
						<Stack gap='md'>
							<div className={styles.sectionHeader}>
								<div>
									<Title order={4}>Evaluations</Title>
									<Text size='sm' c='dimmed'>
										View results for each evaluation on this conversation group
									</Text>
								</div>
							</div>

							<div className={styles.toolbarRow}>
								<EvaluationFilterChips
									value={healthFilter}
									onChange={setHealthFilter}
								/>
								<GridListToggle value={viewMode} onChange={setViewMode} />
							</div>

							{filteredEvaluations.length === 0 ? (
								<EmptyState message='No evaluations match this filter.' />
							) : viewMode === 'grid' ? (
								<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
									{filteredEvaluations.map((evaluation) => (
										<EvaluationCard key={evaluation.id} evaluation={evaluation} />
									))}
								</SimpleGrid>
							) : (
								<BaseTable
									data={filteredEvaluations}
									columns={evaluationColumns}
									getRowId={(evaluation) => evaluation.id}
									onRowClick={(evaluation) => {
										if (evaluation.calls && evaluation.calls.length > 0) {
											navigate(
												`/role-preview/qa-campaigns/${campaign.id}/call/${evaluation.calls[0].id}`
											);
										}
									}}
									density='compact'
									filterMode='client'
									emptyMessage='No evaluations match this filter.'
								/>
							)}
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value='results' pt='md'>
						<DemoResultsPanel campaignId={campaign.id} results={campaign.results} />
					</Tabs.Panel>

					{hasRoster && (
						<Tabs.Panel value='roster' pt='md'>
							<DemoRosterPanel roster={campaign.roster} />
						</Tabs.Panel>
					)}
				</Tabs>
			</Stack>

			<DemoCampaignSettingsDrawer
				campaign={campaign}
				opened={settingsOpened}
				onClose={() => setSettingsOpened(false)}
			/>
		</ContentContainer>
	);
};

export default DemoCampaignDetailPage;
