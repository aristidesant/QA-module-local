import {
	Avatar,
	Badge,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { AgentProfile } from '../types';
import { TEAM_CAMPAIGNS } from '../mockData';
import { formatTenure } from '../helpers';
import { AgentDetailsPopover } from './AgentDetailsPopover';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';
import { ScorecardStrip } from './ScorecardStrip';

/** Burnout is the only status that earns colour, and only when it is a concern. */
const BURNOUT_COLOR = { low: 'gray', medium: 'yellow', high: 'red' } as const;
/** How many tags show beside the name before "+N". */
const VISIBLE_TAGS = 2;

interface ProfileHeaderProps extends Omit<ProfileActionsProps, 'size'> {
	profile: AgentProfile;
	burnoutLevel: 'low' | 'medium' | 'high';
}

export function ProfileHeader({
	profile,
	burnoutLevel,
	onScheduleCoaching,
	onAssignLms,
	onSendMessage,
}: ProfileHeaderProps) {
	const { t } = useTranslation('qa.team');
	const { agent } = profile;
	const campaignNames = agent.campaignIds
		.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
		.filter((name): name is string => Boolean(name));
	const tags = [...campaignNames, ...agent.skills];
	const hiddenTags = Math.max(0, tags.length - VISIBLE_TAGS);

	return (
		<SectionCard padding='lg'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<Avatar size={56} radius='md' color='gray' name={agent.name} />
						<Stack gap={4}>
							<Group gap='xs'>
								<Title order={2}>{agent.name}</Title>
								{agent.status !== 'active' && (
									<Badge variant='light' color='gray'>
										{t(`status.${agent.status}`)}
									</Badge>
								)}
								{burnoutLevel !== 'low' && (
									<Badge variant='dot' color={BURNOUT_COLOR[burnoutLevel]}>
										{t('header.burnoutRisk', {
											level: t(`burnout.${burnoutLevel}`),
										})}
									</Badge>
								)}
							</Group>
							<Text size='sm' c='dimmed'>
								{agent.team} · {agent.supervisorName} ·{' '}
								{t(`header.shift.${agent.shift}`)}
							</Text>
							<Group gap={6} wrap='wrap'>
								{tags.slice(0, VISIBLE_TAGS).map((tag) => (
									<Badge key={tag} variant='light' color='gray' size='sm'>
										{tag}
									</Badge>
								))}
								{hiddenTags > 0 && (
									<Badge variant='outline' color='gray' size='sm'>
										+{hiddenTags}
									</Badge>
								)}
								<Text size='xs' c='dimmed'>
									{t('header.tenure', { tenure: formatTenure(agent.hireDate) })}{' '}
									· {t('header.evaluations', { count: profile.qa.evaluations })}
								</Text>
								<AgentDetailsPopover
									agent={agent}
									campaignNames={campaignNames}
								/>
							</Group>
						</Stack>
					</Group>

					<ProfileActions
						onScheduleCoaching={onScheduleCoaching}
						onAssignLms={onAssignLms}
						onSendMessage={onSendMessage}
					/>
				</Group>

				<Divider />

				<ScorecardStrip profile={profile} />
			</Stack>
		</SectionCard>
	);
}
