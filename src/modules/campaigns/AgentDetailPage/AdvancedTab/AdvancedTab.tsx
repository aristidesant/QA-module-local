import { Stack, Switch, Text } from '@mantine/core';
import { IconMicrophoneOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignConfigurationAsrKeywords from '../../CampaignsForm/AgentSection/CampaignConfigurationAsrKeywords';
import CampaignConfigurationDictionarySelector from '../../CampaignsForm/AgentSection/CampaignDictionarySelector';
import CampaignConfigurationDynamicVariables from '../../CampaignsForm/AgentSection/CampaignConfigurationDynamicVariables';
import CampaignConfigurationKnowledgeBase from '../../CampaignsForm/AgentSection/CampaignConfigurationKnowledgeBase';
import CampaignConfigurationSystemTools from '../../CampaignsForm/AgentSection/CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../../CampaignsForm/AgentSection/CampaignConfigurationTools';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './AdvancedTab.module.css';

interface AdvancedTabProps {
	agentId: string;
}

const AdvancedTab = ({ agentId }: AdvancedTabProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'campaigns']);
	const form = useCampaignFormContext();

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
				<CampaignConfigurationTools />
				<div className={styles.sectionCardWide}>
					<CampaignConfigurationKnowledgeBase />
				</div>
			</div>

			{/* Group 2: Speech & Language */}
			<div className={styles.groupLabel}>
				<Text className={styles.groupLabelText}>
					{t('agentDetail.advanced.groups.speechAndLanguage')}
				</Text>
				<div className={styles.groupLine} />
			</div>

			<div className={styles.grid}>
				<CampaignConfigurationAsrKeywords />
				<CampaignConfigurationDictionarySelector agentId={agentId} />
				<div className={styles.sectionCardWide}>
					<SectionCard
						icon={IconMicrophoneOff}
						title={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
						description={t('general.noiseCancellationDesc', {
							ns: 'campaigns',
						})}
						contentSpacing='xs'
					>
						<Switch
							label={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
							size='sm'
							checked={form.values.noiseCancellation ?? false}
							onChange={(event) =>
								form.setFieldValue(
									'noiseCancellation',
									event.currentTarget.checked
								)
							}
						/>
					</SectionCard>
				</div>
			</div>

			{/* Group 3: Runtime */}
			<div className={styles.groupLabel}>
				<Text className={styles.groupLabelText}>
					{t('agentDetail.advanced.groups.runtime')}
				</Text>
				<div className={styles.groupLine} />
			</div>

			<div className={styles.grid}>
				<div className={styles.sectionCardWide}>
					<CampaignConfigurationDynamicVariables />
				</div>
			</div>
		</Stack>
	);
};

export default AdvancedTab;
