import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	NumberInput,
	Paper,
	Stack,
	Switch,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { causeIcon } from '~/modules/qa/sentimentCauses/components/causeIcons';
import {
	SENTIMENT_CAUSES_NS,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_ORDER,
	isCustomCauseKey,
} from '~/modules/qa/sentimentCauses/constants';
import type {
	AnyCauseKey,
	SentimentCauseKey,
	SentimentCauseSettings,
} from '~/modules/qa/sentimentCauses/types';
import {
	causeKeysOfFamily,
	useCauseCatalogue,
} from '~/modules/qa/sentimentCauses/useCauseSettings';

const MAX_NAME_LENGTH = 40;
const MIN_STRONG_DROP = 0.1;
const MAX_STRONG_DROP = 4;

/** At least one cause must stay on, or a reviewer has nothing to correct a call to. Added causes count too. */
export const isCauseSettingsValid = (
	value: SentimentCauseSettings,
	addedKeys: AnyCauseKey[]
): boolean =>
	[...SENTIMENT_CAUSE_ORDER, ...addedKeys].some(
		(key) => !value.disabled.includes(key)
	);

interface SentimentCausesSettingsProps {
	value: SentimentCauseSettings;
	onChange: (value: SentimentCauseSettings) => void;
}

/** What an operation decides about root causes: when a drop reads as strong, which causes it uses and what it calls them. The catalogue itself is managed in Global configuration. */
export const SentimentCausesSettings: React.FC<
	SentimentCausesSettingsProps
> = ({ value, onChange }) => {
	const { t } = useTranslation(['qa.settings', SENTIMENT_CAUSES_NS]);
	const { custom } = useCauseCatalogue();

	/** The name a cause has before this operation renames it. */
	const defaultName = (key: AnyCauseKey): string =>
		isCustomCauseKey(key)
			? (custom.find((c) => c.key === key)?.name ?? '')
			: t(`causes.${key as SentimentCauseKey}`, { ns: SENTIMENT_CAUSES_NS });
	const shownName = (key: AnyCauseKey): string =>
		value.names[key]?.trim() || defaultName(key);

	const setName = (key: AnyCauseKey, name: string) =>
		onChange({
			...value,
			// An empty name is dropped, not stored, so "back to default" equals the saved state.
			names:
				name === ''
					? (Object.fromEntries(
							Object.entries(value.names).filter(([k]) => k !== key)
						) as SentimentCauseSettings['names'])
					: { ...value.names, [key]: name },
		});
	const setEnabled = (key: AnyCauseKey, enabled: boolean) =>
		onChange({
			...value,
			disabled: enabled
				? value.disabled.filter((k) => k !== key)
				: [...value.disabled, key],
		});

	return (
		<Stack gap='lg' maw={560}>
			<NumberInput
				label={t('sentiment.causes.strongDrop')}
				description={t('sentiment.causes.strongDropHint')}
				value={value.strongDrop}
				onChange={(v) =>
					onChange({
						...value,
						strongDrop: typeof v === 'number' ? v : value.strongDrop,
					})
				}
				min={MIN_STRONG_DROP}
				max={MAX_STRONG_DROP}
				step={0.1}
				decimalScale={1}
				w={320}
				rightSection={
					<Text size='xs' c='dimmed'>
						{t('sentiment.causes.points')}
					</Text>
				}
				rightSectionWidth={44}
			/>

			{SENTIMENT_CAUSE_FAMILY_ORDER.map((family) => (
				<Stack key={family} gap='xs'>
					<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
						{t(`families.${family}`, { ns: SENTIMENT_CAUSES_NS })}
					</Text>
					{causeKeysOfFamily(custom, family).map((key) => {
						const Icon = causeIcon(key);
						const enabled = !value.disabled.includes(key);
						const name = value.names[key] ?? '';
						return (
							<Paper key={key} withBorder p='xs' radius='md'>
								<Group gap='sm' wrap='nowrap'>
									<Switch
										checked={enabled}
										onChange={(e) => setEnabled(key, e.currentTarget.checked)}
										aria-label={t('sentiment.causes.active', {
											cause: shownName(key),
										})}
									/>
									<ThemeIcon
										size='md'
										variant='light'
										color='gray'
										opacity={enabled ? 1 : 0.5}
									>
										<Icon size={16} />
									</ThemeIcon>
									<TextInput
										flex={1}
										value={name}
										onChange={(e) => setName(key, e.currentTarget.value)}
										placeholder={defaultName(key)}
										maxLength={MAX_NAME_LENGTH}
										disabled={!enabled}
										aria-label={t('sentiment.causes.nameOf', {
											cause: shownName(key),
										})}
									/>
									{isCustomCauseKey(key) && (
										<Badge size='sm' variant='light' color='gray' tt='none'>
											{t('sentiment.causes.custom')}
										</Badge>
									)}
									<Button
										variant='subtle'
										size='compact-xs'
										color='gray'
										disabled={name === ''}
										onClick={() => setName(key, '')}
									>
										{t('sentiment.causes.restoreName')}
									</Button>
								</Group>
							</Paper>
						);
					})}
				</Stack>
			))}

			<Text size='xs' c='dimmed'>
				{t('sentiment.causes.offHint')}
			</Text>
			{!isCauseSettingsValid(
				value,
				custom.map((c) => c.key)
			) && (
				<Text size='xs' c='red'>
					{t('sentiment.causes.invalid')}
				</Text>
			)}
		</Stack>
	);
};

export default SentimentCausesSettings;
