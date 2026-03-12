import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Select,
	Text,
	Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBook2, IconUnlink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	usePronunciationDictionaries,
	useAttachDictionaryToAgent,
	useDetachDictionaryFromAgent,
} from '~/queries/pronunciationDictionaryQueries';
import { useGetAgent } from '~/queries/agentQueries';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import styles from './StepTwoAgent.module.css';

const NONE_VALUE = '__none__';

const WizardDictionarySection: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const { createdCampaign } = useCampaignWizardStore();

	// Get agentId from the campaign's agentConfig or agents array
	const agentId =
		createdCampaign?.agentConfig?.agentId ??
		createdCampaign?.agents?.[0]?.agentId ??
		null;

	const { data: agent, refetch: refetchAgent } = useGetAgent(agentId ?? '');
	const { data: dictionariesResponse, isLoading: isDictionariesLoading } =
		usePronunciationDictionaries();
	const dictionaries = dictionariesResponse?.data ?? [];
	const attachDictionary = useAttachDictionaryToAgent();
	const detachDictionary = useDetachDictionaryFromAgent();

	const isSaving = attachDictionary.isPending || detachDictionary.isPending;

	// Derive currently attached dictionary from agent config
	const attachedElevenLabsId = useMemo(() => {
		const locators =
			agent?.config?.conversationConfig?.tts?.pronunciationDictionaryLocators;
		if (!locators || locators.length === 0) return null;

		const first = locators[0];
		if (typeof first === 'string') return first;
		if (typeof first === 'object' && first !== null) {
			return (
				(first as Record<string, string>).pronunciationDictionaryId ?? null
			);
		}
		return null;
	}, [agent]);

	// Match ElevenLabs dictionary ID to our internal dictionary
	const attachedDictionary = useMemo(() => {
		if (!attachedElevenLabsId) return null;
		return (
			dictionaries.find(
				(d) => d.elevenLabsDictionaryId === attachedElevenLabsId
			) ?? null
		);
	}, [attachedElevenLabsId, dictionaries]);

	const [selectedValue, setSelectedValue] = useState<string | null>(null);

	useEffect(() => {
		if (attachedDictionary) {
			setSelectedValue(String(attachedDictionary.id));
		} else if (agent && !isDictionariesLoading) {
			setSelectedValue(NONE_VALUE);
		}
	}, [attachedDictionary, agent, isDictionariesLoading]);

	const selectData = useMemo(() => {
		return [
			{
				value: NONE_VALUE,
				label: t('wizard.steps.agent.dictionary.noDictionary'),
			},
			...dictionaries.map((d) => ({
				value: String(d.id),
				label: d.name,
			})),
		];
	}, [dictionaries, t]);

	const hasChanges = useMemo(() => {
		const currentId = attachedDictionary
			? String(attachedDictionary.id)
			: NONE_VALUE;
		return selectedValue !== currentId;
	}, [selectedValue, attachedDictionary]);

	const handleDetach = useCallback(() => {
		if (!attachedDictionary || !agentId) return;
		detachDictionary.mutate(
			{ dictionaryId: attachedDictionary.id, agentId },
			{
				onSuccess: () => {
					notifications.show({
						title: t('wizard.steps.agent.dictionary.detachSuccess'),
						message: t('wizard.steps.agent.dictionary.detachSuccess'),
						color: 'green',
					});
					setSelectedValue(NONE_VALUE);
					refetchAgent();
				},
				onError: () => {
					notifications.show({
						title: t('wizard.steps.agent.dictionary.saveError'),
						message: t('wizard.steps.agent.dictionary.saveError'),
						color: 'red',
					});
				},
			}
		);
	}, [attachedDictionary, agentId, detachDictionary, refetchAgent, t]);

	const handleSave = useCallback(() => {
		if (!selectedValue || !agentId) return;

		if (selectedValue === NONE_VALUE) {
			// Detach — use the currently attached dictionary's ID
			if (!attachedDictionary) return;
			detachDictionary.mutate(
				{ dictionaryId: attachedDictionary.id, agentId },
				{
					onSuccess: () => {
						notifications.show({
							title: t('wizard.steps.agent.dictionary.detachSuccess'),
							message: t('wizard.steps.agent.dictionary.detachSuccess'),
							color: 'green',
						});
						refetchAgent();
					},
					onError: () => {
						notifications.show({
							title: t('wizard.steps.agent.dictionary.saveError'),
							message: t('wizard.steps.agent.dictionary.saveError'),
							color: 'red',
						});
					},
				}
			);
		} else {
			attachDictionary.mutate(
				{ dictionaryId: Number(selectedValue), agentId },
				{
					onSuccess: () => {
						notifications.show({
							title: t('wizard.steps.agent.dictionary.saveSuccess'),
							message: t('wizard.steps.agent.dictionary.saveSuccess'),
							color: 'green',
						});
						refetchAgent();
					},
					onError: () => {
						notifications.show({
							title: t('wizard.steps.agent.dictionary.saveError'),
							message: t('wizard.steps.agent.dictionary.saveError'),
							color: 'red',
						});
					},
				}
			);
		}
	}, [
		selectedValue,
		agentId,
		attachedDictionary,
		attachDictionary,
		detachDictionary,
		refetchAgent,
		t,
	]);

	// Don't render if no agent is available yet
	if (!agentId) return null;

	return (
		<div className={styles.sectionCard}>
			<div className={styles.sectionHeader}>
				<IconBook2 size={20} className={styles.sectionIcon} />
				<h3 className={styles.sectionTitle}>
					{t('wizard.steps.agent.dictionary.title')}
				</h3>
			</div>
			<Text className={styles.sectionDescription}>
				{t('wizard.steps.agent.dictionary.description')}
			</Text>

			<Select
				data={selectData}
				value={selectedValue}
				onChange={setSelectedValue}
				placeholder={t('wizard.steps.agent.dictionary.selectPlaceholder')}
				size='sm'
				searchable
				disabled={isDictionariesLoading}
			/>

			{dictionaries.length === 0 && !isDictionariesLoading && (
				<Text size='xs' c='dimmed'>
					{t('wizard.steps.agent.dictionary.noDictionariesHint')}
				</Text>
			)}

			<Group justify='flex-end' mt='xs' gap='xs'>
				{attachedDictionary && (
					<Tooltip label={t('wizard.steps.agent.dictionary.detach')}>
						<ActionIcon
							variant='light'
							color='red'
							size='sm'
							loading={detachDictionary.isPending}
							onClick={handleDetach}
						>
							<IconUnlink size={14} />
						</ActionIcon>
					</Tooltip>
				)}
				{hasChanges && (
					<Button size='xs' loading={isSaving} onClick={handleSave}>
						{t('wizard.steps.agent.dictionary.save')}
					</Button>
				)}
			</Group>
		</div>
	);
};

export default WizardDictionarySection;
