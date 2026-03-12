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
import RightSectionCard from '~/components/RightSectionCard';
import { useGetAgent } from '~/queries/agentQueries';
import {
	usePronunciationDictionaries,
	useAttachDictionaryToAgent,
	useDetachDictionaryFromAgent,
} from '~/queries/pronunciationDictionaryQueries';

interface CampaignDictionarySelectorProps {
	agentId: string;
}

const NONE_VALUE = '__none__';

const CampaignDictionarySelector: React.FC<CampaignDictionarySelectorProps> = ({
	agentId,
}) => {
	const { t } = useTranslation('campaigns');

	const { data: agent, refetch: refetchAgent } = useGetAgent(agentId);
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

		// locators can be strings or objects with pronunciationDictionaryId
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

	// Selected value in the dropdown (internal DB id as string, or NONE_VALUE)
	const [selectedValue, setSelectedValue] = useState<string | null>(null);

	// Sync dropdown with attached dictionary when data loads
	useEffect(() => {
		if (attachedDictionary) {
			setSelectedValue(String(attachedDictionary.id));
		} else if (agent && !isDictionariesLoading) {
			setSelectedValue(NONE_VALUE);
		}
	}, [attachedDictionary, agent, isDictionariesLoading]);

	// Build select options
	const selectData = useMemo(() => {
		const options = [
			{
				value: NONE_VALUE,
				label: t('general.pronunciationDictionary.noDictionary'),
			},
			...dictionaries.map((d) => ({
				value: String(d.id),
				label: d.name,
			})),
		];
		return options;
	}, [dictionaries, t]);

	// Whether the current selection differs from the saved state
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
						title: t(
							'general.pronunciationDictionary.notifications.detachSuccess'
						),
						message: t(
							'general.pronunciationDictionary.notifications.detachSuccess'
						),
						color: 'green',
					});
					setSelectedValue(NONE_VALUE);
					refetchAgent();
				},
				onError: () => {
					notifications.show({
						title: t('general.pronunciationDictionary.notifications.saveError'),
						message: t(
							'general.pronunciationDictionary.notifications.saveError'
						),
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
							title: t(
								'general.pronunciationDictionary.notifications.detachSuccess'
							),
							message: t(
								'general.pronunciationDictionary.notifications.detachSuccess'
							),
							color: 'green',
						});
						refetchAgent();
					},
					onError: () => {
						notifications.show({
							title: t(
								'general.pronunciationDictionary.notifications.saveError'
							),
							message: t(
								'general.pronunciationDictionary.notifications.saveError'
							),
							color: 'red',
						});
					},
				}
			);
		} else {
			// Attach
			attachDictionary.mutate(
				{ dictionaryId: Number(selectedValue), agentId },
				{
					onSuccess: () => {
						notifications.show({
							title: t(
								'general.pronunciationDictionary.notifications.saveSuccess'
							),
							message: t(
								'general.pronunciationDictionary.notifications.saveSuccess'
							),
							color: 'green',
						});
						refetchAgent();
					},
					onError: () => {
						notifications.show({
							title: t(
								'general.pronunciationDictionary.notifications.saveError'
							),
							message: t(
								'general.pronunciationDictionary.notifications.saveError'
							),
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

	return (
		<RightSectionCard
			title={t('general.pronunciationDictionary.title')}
			description={t('general.pronunciationDictionary.description')}
			icon={IconBook2}
			iconColor='var(--mantine-color-violet-6)'
		>
			<Select
				data={selectData}
				value={selectedValue}
				onChange={setSelectedValue}
				placeholder={t('general.pronunciationDictionary.selectPlaceholder')}
				size='sm'
				radius='md'
				searchable
				disabled={isDictionariesLoading}
			/>
			{dictionaries.length === 0 && !isDictionariesLoading && (
				<Text size='xs' c='dimmed'>
					{t('general.pronunciationDictionary.noDictionariesHint')}
				</Text>
			)}
			<Group justify='flex-end' mt='xs' gap='xs'>
				{attachedDictionary && (
					<Tooltip label={t('general.pronunciationDictionary.detachTooltip')}>
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
						{t('general.pronunciationDictionary.save')}
					</Button>
				)}
			</Group>
		</RightSectionCard>
	);
};

export default CampaignDictionarySelector;
