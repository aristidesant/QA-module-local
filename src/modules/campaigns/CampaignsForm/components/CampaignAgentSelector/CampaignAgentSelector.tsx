import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { CampaignAgent } from '~/models/CampaignAgentModel';
import styles from './CampaignAgentSelector.module.css';

interface CampaignAgentSelectorProps {
	agents: CampaignAgent[];
	value?: number | null;
	onChange: (campaignAgentId: number) => void;
	label?: string;
}

const CampaignAgentSelector = ({
	agents,
	value,
	onChange,
	label,
}: CampaignAgentSelectorProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);

	if (agents.length === 0) {
		return null;
	}

	return (
		<Box className={styles.root}>
			{label && (
				<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
					{label}
				</Text>
			)}
			<div className={styles.list}>
				{agents.map((campaignAgent) => {
					const active = campaignAgent.id === value;

					return (
						<UnstyledButton
							key={campaignAgent.id}
							className={styles.option}
							data-active={active}
							onClick={() => onChange(campaignAgent.id)}
							aria-pressed={active}
						>
							<Stack gap={6} className={styles.content}>
								<Group justify='space-between' align='flex-start' gap='xs'>
									<Text size='sm' fw={700} className={styles.name}>
										{campaignAgent.agent?.name || campaignAgent.agentId}
									</Text>
									{active && (
										<Badge size='xs' variant='light' color='green'>
											{t('form.agent.selector.selected')}
										</Badge>
									)}
								</Group>
								<Group gap={6} className={styles.badges}>
									<Badge
										size='xs'
										variant='light'
										color={campaignAgent.isPrincipal ? 'green' : 'gray'}
									>
										{campaignAgent.isPrincipal
											? t('form.agent.selector.principal')
											: t('form.agent.selector.subagent')}
									</Badge>
									<Badge size='xs' variant='light' color='blue'>
										{campaignAgent.agentType}
									</Badge>
								</Group>
							</Stack>
						</UnstyledButton>
					);
				})}
			</div>
		</Box>
	);
};

export default CampaignAgentSelector;
