import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	NumberInput,
	Stack,
	Switch,
	Table,
	Text,
	Textarea,
} from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	KIND_LABEL,
	KINDS_BY_CATEGORY,
	REVEAL_MINUTES,
	SENSITIVE_CATEGORIES,
} from '~/modules/qa/privacy/constants';
import { maskSegments } from '~/modules/qa/privacy/mask';
import { MaskedSegments } from '~/modules/qa/privacy/components/MaskedSegments';
import type {
	PrivacySettings,
	RevealLogEntry,
	SensitiveCategory,
} from '~/modules/qa/privacy/types';
import { selectRevealLog, usePrivacyStore } from '~/stores/qa/privacyStore';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { validatePrivacy } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { SettingsActions } from '../../components/SettingsActions';

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

const when = (iso: string) =>
	new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

/** What is masked in every call, how long a QA manager can reveal it, and who did. */
export const PrivacyTab: React.FC = () => {
	const { t } = useTranslation(['qa.settings', 'qa.calls']);
	const stored = useSettingsStore(selectThresholds).privacy;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const log = usePrivacyStore(selectRevealLog);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<PrivacySettings>(stored);
	const errorKey = validatePrivacy(draft);
	const [sentence, setSentence] = useState('');
	// The draft is tried, not the saved settings, so a change is judged before it is saved.
	const tried = useMemo(() => maskSegments(sentence, draft), [sentence, draft]);
	const foundCount = tried.filter((s) => s.hit).length;

	const patchCategory = (
		category: SensitiveCategory,
		value: Partial<PrivacySettings['categories'][SensitiveCategory]>
	) =>
		setDraft({
			...draft,
			categories: {
				...draft.categories,
				[category]: { ...draft.categories[category], ...value },
			},
		});

	const statusOf = (entry: RevealLogEntry) => {
		if (entry.hiddenAt)
			return (
				<Badge variant='light' color='gray'>
					{t('privacy.log.status.hiddenEarly')}
				</Badge>
			);
		if (Date.parse(entry.expiresAt) < Date.now())
			return (
				<Badge variant='outline' color='gray'>
					{t('privacy.log.status.expired')}
				</Badge>
			);
		return (
			<Badge variant='light' color='red'>
				{t('privacy.log.status.visible')}
			</Badge>
		);
	};

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('privacy.masking.title')}
				description={t('privacy.masking.description')}
			>
				<Stack gap='md'>
					<Switch
						color='gray'
						label={t('privacy.masking.enabled')}
						checked={draft.enabled}
						onChange={(event) =>
							setDraft({ ...draft, enabled: event.currentTarget.checked })
						}
					/>
					<Table verticalSpacing='sm' withRowBorders>
						<Table.Thead>
							<Table.Tr>
								<Table.Th w={70} />
								<Table.Th>{t('privacy.masking.columns.category')}</Table.Th>
								<Table.Th>{t('privacy.masking.columns.matches')}</Table.Th>
								<Table.Th w={150}>
									{t('privacy.masking.columns.showLast')}
								</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{SENSITIVE_CATEGORIES.map((category) => {
								const config = draft.categories[category];
								return (
									<Table.Tr key={category}>
										<Table.Td>
											<Switch
												color='gray'
												disabled={!draft.enabled}
												checked={config.enabled}
												aria-label={t(`privacy.categories.${category}.label`)}
												onChange={(event) =>
													patchCategory(category, {
														enabled: event.currentTarget.checked,
													})
												}
											/>
										</Table.Td>
										<Table.Td>
											<Text size='sm' fw={500}>
												{t(`privacy.categories.${category}.label`)}
											</Text>
											<Text size='xs' c='dimmed'>
												{t(`privacy.categories.${category}.description`)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Group gap={4} wrap='wrap'>
												{KINDS_BY_CATEGORY[category].map((kind) => (
													<Badge
														key={kind}
														size='sm'
														variant='outline'
														color='gray'
														tt='none'
													>
														{KIND_LABEL[kind]}
													</Badge>
												))}
											</Group>
										</Table.Td>
										<Table.Td>
											<NumberInput
												size='xs'
												w={90}
												min={0}
												max={4}
												disabled={!draft.enabled || !config.enabled}
												value={config.showLast}
												onChange={(v) =>
													patchCategory(category, {
														showLast: toNumber(v, config.showLast),
													})
												}
											/>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('privacy.recording.title')}
				description={t('privacy.recording.description')}
			>
				<Stack gap='sm'>
					<Switch
						color='gray'
						disabled={!draft.enabled}
						label={t('privacy.recording.muteAudio')}
						checked={draft.muteAudio}
						onChange={(event) =>
							setDraft({ ...draft, muteAudio: event.currentTarget.checked })
						}
					/>
					<Text size='xs' c='dimmed'>
						{t('privacy.recording.screen')}
					</Text>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('privacy.reveal.title')}
				description={t('privacy.reveal.description')}
			>
				<Stack gap='md'>
					<Switch
						color='gray'
						label={t('privacy.reveal.allowed')}
						checked={draft.reveal.allowed}
						onChange={(event) =>
							setDraft({
								...draft,
								reveal: {
									...draft.reveal,
									allowed: event.currentTarget.checked,
								},
							})
						}
					/>
					<NumberInput
						label={t('privacy.reveal.minutes')}
						w={220}
						min={REVEAL_MINUTES.min}
						max={REVEAL_MINUTES.max}
						disabled={!draft.reveal.allowed}
						value={draft.reveal.minutes}
						onChange={(v) =>
							setDraft({
								...draft,
								reveal: {
									...draft.reveal,
									minutes: toNumber(v, draft.reveal.minutes),
								},
							})
						}
						rightSection={
							<Text size='xs' c='dimmed'>
								min
							</Text>
						}
						rightSectionWidth={44}
					/>
					<Switch
						color='gray'
						disabled={!draft.reveal.allowed}
						label={t('privacy.reveal.requireNote')}
						checked={draft.reveal.requireNote}
						onChange={(event) =>
							setDraft({
								...draft,
								reveal: {
									...draft.reveal,
									requireNote: event.currentTarget.checked,
								},
							})
						}
					/>
					<Text size='xs' c='dimmed'>
						{t('privacy.reveal.who')}
					</Text>
				</Stack>
			</SectionCard>

			<SectionCard title={t('privacy.test.title')}>
				<Stack gap='sm'>
					<Textarea
						value={sentence}
						onChange={(e) => setSentence(e.currentTarget.value)}
						placeholder={t('privacy.test.placeholder')}
						autosize
						minRows={2}
						aria-label={t('privacy.test.title')}
					/>
					{sentence.trim() !== '' && (
						<Stack gap={4}>
							<Text size='sm'>
								<MaskedSegments segments={tried} />
							</Text>
							<Text size='xs' c='dimmed'>
								{foundCount > 0
									? t('privacy.test.found', { count: foundCount })
									: t('privacy.test.none')}
							</Text>
						</Stack>
					)}
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('privacy.log.title')}
				description={t('privacy.log.description')}
			>
				<Table verticalSpacing='sm' withRowBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('privacy.log.columns.when')}</Table.Th>
							<Table.Th>{t('privacy.log.columns.who')}</Table.Th>
							<Table.Th>{t('privacy.log.columns.call')}</Table.Th>
							<Table.Th>{t('privacy.log.columns.reason')}</Table.Th>
							<Table.Th>{t('privacy.log.columns.note')}</Table.Th>
							<Table.Th>{t('privacy.log.columns.status')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{log.map((entry) => (
							<Table.Tr key={entry.id}>
								<Table.Td>
									<Text size='sm'>{when(entry.at)}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{entry.by}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{entry.callId}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>
										{t(`privacy.reasons.${entry.reason}`, { ns: 'qa.calls' })}
									</Text>
								</Table.Td>
								<Table.Td maw={260}>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{entry.note || '—'}
									</Text>
								</Table.Td>
								<Table.Td>{statusOf(entry)}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</SectionCard>

			{errorKey && (
				<Text size='xs' c='red'>
					{t(errorKey)}
				</Text>
			)}
			<SettingsActions
				dirty={dirty}
				invalid={errorKey !== null}
				onSave={() => {
					saveThresholds('privacy', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.privacy)}
			/>
		</Stack>
	);
};

export default PrivacyTab;
