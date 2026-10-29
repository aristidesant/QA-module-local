import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import {
	IconInfoCircle,
	IconMoodSearch,
	IconPlus,
	IconTargetArrow,
	IconTrash,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useSettingsDraft } from '~/modules/qa/settings/useSettingsDraft';
import { SettingsActions } from '~/modules/qa/settings/components/SettingsActions';
import {
	selectSentimentAnalyzer,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import {
	CauseCatalogueEditor,
	useCauseCatalogueValid,
} from '../components/CauseCatalogueEditor';
import { PROMPT_MAX, SENTIMENT_LEVELS } from '../constants';
import { emotionCountsByLevel } from '../helpers';
import { SEED_SENTIMENT_ANALYZER } from '../seed';
import type { EmotionEntry, SentimentLevel } from '../types';
import classes from '../GlobalConfig.module.css';

/** The analyzer prompts and the emotion catalogue shared by every client. */
export const SentimentTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const stored = useGlobalConfigStore(selectSentimentAnalyzer);
	const save = useGlobalConfigStore((s) => s.saveSentimentAnalyzer);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft(stored);
	const firstLabelRef = useRef<HTMLInputElement>(null);

	const counts = useMemo(
		() => emotionCountsByLevel(draft.emotions),
		[draft.emotions]
	);
	const labelCounts = useMemo(() => {
		const map = new Map<string, number>();
		for (const emotion of draft.emotions) {
			const key = emotion.label.trim().toUpperCase();
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [draft.emotions]);

	const labelError = (emotion: EmotionEntry) => {
		const key = emotion.label.trim().toUpperCase();
		if (key === '') return t('sentiment.errors.empty');
		if ((labelCounts.get(key) ?? 0) > 1) return t('sentiment.errors.duplicate');
		return undefined;
	};

	const causesValid = useCauseCatalogueValid(draft.causes);

	const invalid =
		draft.systemPrompt.trim() === '' ||
		draft.classificationInstructions.trim() === '' ||
		draft.systemPrompt.length > PROMPT_MAX ||
		draft.classificationInstructions.length > PROMPT_MAX ||
		draft.emotions.some((emotion) => labelError(emotion) !== undefined) ||
		!causesValid;

	const setEmotion = (index: number, patch: Partial<EmotionEntry>) =>
		setDraft({
			...draft,
			emotions: draft.emotions.map((emotion, i) =>
				i === index ? { ...emotion, ...patch } : emotion
			),
		});

	const addEmotion = () => {
		setDraft({
			...draft,
			emotions: [
				{ label: '', description: '', level: 'NEUTRAL' },
				...draft.emotions,
			],
		});
		window.requestAnimationFrame(() => firstLabelRef.current?.focus());
	};

	const counter = (value: string) => (
		<Text
			size='xs'
			c={value.length > PROMPT_MAX ? 'red' : 'dimmed'}
			className={classes.counter}
		>
			{t('sentiment.counter', { count: value.length, max: PROMPT_MAX })}
		</Text>
	);

	return (
		<Stack gap='lg'>
			<Alert variant='light' color='blue' icon={<IconInfoCircle size={18} />}>
				{t('sentiment.notice')}
			</Alert>

			<SectionCard
				icon={IconMoodSearch}
				title={t('sentiment.instructions.title')}
				description={t('sentiment.instructions.description')}
				headerActions={
					<Text size='sm' c='dimmed'>
						{t('common.currentVersion', { n: stored.version })}
					</Text>
				}
			>
				<Stack gap='lg'>
					<Stack gap={4}>
						<Textarea
							label={t('sentiment.systemPrompt.label')}
							description={t('sentiment.systemPrompt.help')}
							value={draft.systemPrompt}
							onChange={(event) =>
								setDraft({ ...draft, systemPrompt: event.currentTarget.value })
							}
							autosize
							minRows={4}
							required
						/>
						{counter(draft.systemPrompt)}
					</Stack>
					<Stack gap={4}>
						<Textarea
							label={t('sentiment.classification.label')}
							description={t('sentiment.classification.help')}
							value={draft.classificationInstructions}
							onChange={(event) =>
								setDraft({
									...draft,
									classificationInstructions: event.currentTarget.value,
								})
							}
							autosize
							minRows={4}
							required
						/>
						{counter(draft.classificationInstructions)}
					</Stack>
				</Stack>
			</SectionCard>

			<SectionCard
				icon={IconMoodSearch}
				title={t('sentiment.catalog.title')}
				description={t('sentiment.catalog.description')}
				headerActions={
					<Button
						variant='outline'
						leftSection={<IconPlus size={16} />}
						onClick={addEmotion}
					>
						{t('sentiment.catalog.add')}
					</Button>
				}
			>
				<Stack gap='md'>
					<Group gap={6}>
						{SENTIMENT_LEVELS.map((level) => (
							<Badge key={level} variant='light' color='gray' size='sm'>
								{t(`sentiment.levels.${level}`)} · {counts[level]}
							</Badge>
						))}
					</Group>

					<Table verticalSpacing='sm'>
						<Table.Thead>
							<Table.Tr>
								<Table.Th w={220}>{t('sentiment.columns.label')}</Table.Th>
								<Table.Th>{t('sentiment.columns.description')}</Table.Th>
								<Table.Th w={200}>{t('sentiment.columns.level')}</Table.Th>
								<Table.Th w={70}>{t('sentiment.columns.actions')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{draft.emotions.map((emotion, index) => (
								<Table.Tr key={index}>
									<Table.Td>
										<TextInput
											ref={index === 0 ? firstLabelRef : undefined}
											value={emotion.label}
											onChange={(event) =>
												setEmotion(index, { label: event.currentTarget.value })
											}
											onBlur={(event) =>
												setEmotion(index, {
													label: event.currentTarget.value.trim().toUpperCase(),
												})
											}
											error={labelError(emotion)}
											classNames={{ input: classes.code }}
											aria-label={t('sentiment.columns.label')}
										/>
									</Table.Td>
									<Table.Td>
										<Textarea
											value={emotion.description}
											onChange={(event) =>
												setEmotion(index, {
													description: event.currentTarget.value,
												})
											}
											autosize
											minRows={1}
											aria-label={t('sentiment.columns.description')}
										/>
									</Table.Td>
									<Table.Td>
										<Select
											data={SENTIMENT_LEVELS.map((level) => ({
												value: level,
												label: t(`sentiment.levels.${level}`),
											}))}
											value={emotion.level}
											onChange={(value) =>
												value &&
												setEmotion(index, { level: value as SentimentLevel })
											}
											allowDeselect={false}
											comboboxProps={{ withinPortal: true }}
											aria-label={t('sentiment.columns.level')}
										/>
									</Table.Td>
									<Table.Td>
										<ActionIcon
											variant='subtle'
											color='red'
											aria-label={t('common.actions.delete')}
											onClick={() =>
												setDraft({
													...draft,
													emotions: draft.emotions.filter(
														(_, i) => i !== index
													),
												})
											}
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Stack>
			</SectionCard>

			<SectionCard
				icon={IconTargetArrow}
				title={t('sentiment.causes.title')}
				description={t('sentiment.causes.description')}
				footer={
					<SettingsActions
						dirty={dirty}
						invalid={invalid}
						onSave={() => save(draft)}
						onDiscard={discard}
						onReset={() => fillWith(SEED_SENTIMENT_ANALYZER)}
					/>
				}
			>
				<CauseCatalogueEditor
					value={draft.causes}
					onChange={(causes) => setDraft({ ...draft, causes })}
				/>
			</SectionCard>
		</Stack>
	);
};

export default SentimentTab;
