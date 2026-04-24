import { useMemo, useState, useCallback } from 'react';
import { Accordion, Badge, Group, Select, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import ReloadAction from '../ContactListActions/ReloadAction';
import {
	useGetOutboundCallTasks,
	useGetQueueProgress,
	outboundTaskKeys,
} from '~/queries/outboundQueries';
import {
	OutboundCallTaskStatus,
	type WaveProgress,
} from '~/models/ContactsModel';
import QueueWaveTable from './QueueWaveTable';
import QueueProgressBar from './QueueProgressBar';
import WaveProgressHeader from './WaveProgressHeader';
import ReorderControls from './ReorderControls';
import styles from './QueueTab.module.css';

interface QueueTabProps {
	contactGroupId: number;
	campaignId: number;
}

const STATUS_OPTIONS = Object.values(OutboundCallTaskStatus);

const QueueTab = ({ contactGroupId, campaignId }: QueueTabProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [waveFilter, setWaveFilter] = useState<string | null>(null);

	// Fetch a small batch to detect available waves
	const allTasksQuery = useGetOutboundCallTasks({
		contactGroupId,
		campaignId,
		limit: 1,
		offset: 0,
	});

	// Fetch tasks grouped by wave to discover wave numbers
	// We use a broader query to get wave numbers from existing task data
	const waveDiscoveryQuery = useGetOutboundCallTasks({
		contactGroupId,
		campaignId,
		limit: 500,
		offset: 0,
	});

	// Queue progress data (global + per-wave)
	const progressQuery = useGetQueueProgress(contactGroupId, campaignId);

	const availableWaves = useMemo(() => {
		const tasks = waveDiscoveryQuery.data?.data ?? [];
		const waves = [...new Set(tasks.map((t) => t.waveNumber))].sort(
			(a, b) => a - b
		);
		return waves;
	}, [waveDiscoveryQuery.data]);

	// Map wave progress data by waveNumber for quick lookup
	const waveProgressMap = useMemo(() => {
		const map = new Map<number, WaveProgress>();
		if (progressQuery.data?.waves) {
			for (const w of progressQuery.data.waves) {
				map.set(w.waveNumber, w);
			}
		}
		return map;
	}, [progressQuery.data]);

	const totalTasks = allTasksQuery.data?.total ?? 0;

	const statusOptions = useMemo(
		() => [
			{ value: '', label: t('queue.filters.allStatuses') },
			...STATUS_OPTIONS.map((s) => ({
				value: s,
				label: t(`queue.status.${s}`, { defaultValue: s }),
			})),
		],
		[t]
	);

	const waveOptions = useMemo(
		() => [
			{ value: '', label: t('queue.filters.allWaves') },
			...availableWaves.map((w) => ({
				value: String(w),
				label: t('queue.wave', { number: w }),
			})),
		],
		[availableWaves, t]
	);

	const handleRefresh = useCallback(() => {
		progressQuery.refetch();
		queryClient.invalidateQueries({ queryKey: outboundTaskKeys.all });
	}, [progressQuery, queryClient]);

	// Determine which waves to display
	const displayWaves = useMemo(() => {
		if (waveFilter) return [Number(waveFilter)];
		return availableWaves;
	}, [waveFilter, availableWaves]);

	if (allTasksQuery.isLoading) {
		return (
			<SectionCard
				title={t('queue.title')}
				description={t('queue.description')}
			>
				<Text size='sm' c='dimmed' ta='center'>
					{t('common:loading', { defaultValue: 'Loading...' })}
				</Text>
			</SectionCard>
		);
	}

	if (allTasksQuery.isSuccess && totalTasks === 0) {
		return (
			<SectionCard
				title={t('queue.title')}
				description={t('queue.description')}
			>
				<EmptyState
					icon={<IconRefresh size={48} />}
					message={t('queue.emptyState')}
					description={
						<Text size='sm' c='dimmed' ta='center'>
							{t('queue.emptyStateDesc')}
						</Text>
					}
				/>
			</SectionCard>
		);
	}

	return (
		<Stack gap='md'>
			{progressQuery.data?.global && (
				<QueueProgressBar progress={progressQuery.data.global} />
			)}

			<ReorderControls
				campaignId={campaignId}
				contactGroupId={contactGroupId}
			/>

			<SectionCard
				title={t('queue.title')}
				description={t('queue.description')}
			>
				<Stack gap='sm'>
					<Group className={styles.filters}>
						<Select
							size='sm'
							label={t('queue.filters.status')}
							data={statusOptions}
							value={statusFilter ?? ''}
							onChange={(v) => setStatusFilter(v || null)}
							w={180}
						/>
						<Select
							size='sm'
							label={t('queue.filters.wave')}
							data={waveOptions}
							value={waveFilter ?? ''}
							onChange={(v) => setWaveFilter(v || null)}
							w={180}
						/>
						<ReloadAction
							tooltip={t('queue.refresh')}
							onClick={handleRefresh}
						/>
					</Group>

					{displayWaves.length === 1 ? (
						<QueueWaveTable
							contactGroupId={contactGroupId}
							campaignId={campaignId}
							waveNumber={displayWaves[0]}
							statusFilter={statusFilter ?? undefined}
						/>
					) : (
						<Accordion
							variant='separated'
							multiple
							defaultValue={displayWaves.map(String)}
						>
							{displayWaves.map((wave) => (
								<Accordion.Item key={wave} value={String(wave)}>
									<Accordion.Control>
										{waveProgressMap.has(wave) ? (
											<WaveProgressHeader wave={waveProgressMap.get(wave)!} />
										) : (
											<Group gap='sm'>
												<Text size='sm' className={styles.waveHeader}>
													{t('queue.wave', { number: wave })}
												</Text>
												<Badge variant='light' size='sm' color='blue'>
													{t('queue.wave', { number: wave })}
												</Badge>
											</Group>
										)}
									</Accordion.Control>
									<Accordion.Panel>
										<QueueWaveTable
											contactGroupId={contactGroupId}
											campaignId={campaignId}
											waveNumber={wave}
											statusFilter={statusFilter ?? undefined}
										/>
									</Accordion.Panel>
								</Accordion.Item>
							))}
						</Accordion>
					)}
				</Stack>
			</SectionCard>
		</Stack>
	);
};

export default QueueTab;
