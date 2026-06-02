import React, { useMemo, useState } from 'react';
import { Badge, Button, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconVariable, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useAgentConfigFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { deepMergeConfig } from '~/utils/objectUtils';
import CampaignDynamicVariablesModal from './CampaignDynamicVariablesModal';
import styles from './CampaignConfigurationDynamicVariables.module.css';

type DynamicVariableEntry = {
	key: string;
	value: string;
};

const CampaignConfigurationDynamicVariables: React.FC = () => {
	const { t } = useTranslation(['campaign.form.agents', 'common']);
	const form = useAgentConfigFormContext();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const placeholders: Record<string, any> =
		(form.values as any)?.conversationConfig?.agent?.dynamicVariables
			?.dynamicVariablePlaceholders ?? {};

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
		form.setValues({
			...form.values,
			conversationConfig: deepMergeConfig(
				(form.values as any).conversationConfig || {},
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

	const headerActions = (
		<Group gap='xs' align='center' wrap='nowrap'>
			{count > 0 && (
				<Badge variant='dot' color='green' size='sm'>
					{t('dynamicVariables.count', { count })}
				</Badge>
			)}
			<Button
				size='compact-sm'
				variant='light'
				leftSection={<IconSettings size={14} />}
				onClick={() => setIsModalOpen(true)}
			>
				{t('dynamicVariables.configure')}
			</Button>
		</Group>
	);

	return (
		<>
			<SectionCard
				title={t('dynamicVariables.title')}
				description={t('dynamicVariables.description')}
				icon={IconVariable}
				headerActions={headerActions}
				contentSpacing='xs'
			>
				{count === 0 ? (
					<Stack align='center' gap='sm' py='sm'>
						<IconVariable
							size={36}
							color='var(--mantine-color-gray-4)'
							stroke={1.5}
						/>
						<Text size='sm' c='dimmed' ta='center'>
							{t('dynamicVariables.empty')}
						</Text>
						<Button
							size='compact-sm'
							variant='light'
							leftSection={<IconSettings size={14} />}
							onClick={() => setIsModalOpen(true)}
						>
							{t('dynamicVariables.configure')}
						</Button>
					</Stack>
				) : (
					<div className={styles.previewPanel}>
						<div className={styles.previewColHeaders}>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' lts='0.05em'>
								{t('dynamicVariables.keyPlaceholder')}
							</Text>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' lts='0.05em'>
								{t('dynamicVariables.valuePlaceholder')}
							</Text>
						</div>

						<ScrollArea.Autosize mah={200} type='auto' offsetScrollbars='y'>
							<div className={styles.previewList}>
								{previewEntries.map((entry) => (
									<div key={entry.key} className={styles.previewRow}>
										<div className={styles.previewKey}>{entry.key}</div>
										<div
											className={
												entry.value
													? styles.previewValue
													: styles.previewValueEmpty
											}
										>
											{entry.value || t('dynamicVariables.preview.emptyValue')}
										</div>
									</div>
								))}
							</div>
						</ScrollArea.Autosize>
					</div>
				)}
			</SectionCard>

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
