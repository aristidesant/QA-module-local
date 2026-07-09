import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, MultiSelect, TagsInput, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBook2, IconMicrophone, IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useAgentConfigFormContext } from '~/modules/campaigns/campaignFormFunctions';
import { useGetAgent } from '~/queries/agentQueries';
import {
	useBulkAttachDictionariesToAgent,
	useDetachDictionaryFromAgent,
	usePronunciationDictionaries,
} from '~/queries/pronunciationDictionaryQueries';
import styles from './CampaignConfigurationSpeechLanguage.module.css';

interface Props {
	agentId: string;
}

const normalizeKeywords = (values: string[]) => {
	const unique = new Set<string>();
	values.forEach((v) => {
		const trimmed = v.trim();
		if (trimmed) unique.add(trimmed);
	});
	return Array.from(unique);
};

const CampaignConfigurationSpeechLanguage: React.FC<Props> = ({ agentId }) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.form.general',
		'campaigns',
	]);
	const form = useAgentConfigFormContext();

	// ── ASR Keywords ──────────────────────────────────────────────────────────
	const currentKeywords = form.values.conversationConfig?.asr?.keywords ?? [];

	const handleKeywordsChange = (values: string[]) => {
		form.setFieldValue(
			'conversationConfig.asr.keywords',
			normalizeKeywords(values)
		);
	};

	// ── Pronunciation Dictionary ───────────────────────────────────────────────
	const { data: agent, refetch: refetchAgent } = useGetAgent(agentId);
	const { data: dictionariesResponse, isLoading: isDictionariesLoading } =
		usePronunciationDictionaries();
	const dictionaries = dictionariesResponse?.data ?? [];
	const bulkAttach = useBulkAttachDictionariesToAgent();
	const detachDictionary = useDetachDictionaryFromAgent();
	const isSaving = bulkAttach.isPending || detachDictionary.isPending;

	const attachedElevenLabsIds = useMemo(() => {
		const locators =
			agent?.config?.conversationConfig?.tts?.pronunciationDictionaryLocators;
		if (!locators?.length) return [];
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

	const handleDictionarySave = useCallback(async () => {
		if (!agentId) return;
		try {
			if (selectedValues.length > 0) {
				await bulkAttach.mutateAsync({
					dictionaryIds: selectedValues.map(Number),
					agentId,
				});
			} else {
				await Promise.all(
					attachedDictionaries.map((d) =>
						detachDictionary.mutateAsync({ dictionaryId: d.id, agentId })
					)
				);
			}
			notifications.show({
				title: t('general.pronunciationDictionary.notifications.saveSuccess', {
					ns: 'campaigns',
				}),
				message: t(
					'general.pronunciationDictionary.notifications.saveSuccess',
					{ ns: 'campaigns' }
				),
				color: 'green',
			});
			initializedRef.current = false;
			refetchAgent();
		} catch {
			notifications.show({
				title: t('general.pronunciationDictionary.notifications.saveError', {
					ns: 'campaigns',
				}),
				message: t('general.pronunciationDictionary.notifications.saveError', {
					ns: 'campaigns',
				}),
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
		<SectionCard
			icon={IconMicrophone}
			title={t('agentDetail.advanced.groups.speechAndLanguage')}
			contentSpacing={0}
		>
			{/* ASR Keywords */}
			<div className={styles.subSection}>
				<div className={styles.subSectionHeader}>
					<IconTag size={15} className={styles.subSectionIcon} />
					<Text className={styles.subSectionTitle}>
						{t('general.asrKeywords', { ns: 'campaign.form.general' })}
					</Text>
				</div>
				<TagsInput
					placeholder={t('general.asrKeywordsPlaceholder', {
						ns: 'campaign.form.general',
					})}
					description={t('general.asrKeywordsHelp', {
						ns: 'campaign.form.general',
					})}
					value={currentKeywords}
					onChange={handleKeywordsChange}
					size='sm'
				/>
			</div>

			{/* Pronunciation Dictionary */}
			<div className={styles.subSection}>
				<div className={styles.subSectionHeader}>
					<IconBook2 size={15} className={styles.subSectionIcon} />
					<div>
						<Text className={styles.subSectionTitle}>
							{t('general.pronunciationDictionary.title', { ns: 'campaigns' })}
						</Text>
						<Text className={styles.subSectionDesc}>
							{t('general.pronunciationDictionary.description', {
								ns: 'campaigns',
							})}
						</Text>
					</div>
				</div>
				<MultiSelect
					data={selectData}
					value={selectedValues}
					onChange={setSelectedValues}
					placeholder={t('general.pronunciationDictionary.selectPlaceholder', {
						ns: 'campaigns',
					})}
					size='sm'
					radius='md'
					searchable
					clearable
					hidePickedOptions
					disabled={isDictionariesLoading}
				/>
				{dictionaries.length === 0 && !isDictionariesLoading && (
					<Text size='xs' c='dimmed' mt='xs'>
						{t('general.pronunciationDictionary.noDictionariesHint', {
							ns: 'campaigns',
						})}
					</Text>
				)}
				{hasChanges && (
					<Group justify='flex-end' mt='xs'>
						<Button size='xs' loading={isSaving} onClick={handleDictionarySave}>
							{t('general.pronunciationDictionary.save', { ns: 'campaigns' })}
						</Button>
					</Group>
				)}
			</div>
		</SectionCard>
	);
};

export default CampaignConfigurationSpeechLanguage;
