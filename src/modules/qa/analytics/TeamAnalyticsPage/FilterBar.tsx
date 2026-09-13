import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Button, Badge, Tooltip } from '@mantine/core';
import { IconAdjustments, IconX } from '@tabler/icons-react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { filterChips, activeFilterCount } from '../helpers';
import FilterDrawer from './FilterDrawer';
import styles from './TeamAnalyticsPage.module.css';

export default function FilterBar() {
	const { t } = useTranslation('qa.teamAnalytics');
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const { filters, resetFilters } = useTeamAnalyticsStore();

	const chips = filterChips(filters);
	const activeCount = activeFilterCount(filters);

	const chipLabels: Record<string, string> = {
		period: t('filters.period'),
		granularity: t('filters.granularity'),
		supervisorIds: t('filters.supervisors'),
		agentIds: t('filters.agents'),
		campaignIds: t('filters.campaigns'),
		linesOfBusiness: t('filters.lineOfBusiness'),
		campaignTypes: t('filters.campaignType'),
		directions: t('filters.callDirection'),
		shifts: t('filters.shift'),
		tenureBands: t('filters.tenure'),
		timeSlots: t('filters.timeOfDay'),
		weekdays: t('filters.weekday'),
		emotions: t('filters.emotions'),
		qascoringFlags: t('filters.qascoringFlags'),
		scoreRange: t('filters.scoreRange'),
		minCalls: t('filters.minCalls'),
	};

	return (
		<>
			<div className={styles.filterBar}>
				<Group gap='xs' wrap='wrap'>
					<Tooltip label={t('filters.detail')} withArrow>
						<Button
							leftSection={<IconAdjustments size={16} />}
							variant='light'
							size='sm'
							onClick={() => setFilterDrawerOpen(true)}
						>
							{t('filters.label')}
							{activeCount > 0 && (
								<Badge size='xs' variant='filled' ml='xs'>
									{activeCount}
								</Badge>
							)}
						</Button>
					</Tooltip>

					{chips.length > 0 && (
						<>
							<Group gap={4}>
								{chips.map((chip) => (
									<Badge key={chip.key} variant='dot' size='lg'>
										{chipLabels[chip.key] || chip.key}:{' '}
										{chip.values.slice(0, 2).join(', ')}
									</Badge>
								))}
							</Group>

							<Tooltip label={t('common.clearAll')} withArrow>
								<Button
									variant='subtle'
									size='xs'
									rightSection={<IconX size={14} />}
									onClick={() => resetFilters()}
								>
									{t('common.clear')}
								</Button>
							</Tooltip>
						</>
					)}
				</Group>
			</div>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={() => setFilterDrawerOpen(false)}
			/>
		</>
	);
}
