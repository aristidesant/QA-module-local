import { Badge, Group, Text, UnstyledButton } from '@mantine/core';
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
		<div className={styles.root}>
			{label && (
				<Text size='xs' fw={600} c='dimmed'>
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
							<Text size='sm' fw={600} className={styles.name}>
								{campaignAgent.agent?.name || campaignAgent.agentId}
							</Text>
							<Group gap={4} mt={4} className={styles.badges}>
								<Badge
									size='xs'
									variant='light'
									color={campaignAgent.isPrincipal ? 'blue' : 'gray'}
								>
									{campaignAgent.isPrincipal
										? t('form.agent.selector.principal')
										: t('form.agent.selector.subagent')}
								</Badge>
								<Badge size='xs' variant='outline' color='dark'>
									{campaignAgent.agentType}
								</Badge>
							</Group>
						</UnstyledButton>
					);
				})}
			</div>
		</div>
	);
};

export default CampaignAgentSelector;
