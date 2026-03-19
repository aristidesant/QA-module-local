import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, MultiSelect, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBook2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import { useGetAgent } from '~/queries/agentQueries';
import {
	usePronunciationDictionaries,
	useBulkAttachDictionariesToAgent,
	useDetachDictionaryFromAgent,
} from '~/queries/pronunciationDictionaryQueries';

interface CampaignDictionarySelectorProps {
	agentId: string;
}

const CampaignDictionarySelector: React.FC<CampaignDictionarySelectorProps> = ({
	agentId,
}) => {
	const { t } = useTranslation('campaigns');

	const { data: agent, refetch: refetchAgent } = useGetAgent(agentId);
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

	// Whether the current selection differs from the saved state
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
				title: t('general.pronunciationDictionary.notifications.saveSuccess'),
				message: t('general.pronunciationDictionary.notifications.saveSuccess'),
				color: 'green',
			});
			// Allow the effect to re-sync once after the refetch
			initializedRef.current = false;
			refetchAgent();
		} catch {
			notifications.show({
				title: t('general.pronunciationDictionary.notifications.saveError'),
				message: t('general.pronunciationDictionary.notifications.saveError'),
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

	return (
		<RightSectionCard
			title={t('general.pronunciationDictionary.title')}
			description={t('general.pronunciationDictionary.description')}
			icon={IconBook2}
			iconColor='var(--mantine-color-violet-6)'
		>
			<MultiSelect
				data={selectData}
				value={selectedValues}
				onChange={setSelectedValues}
				placeholder={t('general.pronunciationDictionary.selectPlaceholder')}
				size='sm'
				radius='md'
				searchable
				clearable
				hidePickedOptions
				disabled={isDictionariesLoading}
			/>
			{dictionaries.length === 0 && !isDictionariesLoading && (
				<Text size='xs' c='dimmed'>
					{t('general.pronunciationDictionary.noDictionariesHint')}
				</Text>
			)}
			{hasChanges && (
				<Group justify='flex-end' mt='xs'>
					<Button size='xs' loading={isSaving} onClick={handleSave}>
						{t('general.pronunciationDictionary.save')}
					</Button>
				</Group>
			)}
		</RightSectionCard>
	);
};

export default CampaignDictionarySelector;
