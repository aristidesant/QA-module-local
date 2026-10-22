import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Divider,
	Group,
	NumberInput,
	SegmentedControl,
	Stack,
	TagsInput,
	Text,
	Textarea,
} from '@mantine/core';
import { DEFAULT_LEXICON } from '~/modules/qa/burnout/constants';
import {
	LEXICON_CATEGORIES,
	LEXICON_LANGUAGES,
	analyzeSentence,
	cleanList,
	lexiconStats,
} from '~/modules/qa/burnout/lexicon';
import type {
	BurnoutLexicon as BurnoutLexiconValue,
	LexiconCategory,
	LexiconLanguage,
} from '~/modules/qa/burnout/types';

interface BurnoutLexiconProps {
	value: BurnoutLexiconValue;
	onChange: (value: BurnoutLexiconValue) => void;
}

/** Red marks what a reviewer should watch for; empathy is the good sign, so it stays neutral. */
const MATCH_COLOR: Record<LexiconCategory, string> = {
	negativeLanguage: 'red',
	apathyPhrases: 'red',
	empathyPhrases: 'gray',
};

/** The phrases behind the word-choice signals: lists to add to and read, a sentence to try, and what a short reply is. */
export const BurnoutLexicon: React.FC<BurnoutLexiconProps> = ({
	value,
	onChange,
}) => {
	const { t } = useTranslation(['qa.settings', 'qa.burnout']);
	const [language, setLanguage] = useState<LexiconLanguage>('es');
	const [sentence, setSentence] = useState('');
	const stats = useMemo(() => lexiconStats(), []);
	const analysis = useMemo(
		() => analyzeSentence(sentence, value, language),
		[sentence, value, language]
	);

	const setList = (category: LexiconCategory, items: string[]) =>
		onChange({
			...value,
			lists: {
				...value.lists,
				[category]: {
					...value.lists[category],
					[language]: cleanList(items),
				},
			},
		});

	const restoreList = (category: LexiconCategory) =>
		setList(category, DEFAULT_LEXICON.lists[category][language]);

	const setShortReplies = (
		patch: Partial<BurnoutLexiconValue['shortReplies']>
	) =>
		onChange({ ...value, shortReplies: { ...value.shortReplies, ...patch } });

	const statLabel = (category: LexiconCategory) => {
		if (category === 'apathyPhrases')
			return t('burnout.lexicon.statMatches', { count: stats.apathyPhrases });
		if (category === 'empathyPhrases')
			return t('burnout.lexicon.statMatches', { count: stats.empathyPhrases });
		return t('burnout.lexicon.statRate', { value: stats.negativeLanguageRate });
	};

	const hasMatch = LEXICON_CATEGORIES.some(
		(c) => analysis.matches[c].length > 0
	);

	return (
		<Stack gap='lg'>
			<Group justify='space-between' align='flex-end' wrap='wrap'>
				<Stack gap={4}>
					<Text size='sm' fw={500}>
						{t('burnout.lexicon.language')}
					</Text>
					<SegmentedControl
						value={language}
						onChange={(v) => setLanguage(v as LexiconLanguage)}
						data={LEXICON_LANGUAGES.map((l) => ({
							value: l,
							label: t(`burnout.lexicon.languages.${l}`),
						}))}
					/>
				</Stack>
				<Text size='xs' c='dimmed'>
					{t('burnout.lexicon.statNote', { count: stats.calls })}
				</Text>
			</Group>

			{LEXICON_CATEGORIES.map((category) => {
				const list = value.lists[category][language];
				return (
					<Stack key={category} gap='xs'>
						<Group justify='space-between' align='flex-start' wrap='nowrap'>
							<Stack gap={0}>
								<Text fw={600}>
									{t(`signals.${category}.label`, { ns: 'qa.burnout' })}
								</Text>
								<Text size='xs' c='dimmed'>
									{t(`signals.${category}.description`, { ns: 'qa.burnout' })}
								</Text>
							</Stack>
							<Group gap='xs' wrap='nowrap'>
								<Badge size='sm' variant='light' color='gray'>
									{statLabel(category)}
								</Badge>
								<Button
									variant='subtle'
									size='compact-xs'
									onClick={() => restoreList(category)}
								>
									{t('burnout.lexicon.restore')}
								</Button>
							</Group>
						</Group>
						<TagsInput
							value={list}
							onChange={(items) => setList(category, items)}
							placeholder={t('burnout.lexicon.placeholder')}
							splitChars={[',']}
							clearable
							aria-label={t(`signals.${category}.label`, { ns: 'qa.burnout' })}
						/>
						<Text size='xs' c='dimmed'>
							{t('burnout.lexicon.phrases', { count: list.length })}
						</Text>
					</Stack>
				);
			})}

			<Divider />

			<Stack gap='xs'>
				<Stack gap={0}>
					<Text fw={600}>
						{t('signals.shortTurns.label', { ns: 'qa.burnout' })}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('burnout.lexicon.shortDescription')}
					</Text>
				</Stack>
				<NumberInput
					label={t('burnout.lexicon.maxWords')}
					value={value.shortReplies.maxWords}
					onChange={(v) =>
						setShortReplies({
							maxWords:
								typeof v === 'number'
									? v
									: Number(v) || value.shortReplies.maxWords,
						})
					}
					min={1}
					max={10}
					w={220}
					rightSection={
						<Text size='xs' c='dimmed'>
							{t('burnout.lexicon.words')}
						</Text>
					}
					rightSectionWidth={56}
				/>
				<TagsInput
					label={t('burnout.lexicon.exceptions')}
					description={t('burnout.lexicon.exceptionsHint')}
					value={value.shortReplies.exceptions[language]}
					onChange={(items) =>
						setShortReplies({
							exceptions: {
								...value.shortReplies.exceptions,
								[language]: cleanList(items),
							},
						})
					}
					placeholder={t('burnout.lexicon.placeholder')}
					splitChars={[',']}
					clearable
				/>
			</Stack>

			<Divider />

			<Stack gap='xs'>
				<Text fw={600}>{t('burnout.lexicon.testTitle')}</Text>
				<Textarea
					value={sentence}
					onChange={(e) => setSentence(e.currentTarget.value)}
					placeholder={t('burnout.lexicon.testPlaceholder')}
					autosize
					minRows={2}
					aria-label={t('burnout.lexicon.testTitle')}
				/>
				{sentence.trim() !== '' && (
					<Stack gap='xs'>
						{LEXICON_CATEGORIES.map((category) =>
							analysis.matches[category].length > 0 ? (
								<Group key={category} gap='xs' wrap='wrap'>
									<Text size='xs' fw={600} w={170}>
										{t(`signals.${category}.label`, { ns: 'qa.burnout' })}
									</Text>
									{analysis.matches[category].map((phrase) => (
										<Badge
											key={phrase}
											size='sm'
											variant='light'
											color={MATCH_COLOR[category]}
											tt='none'
										>
											{phrase}
										</Badge>
									))}
								</Group>
							) : null
						)}
						{!hasMatch && (
							<Text size='sm' c='dimmed'>
								{t('burnout.lexicon.testNone')}
							</Text>
						)}
						<Text size='sm' c='dimmed'>
							{analysis.isExcepted
								? t('burnout.lexicon.testExcepted')
								: analysis.isShortReply
									? t('burnout.lexicon.testShort', { count: analysis.words })
									: t('burnout.lexicon.testNotShort', {
											count: analysis.words,
										})}
						</Text>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default BurnoutLexicon;
