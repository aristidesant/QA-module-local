import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import CampaignConfigurationDynamicVariables from '../../CampaignsForm/AgentSection/CampaignConfigurationDynamicVariables';
import CampaignConfigurationKnowledgeBase from '../../CampaignsForm/AgentSection/CampaignConfigurationKnowledgeBase';
import CampaignConfigurationSpeechLanguage from '../../CampaignsForm/AgentSection/CampaignConfigurationSpeechLanguage';
import CampaignConfigurationSystemTools from '../../CampaignsForm/AgentSection/CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../../CampaignsForm/AgentSection/CampaignConfigurationTools';
import styles from './AdvancedTab.module.css';

interface AdvancedTabProps {
	agentId: string;
}

const AdvancedTab = ({ agentId }: AdvancedTabProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'campaigns']);

	return (
		<Stack gap='lg' className={styles.container}>
			{/* Group 1: Tools & Knowledge */}
			<div className={styles.groupLabel}>
				<Text className={styles.groupLabelText}>
					{t('agentDetail.advanced.groups.toolsAndKnowledge')}
				</Text>
				<div className={styles.groupLine} />
			</div>

			<div className={styles.grid}>
				<CampaignConfigurationSystemTools />
				<div className={styles.rightStack}>
					<CampaignConfigurationTools />
					<CampaignConfigurationKnowledgeBase />
				</div>
			</div>

			{/* Groups 2 + 3: Speech, Language & Runtime — 50/50 */}
			<div className={styles.groupLabel}>
				<Text className={styles.groupLabelText}>
					{t('agentDetail.advanced.groups.speechLanguageRuntime')}
				</Text>
				<div className={styles.groupLine} />
			</div>

			<div className={styles.grid}>
				<CampaignConfigurationSpeechLanguage agentId={agentId} />
				<CampaignConfigurationDynamicVariables />
			</div>
		</Stack>
	);
};

export default AdvancedTab;
