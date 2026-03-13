import React, { useMemo } from 'react';
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

const DAY_ORDER = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];

const formatScheduleData = (
	scheduleSummary?: Array<{
		dayOfWeek: string;
		startHour: string;
		endHour: string;
	}>
): FormattedSchedule[] => {
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

	return DAY_ORDER.map((day) => dayMap[day]).filter(
		Boolean
	) as FormattedSchedule[];
};

const formatTime = (time: string) => {
	if (!time) return '';

	const [hours, minutes = '00'] = time.split(':');
	const hour = Number.parseInt(hours, 10);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

	return `${displayHour}:${minutes.padEnd(2, '0')} ${ampm}`;
};

const CampaignParameters: React.FC = () => {
	const { t } = useTranslation(['campaign.detail', 'campaign.form.params']);
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const {
		data: scheduleSummary,
		isLoading,
		refetch,
	} = useGetCampaignScheduleSummary(selectedCampaign?.id.toString() || '');

	const isFailed = selectedCampaign?.status === 'FAILED';
	const parameters = selectedCampaign?.parameters;
	const refreshLabel = isFailed
		? t('preview.parameters.campaignCompleted')
		: t('preview.parameters.refreshParameters');

	const handleRefetch = () => {
		if (!isFailed) {
			refetch();
		}
	};

	const getDayLabel = (day: string) => {
		const normalized = day.trim().toLowerCase();
		return t(`scheduler.schedulerBuilder.days.${normalized}`, {
			ns: 'campaign.form.params',
			defaultValue: day,
		});
	};

	const activeSchedules = useMemo(
		() => formatScheduleData(scheduleSummary),
		[scheduleSummary]
	);
	const parameterItems = useMemo<ParameterItem[]>(() => {
		return [
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
	}, [parameters, t]);
	const hasContent = activeSchedules.length > 0 || parameterItems.length > 0;
	const refreshAction = (
		<Tooltip label={refreshLabel} withArrow>
			<ActionIcon
				variant='subtle'
				color='gray'
				size='sm'
				onClick={handleRefetch}
				aria-label={refreshLabel}
				disabled={isFailed || isLoading}
				className={styles.refetchButton}
			>
				<IconRefresh size={14} />
			</ActionIcon>
		</Tooltip>
	);

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

	if (isLoading) {
		return (
			<RightSectionCard
				title={t('preview.parameters.title')}
				description={t('preview.parameters.description')}
				icon={IconMist}
				rightSection={refreshAction}
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
			rightSection={refreshAction}
		>
			<Stack gap='sm' className={styles.root}>
				{hasContent ? (
					<div className={styles.summaryPanel}>
						<Group gap='xs' className={styles.summaryBadges}>
							{activeSchedules.length > 0 && (
								<Badge variant='light' color='blue' size='sm'>
									{activeSchedules.length}{' '}
									{t('preview.parameters.day', {
										count: activeSchedules.length,
									})}
								</Badge>
							)}
							{parameterItems.length > 0 && (
								<Badge variant='light' color='gray' size='sm'>
									{parameterItems.length}{' '}
									{t('preview.parameters.setting', {
										count: parameterItems.length,
									})}
								</Badge>
							)}
						</Group>

						{activeSchedules.length > 0 && (
							<div className={styles.section}>
								<Text fw={600} size='xs' className={styles.sectionTitle}>
									{t('preview.parameters.activeWindows')}
								</Text>
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
								<Text fw={600} size='xs' className={styles.sectionTitle}>
									{t('preview.parameters.callHandling')}
								</Text>
								<div className={styles.parametersList}>
									{parameterItems.map((item) => (
										<div key={item.key} className={styles.parameterRow}>
											<Text
												size='xs'
												c='dimmed'
												className={styles.parameterLabel}
											>
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
												<Text
													size='sm'
													fw={600}
													className={styles.parameterValue}
												>
													{item.display}
												</Text>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<Text size='sm' c='dimmed' ta='center' className={styles.emptyState}>
						{t('preview.parameters.noSchedules')}
					</Text>
				)}
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignParameters;
