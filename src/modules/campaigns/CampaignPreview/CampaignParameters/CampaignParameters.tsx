import React from 'react';
import {
	Text,
	Stack,
	Group,
	Badge,
	Skeleton,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { IconRefresh, IconMist } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './CampaignParameters.module.css';
import { useGetCampaignScheduleSummary } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import RightSectionCard from '~/components/RightSectionCard';

type FormattedSchedule = {
	day: string;
	startHour: string;
	endHour: string;
};

type ParameterItem =
	| {
			key: string;
			label: string;
			type: 'status';
			display: string;
			color: string;
	  }
	| {
			key: string;
			label: string;
			type: 'text';
			display: string;
	  };

const CampaignParameters: React.FC = () => {
	const { t } = useTranslation('campaign.detail');
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const {
		data: scheduleSummary,
		isLoading,
		refetch,
	} = useGetCampaignScheduleSummary(selectedCampaign?.id.toString() || '');

	const isFailed = selectedCampaign?.status === 'FAILED';

	const handleRefetch = () => {
		if (!isFailed) {
			refetch();
		}
	};

	const formatScheduleData = (): FormattedSchedule[] => {
		if (!scheduleSummary || scheduleSummary.length === 0) {
			return [];
		}

		const dayMap: Record<string, FormattedSchedule> = {};

		scheduleSummary.forEach((schedule) => {
			const dayKey = schedule.dayOfWeek.toLowerCase();
			if (!dayMap[dayKey]) {
				dayMap[dayKey] = {
					day: schedule.dayOfWeek,
					startHour: schedule.startHour,
					endHour: schedule.endHour,
				};
			}
		});

		const dayOrder = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday',
		];

		return dayOrder
			.map((day) => dayMap[day])
			.filter(Boolean) as FormattedSchedule[];
	};

	const formatTime = (time: string) => {
		if (!time) return '';
		const [hours, minutes = '00'] = time.split(':');
		const hour = Number.parseInt(hours, 10);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes.padEnd(2, '0')} ${ampm}`;
	};

	const getDayLabel = (day: string) => {
		const normalized = day.trim().toLowerCase();
		return t(`scheduler.schedulerBuilder.days.${normalized}`, {
			ns: 'campaigns',
			defaultValue: day,
		});
	};

	if (!selectedCampaign) {
		return (
			<RightSectionCard
				title={t('preview.parameters.title')}
				description={t('preview.parameters.description')}
				icon={IconMist}
			>
				<></>
			</RightSectionCard>
		);
	}

	const activeSchedules = formatScheduleData();
	const parameters = selectedCampaign.parameters;

	const parameterItems: ParameterItem[] = [
		parameters?.voicemailDetection !== undefined && {
			key: 'voicemailDetection',
			label: t('preview.parameters.voicemailDetection'),
			type: 'status',
			display: parameters.voicemailDetection
				? t('preview.parameters.enabled')
				: t('preview.parameters.disabled'),
			color: parameters.voicemailDetection ? 'teal' : 'gray',
		},
		parameters?.callRetries !== undefined && {
			key: 'callRetries',
			label: t('preview.parameters.callRetries'),
			type: 'text',
			display: t('preview.parameters.upToTimes', {
				count: parameters.callRetries,
			}),
		},
		parameters?.maxConcurrentCalls != null && {
			key: 'maxConcurrentCalls',
			label: t('preview.parameters.maxConcurrentCalls'),
			type: 'text',
			display: t('preview.parameters.calls', {
				count: parameters.maxConcurrentCalls,
			}),
		},
		parameters?.answerMachineDetection !== undefined && {
			key: 'answerMachineDetection',
			label: t('preview.parameters.answerMachineDetection'),
			type: 'status',
			display: parameters.answerMachineDetection
				? t('preview.parameters.enabled')
				: t('preview.parameters.disabled'),
			color: parameters.answerMachineDetection ? 'teal' : 'gray',
		},
	].filter(Boolean) as ParameterItem[];

	if (isLoading) {
		return (
			<RightSectionCard
				title={t('preview.parameters.title')}
				description={t('preview.parameters.description')}
				icon={IconMist}
				rightSection={
					<Tooltip
						label={
							isFailed
								? t('preview.parameters.campaignCompleted')
								: t('preview.parameters.refreshParameters')
						}
						withArrow
					>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							onClick={handleRefetch}
							aria-label={
								isFailed
									? t('preview.parameters.campaignCompleted')
									: t('preview.parameters.refreshParameters')
							}
							disabled={isFailed || isLoading}
							className={styles.refetchButton}
						>
							<IconRefresh size={14} />
						</ActionIcon>
					</Tooltip>
				}
			>
				<Stack gap='xs'>
					<Skeleton height={12} radius='xl' />
					<Skeleton height={48} radius='md' />
					<Skeleton height={88} radius='md' />
				</Stack>
			</RightSectionCard>
		);
	}

	return (
		<RightSectionCard
			title={t('preview.parameters.title')}
			description={t('preview.parameters.description')}
			icon={IconMist}
			rightSection={
				<Tooltip
					label={
						isFailed
							? t('preview.parameters.campaignCompleted')
							: t('preview.parameters.refreshParameters')
					}
					withArrow
				>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='sm'
						aria-label={
							isFailed
								? t('preview.parameters.campaignCompleted')
								: t('preview.parameters.refreshParameters')
						}
						onClick={handleRefetch}
						disabled={isFailed || isLoading}
						className={styles.refetchButton}
					>
						<IconRefresh size={14} />
					</ActionIcon>
				</Tooltip>
			}
		>
			<Stack gap='sm' className={styles.root}>
				{activeSchedules.length > 0 && (
					<div className={styles.section}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm' className={styles.sectionTitle}>
								{t('preview.parameters.activeWindows')}
							</Text>
							<Badge variant='light' color='blue' size='sm'>
								{activeSchedules.length}{' '}
								{t('preview.parameters.day', { count: activeSchedules.length })}
							</Badge>
						</Group>
						<div className={styles.scheduleList}>
							{activeSchedules.map((schedule) => (
								<div
									key={`${schedule.day}-${schedule.startHour}`}
									className={styles.scheduleChip}
								>
									<Text size='xs' fw={700} className={styles.dayLabel}>
										{getDayLabel(schedule.day)}
									</Text>
									<Text size='xs' c='dimmed' className={styles.timeRange}>
										{formatTime(schedule.startHour)} -{' '}
										{formatTime(schedule.endHour)}
									</Text>
								</div>
							))}
						</div>
					</div>
				)}

				{parameterItems.length > 0 && (
					<div className={styles.section}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm' className={styles.sectionTitle}>
								{t('preview.parameters.callHandling')}
							</Text>
							<Badge variant='light' color='blue' size='sm'>
								{parameterItems.length}{' '}
								{t('preview.parameters.setting', {
									count: parameterItems.length,
								})}
							</Badge>
						</Group>
						<div className={styles.parametersGrid}>
							{parameterItems.map((item) => (
								<div key={item.key} className={styles.parameterCard}>
									<Text size='xs' c='dimmed' className={styles.parameterLabel}>
										{item.label}
									</Text>
									{item.type === 'status' ? (
										<Badge
											size='sm'
											variant='light'
											color={item.color}
											radius='sm'
											className={styles.parameterBadge}
										>
											{item.display}
										</Badge>
									) : (
										<Text size='sm' fw={600} className={styles.parameterValue}>
											{item.display}
										</Text>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{activeSchedules.length === 0 && parameterItems.length === 0 && (
					<Text size='sm' c='dimmed' ta='center' className={styles.emptyState}>
						{t('preview.parameters.noSchedules')}
					</Text>
				)}
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignParameters;
