import React, { useMemo, useState } from 'react';
import { Badge, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconVariable } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import CampaignDynamicVariablesModal from './CampaignDynamicVariablesModal';
import styles from './CampaignConfigurationDynamicVariables.module.css';

type DynamicVariableEntry = {
	key: string;
	value: string;
};

const CampaignConfigurationDynamicVariables: React.FC = () => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const form = useCampaignFormContext();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const placeholders: Record<string, any> =
		(form.values.agentConfig as any)?.conversationConfig?.agent
			?.dynamicVariables?.dynamicVariablePlaceholders ?? {};

	const count = Object.keys(placeholders).length;
	const previewEntries = useMemo<DynamicVariableEntry[]>(
		() =>
			Object.entries(placeholders).map(([key, value]) => ({
				key,
				value: String(value ?? ''),
			})),
		[placeholders]
	);

	const handleApply = (next: Record<string, string>) => {
		const currentAgentConfig = form.values.agentConfig || {};
		form.setFieldValue('agentConfig', {
			...currentAgentConfig,
			conversationConfig: deepMergeConfig(
				(currentAgentConfig as any).conversationConfig || {},
				{
					agent: {
						dynamicVariables: {
							dynamicVariablePlaceholders: next,
						},
					},
				}
			) as any,
		});
	};

	return (
		<>
			<RightSectionCard
				title={t('dynamicVariables.title')}
				description={t('dynamicVariables.description')}
				icon={IconVariable}
				iconColor='teal'
				onConfigure={() => setIsModalOpen(true)}
			>
				<Stack gap='xs'>
					<Group justify='space-between' align='center' wrap='wrap' gap='xs'>
						<Badge variant='light' color='teal'>
							{t('dynamicVariables.count', { count })}
						</Badge>
						<Text size='xs' c='dimmed'>
							{t('dynamicVariables.preview.readOnly')}
						</Text>
					</Group>

					{count === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('dynamicVariables.empty')}
						</Text>
					) : (
						<div className={styles.previewPanel}>
							<ScrollArea.Autosize mah={220} type='auto' offsetScrollbars='y'>
								<Stack gap={6} className={styles.previewList}>
									{previewEntries.map((entry) => (
										<div key={entry.key} className={styles.previewRow}>
											<div className={styles.previewKey}>{entry.key}</div>
											<div className={styles.previewValue}>
												{entry.value ||
													t('dynamicVariables.preview.emptyValue')}
											</div>
										</div>
									))}
								</Stack>
							</ScrollArea.Autosize>
						</div>
					)}
				</Stack>
			</RightSectionCard>

			<CampaignDynamicVariablesModal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				placeholders={placeholders}
				onApply={handleApply}
			/>
		</>
	);
};

export default CampaignConfigurationDynamicVariables;
