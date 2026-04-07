import { useMemo, useState } from 'react';
import { Accordion, Badge, Group, Select, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { useGetOutboundCallTasks } from '~/queries/outboundQueries';
import { OutboundCallTaskStatus } from '~/models/ContactsModel';
import QueueWaveTable from './QueueWaveTable';
import ReorderControls from './ReorderControls';
import styles from './QueueTab.module.css';

interface QueueTabProps {
	contactGroupId: number;
	campaignId: number;
}

const STATUS_OPTIONS = Object.values(OutboundCallTaskStatus);

const QueueTab = ({ contactGroupId, campaignId }: QueueTabProps) => {
	const { t } = useTranslation('campaign.contact-list');
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

	const availableWaves = useMemo(() => {
		const tasks = waveDiscoveryQuery.data?.data ?? [];
		const waves = [...new Set(tasks.map((t) => t.waveNumber))].sort(
			(a, b) => a - b
		);
		return waves;
	}, [waveDiscoveryQuery.data]);

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
			<ReorderControls
				campaignId={campaignId}
				contactGroupId={contactGroupId}
				availableWaves={availableWaves}
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
										<Group gap='sm'>
											<Text size='sm' className={styles.waveHeader}>
												{t('queue.wave', { number: wave })}
											</Text>
											<Badge variant='light' size='sm' color='blue'>
												{t('queue.wave', { number: wave })}
											</Badge>
										</Group>
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
