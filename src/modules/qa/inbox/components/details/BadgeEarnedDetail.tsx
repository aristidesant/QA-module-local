import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Avatar,
	Badge,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	VisuallyHidden,
} from '@mantine/core';
import dayjs from 'dayjs';
import type { NotificationPayload } from '~/models/qa/notifications';
import { TIER_COLORS } from '~/modules/qa/triggers/constants';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { agentNameOf, type InboxViewer } from '../../constants';

type BadgePayload = Extract<NotificationPayload, { kind: 'BADGE_EARNED' }>;

interface BadgeEarnedDetailProps {
	payload: BadgePayload;
	/** The agent who earned it; managers see them named beside the badge. */
	agentId: string;
	/** When the notification was raised, shown as the earned date. */
	earnedAt: string;
	viewer: InboxViewer;
}

/** The badge as a hero: emoji in a brand ring, name with its tier, the reason, and who else holds it. */
export const BadgeEarnedDetail: React.FC<BadgeEarnedDetailProps> = ({
	payload,
	agentId,
	earnedAt,
	viewer,
}) => {
	const { t } = useTranslation('qa.inbox');
	const holders =
		useTriggerRulesStore((s) => s.badges).find(
			(badge) => badge.id === payload.badgeId
		)?.holders.length ?? 0;
	const agentName = viewer === 'agent' ? null : agentNameOf(agentId);

	const earnedLine = [
		t('details.badge.earnedOn', {
			date: dayjs(earnedAt).format('DD MMM YYYY'),
		}),
		...(holders > 0 ? [t('details.badge.holders', { count: holders })] : []),
	].join(' · ');

	return (
		<Group gap='lg' wrap='nowrap' align='flex-start'>
			<ThemeIcon size={96} radius='xl' variant='light'>
				<Text fz={40} lh={1} aria-hidden>
					{payload.badgeIcon}
				</Text>
				<VisuallyHidden>{payload.badgeName}</VisuallyHidden>
			</ThemeIcon>
			<Stack gap={6}>
				<Group gap='xs' align='center'>
					<Title order={3}>{payload.badgeName}</Title>
					<Badge variant='light' color={TIER_COLORS[payload.tier]} size='sm'>
						{t(`details.badge.tier.${payload.tier}`)}
					</Badge>
				</Group>
				<Text size='sm'>{payload.reason}</Text>
				<Text size='xs' c='dimmed'>
					{earnedLine}
				</Text>
				{agentName && (
					<Group gap='xs' wrap='nowrap'>
						<Avatar name={agentName} size='sm' radius='xl' color='gray' />
						<Text size='sm'>{agentName}</Text>
					</Group>
				)}
			</Stack>
		</Group>
	);
};

export default BadgeEarnedDetail;
