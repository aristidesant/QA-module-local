import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, MultiSelect, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBook2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	usePronunciationDictionaries,
	useBulkAttachDictionariesToAgent,
	useDetachDictionaryFromAgent,
} from '~/queries/pronunciationDictionaryQueries';
import { useGetAgent } from '~/queries/agentQueries';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import styles from './StepTwoAgent.module.css';

const WizardDictionarySection: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const { createdCampaign } = useCampaignWizardStore();

	const agentId =
		createdCampaign?.agentConfig?.agentId ??
		createdCampaign?.agents?.[0]?.agentId ??
		null;

	const { data: agent, refetch: refetchAgent } = useGetAgent(agentId ?? '');
	const { data: dictionariesResponse, isLoading: isDictionariesLoading } =
		usePronunciationDictionaries();
	const dictionaries = dictionariesResponse?.data ?? [];
	const bulkAttach = useBulkAttachDictionariesToAgent();
	const detachDictionary = useDetachDictionaryFromAgent();

	const isSaving = bulkAttach.isPending || detachDictionary.isPending;

	// Derive all currently attached dictionaries from agent config
	const attachedElevenLabsIds = useMemo(() => {
		const locators =
			agent?.config?.conversationConfig?.tts?.pronunciationDictionaryLocators;
		if (!locators || locators.length === 0) return [];
		return (locators as unknown[])
			.map((locator) => {
				if (typeof locator === 'string') return locator;
				if (typeof locator === 'object' && locator !== null) {
					return (
						(locator as Record<string, string>).pronunciationDictionaryId ??
						null
					);
				}
				return null;
			})
			.filter(Boolean) as string[];
	}, [agent]);

	const attachedDictionaries = useMemo(
		() =>
			dictionaries.filter((d) =>
				attachedElevenLabsIds.includes(d.elevenLabsDictionaryId)
			),
		[attachedElevenLabsIds, dictionaries]
	);

	const [selectedValues, setSelectedValues] = useState<string[]>([]);

	// Track whether the initial sync from server data has been done.
	// We only auto-sync on first load and after an intentional save — never on
	// background refetches, which would silently discard the user's unsaved selection.
	const initializedRef = useRef(false);

	useEffect(() => {
		if (agent && !isDictionariesLoading && !initializedRef.current) {
			setSelectedValues(attachedDictionaries.map((d) => String(d.id)));
			initializedRef.current = true;
		}
	}, [attachedDictionaries, agent, isDictionariesLoading]);

	const selectData = useMemo(
		() => dictionaries.map((d) => ({ value: String(d.id), label: d.name })),
		[dictionaries]
	);

	const hasChanges = useMemo(() => {
		const currentIds = attachedDictionaries.map((d) => String(d.id)).sort();
		const selected = [...selectedValues].sort();
		if (currentIds.length !== selected.length) return true;
		return currentIds.some((id, i) => id !== selected[i]);
	}, [selectedValues, attachedDictionaries]);

	const handleSave = useCallback(async () => {
		if (!agentId) return;

		try {
			if (selectedValues.length > 0) {
				// Bulk-attach replaces the full set in one call
				await bulkAttach.mutateAsync({
					dictionaryIds: selectedValues.map(Number),
					agentId,
				});
			} else {
				// Endpoint requires min 1 entry — detach each remaining dict individually
				await Promise.all(
					attachedDictionaries.map((d) =>
						detachDictionary.mutateAsync({ dictionaryId: d.id, agentId })
					)
				);
			}
			notifications.show({
				title: t('wizard.steps.agent.dictionary.saveSuccess'),
				message: t('wizard.steps.agent.dictionary.saveSuccess'),
				color: 'green',
			});
			// Allow the effect to re-sync once after the refetch
			initializedRef.current = false;
			refetchAgent();
		} catch {
			notifications.show({
				title: t('wizard.steps.agent.dictionary.saveError'),
				message: t('wizard.steps.agent.dictionary.saveError'),
				color: 'red',
			});
		}
	}, [
		agentId,
		attachedDictionaries,
		selectedValues,
		bulkAttach,
		detachDictionary,
		refetchAgent,
		t,
	]);

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

			<MultiSelect
				data={selectData}
				value={selectedValues}
				onChange={setSelectedValues}
				placeholder={t('wizard.steps.agent.dictionary.selectPlaceholder')}
				size='sm'
				searchable
				clearable
				hidePickedOptions
				disabled={isDictionariesLoading}
			/>

			{dictionaries.length === 0 && !isDictionariesLoading && (
				<Text size='xs' c='dimmed'>
					{t('wizard.steps.agent.dictionary.noDictionariesHint')}
				</Text>
			)}

			{hasChanges && (
				<Group justify='flex-end' mt='xs'>
					<Button size='xs' loading={isSaving} onClick={handleSave}>
						{t('wizard.steps.agent.dictionary.save')}
					</Button>
				</Group>
			)}
		</div>
	);
};

export default WizardDictionarySection;
