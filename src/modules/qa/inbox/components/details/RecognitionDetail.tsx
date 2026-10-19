import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Group,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	VisuallyHidden,
} from '@mantine/core';
import {
	IconFlame,
	IconStar,
	IconTrendingUp,
	IconTrophy,
} from '@tabler/icons-react';
import type { NotificationPayload } from '~/models/qa/notifications';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import { DeltaText } from './Fact';
import styles from '../Inbox.module.css';

type RecognitionPayload = Extract<NotificationPayload, { kind: 'RECOGNITION' }>;

/** Streak tiles beyond this many collapse into a "+N". */
const MAX_STREAK_TILES = 12;

const HEADLINE_ICON = {
	STREAK: IconFlame,
	IMPROVEMENT: IconTrendingUp,
	MILESTONE: IconTrophy,
} as const;

/** An automatic recognition: what was achieved, in the brand accent, with a strip of weeks for a streak. */
export const RecognitionDetail: React.FC<{ payload: RecognitionPayload }> = ({
	payload,
}) => {
	const { t } = useTranslation('qa.inbox');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');
	const Icon = HEADLINE_ICON[payload.type];
	const metricLabel = payload.metricId
		? tAnalytics(`metrics.${payload.metricId}`)
		: null;

	const headline =
		payload.type === 'STREAK'
			? t('details.recognition.STREAK', { count: payload.streakWeeks ?? 0 })
			: payload.type === 'IMPROVEMENT'
				? t('details.recognition.IMPROVEMENT', { delta: payload.deltaPct ?? 0 })
				: t('details.recognition.MILESTONE');

	const weeks = Math.min(payload.streakWeeks ?? 0, MAX_STREAK_TILES);
	const extraWeeks = (payload.streakWeeks ?? 0) - weeks;

	return (
		<Stack gap='md'>
			<Group gap='md' wrap='nowrap' align='flex-start'>
				<ThemeIcon size='xl' radius='md' variant='light'>
					<Icon size={26} />
				</ThemeIcon>
				<Stack gap={2}>
					<Text fw={600}>{headline}</Text>
					<Text size='sm' c='dimmed'>
						{t('details.recognition.keepItUp')}
					</Text>
				</Stack>
			</Group>

			{payload.type === 'STREAK' && weeks > 0 && (
				<Group gap='xs' wrap='wrap' align='flex-end'>
					{Array.from({ length: weeks }, (_, index) => index + 1).map(
						(week) => (
							<Stack key={week} gap={4} align='center'>
								<Paper withBorder radius='md' className={styles.streakTile}>
									<IconStar size={16} aria-hidden />
									<VisuallyHidden>
										{t('details.recognition.week', { n: week })}
									</VisuallyHidden>
								</Paper>
								<Text size='xs' c='dimmed' aria-hidden>
									{t('details.recognition.week', { n: week })}
								</Text>
							</Stack>
						)
					)}
					{extraWeeks > 0 && (
						<Text size='sm' c='dimmed'>
							+{extraWeeks}
						</Text>
					)}
				</Group>
			)}

			{payload.type === 'IMPROVEMENT' && (
				<Group gap='sm' align='baseline'>
					<DeltaText value={payload.deltaPct ?? null} suffix='%' size='lg' />
					{metricLabel && (
						<Text size='sm' c='dimmed'>
							{metricLabel}
						</Text>
					)}
				</Group>
			)}

			{payload.type === 'MILESTONE' &&
				payload.metricId &&
				payload.value !== undefined && (
					<Group gap='sm' align='baseline'>
						<Text size='xl' fw={700}>
							{formatMetricValue(payload.metricId, payload.value)}
						</Text>
						<Text size='sm' c='dimmed'>
							{metricLabel}
						</Text>
					</Group>
				)}
		</Stack>
	);
};

export default RecognitionDetail;
