import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { IconUserCircle, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import { AGENT_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import type { Agent } from '~/models/qa';
import classes from './AgentSummaryCard.module.css';

export interface AgentSummaryCardProps {
	agent?: Agent | null;
}

export default function AgentSummaryCard({ agent }: AgentSummaryCardProps) {
	const { t } = useTranslation('qa.evaluations');
	const agentHasName = Boolean(agent?.firstName || agent?.lastName);
	const agentDisplayName = agent
		? [agent.firstName, agent.lastName].filter(Boolean).join(' ') ||
			agent.employeeId
		: '';
	const agentInitials =
		agentDisplayName
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('') || '?';
	const showAgentEmployeeId = Boolean(
		agent && agentDisplayName !== agent.employeeId
	);

	return (
		<SectionCard icon={IconUserCircle} title={t('agent.sectionTitle')}>
			{agent ? (
				<Group align='flex-start' gap='md' wrap='nowrap'>
					<Avatar
						className={classes.agentAvatar}
						color={AGENT_TYPE_COLORS[agent.agentType]}
						radius='xl'
						size={52}
					>
						{agentHasName ? agentInitials : <IconUserCircle size={26} />}
					</Avatar>
					<Stack gap={6} miw={0}>
						<div>
							<Text fw={700} lineClamp={1} size='md'>
								{agentDisplayName}
							</Text>
							{showAgentEmployeeId ? (
								<Text c='dimmed' ff='monospace' lineClamp={1} size='xs'>
									{agent.employeeId}
								</Text>
							) : null}
						</div>
						<Group gap='xs'>
							<Badge
								color={AGENT_TYPE_COLORS[agent.agentType]}
								size='sm'
								variant='light'
							>
								{t(
									`agent.types.${
										agent.agentType === 'AI_BOT' ? 'aiBot' : 'human'
									}`
								)}
							</Badge>
							{agent.team ? (
								<Badge
									color='gray'
									leftSection={<IconUsers size={12} />}
									size='sm'
									variant='light'
								>
									{agent.team}
								</Badge>
							) : null}
						</Group>
					</Stack>
				</Group>
			) : (
				<Text c='dimmed' size='sm'>
					{t('agent.unavailable')}
				</Text>
			)}
		</SectionCard>
	);
}
