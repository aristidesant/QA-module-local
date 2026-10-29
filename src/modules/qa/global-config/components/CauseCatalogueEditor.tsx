import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Table,
	Text,
	TextInput,
	Textarea,
	ThemeIcon,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { causeIcon } from '~/modules/qa/sentimentCauses/components/causeIcons';
import {
	CUSTOM_CAUSE_PREFIX,
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSES_NS,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_ORDER,
} from '~/modules/qa/sentimentCauses/constants';
import type {
	CustomSentimentCause,
	SentimentCauseCatalogue,
	SentimentCauseFamily,
	SentimentCauseKey,
} from '~/modules/qa/sentimentCauses/types';

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 300;

const normalize = (name: string) => name.trim().toLowerCase();

interface CatalogueIssues {
	/** Added cause key -> the name error, when it has one. */
	names: Record<string, 'empty' | 'duplicate'>;
	/** Keys of added causes with no description. */
	emptyDescriptions: Set<string>;
}

/** Empty or duplicate names (against the nine built-in names and the other added ones) and added causes with no description. */
const findIssues = (
	custom: CustomSentimentCause[],
	builtInNames: string[]
): CatalogueIssues => {
	const taken = new Map<string, number>();
	for (const name of builtInNames)
		taken.set(normalize(name), (taken.get(normalize(name)) ?? 0) + 1);
	for (const cause of custom)
		taken.set(
			normalize(cause.name),
			(taken.get(normalize(cause.name)) ?? 0) + 1
		);
	const names: CatalogueIssues['names'] = {};
	const emptyDescriptions = new Set<string>();
	for (const cause of custom) {
		if (normalize(cause.name) === '') names[cause.key] = 'empty';
		else if ((taken.get(normalize(cause.name)) ?? 0) > 1)
			names[cause.key] = 'duplicate';
		if (cause.description.trim() === '') emptyDescriptions.add(cause.key);
	}
	return { names, emptyDescriptions };
};

/** Names of the nine built-in causes, as the super admin reads them. */
const useBuiltInNames = (): string[] => {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	return SENTIMENT_CAUSE_ORDER.map((key) => t(`causes.${key}`));
};

/** True when every added cause has a unique name and a description, so the catalogue can be saved. */
export const useCauseCatalogueValid = (
	value: SentimentCauseCatalogue
): boolean => {
	const builtInNames = useBuiltInNames();
	const issues = findIssues(value.custom, builtInNames);
	return (
		Object.keys(issues.names).length === 0 &&
		issues.emptyDescriptions.size === 0
	);
};

interface CauseCatalogueEditorProps {
	value: SentimentCauseCatalogue;
	onChange: (value: SentimentCauseCatalogue) => void;
}

/** The root causes of sentiment drops: AI guidance for the nine built-in ones and the causes a client adds on top. */
export const CauseCatalogueEditor: React.FC<CauseCatalogueEditorProps> = ({
	value,
	onChange,
}) => {
	const { t } = useTranslation(['qa.globalConfig', SENTIMENT_CAUSES_NS]);
	const builtInNames = useBuiltInNames();
	const issues = findIssues(value.custom, builtInNames);

	const familyLabel = (family: SentimentCauseFamily) =>
		t(`families.${family}`, { ns: SENTIMENT_CAUSES_NS });

	const setDescription = (key: SentimentCauseKey, text: string) =>
		onChange({
			...value,
			descriptions:
				text === ''
					? (Object.fromEntries(
							Object.entries(value.descriptions).filter(([k]) => k !== key)
						) as SentimentCauseCatalogue['descriptions'])
					: { ...value.descriptions, [key]: text },
		});
	const patchCustom = (key: string, patch: Partial<CustomSentimentCause>) =>
		onChange({
			...value,
			custom: value.custom.map((c) => (c.key === key ? { ...c, ...patch } : c)),
		});

	const addCause = () => {
		const key: CustomSentimentCause['key'] = `${CUSTOM_CAUSE_PREFIX}${Date.now().toString(36)}`;
		onChange({
			...value,
			custom: [
				{ key, name: '', family: 'BUSINESS', description: '' },
				...value.custom,
			],
		});
		window.requestAnimationFrame(() =>
			document
				.querySelector<HTMLInputElement>(`[data-cause-name="${key}"]`)
				?.focus()
		);
	};

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='center' wrap='nowrap'>
				<Text size='xs' c='dimmed'>
					{t('sentiment.causes.hint')}
				</Text>
				<Button
					variant='outline'
					leftSection={<IconPlus size={16} />}
					onClick={addCause}
				>
					{t('sentiment.causes.add')}
				</Button>
			</Group>

			<Table verticalSpacing='sm'>
				<Table.Thead>
					<Table.Tr>
						<Table.Th w={240}>{t('sentiment.causes.columns.cause')}</Table.Th>
						<Table.Th w={170}>{t('sentiment.causes.columns.family')}</Table.Th>
						<Table.Th>{t('sentiment.causes.columns.description')}</Table.Th>
						<Table.Th w={130}>{t('sentiment.causes.columns.actions')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{value.custom.map((cause) => {
						const Icon = causeIcon(cause.key);
						const nameIssue = issues.names[cause.key];
						return (
							<Table.Tr key={cause.key}>
								<Table.Td>
									<Group gap='xs' wrap='nowrap' align='flex-start'>
										<ThemeIcon size='md' variant='light' color='gray' mt={4}>
											<Icon size={16} />
										</ThemeIcon>
										<TextInput
											flex={1}
											value={cause.name}
											onChange={(e) =>
												patchCustom(cause.key, { name: e.currentTarget.value })
											}
											placeholder={t('sentiment.causes.namePlaceholder')}
											maxLength={MAX_NAME_LENGTH}
											data-cause-name={cause.key}
											error={
												nameIssue
													? t(
															nameIssue === 'empty'
																? 'sentiment.causes.errors.emptyName'
																: 'sentiment.causes.errors.duplicateName'
														)
													: undefined
											}
											aria-label={t('sentiment.causes.columns.cause')}
										/>
									</Group>
								</Table.Td>
								<Table.Td>
									<Select
										data={SENTIMENT_CAUSE_FAMILY_ORDER.map((family) => ({
											value: family,
											label: familyLabel(family),
										}))}
										value={cause.family}
										onChange={(family) =>
											family &&
											patchCustom(cause.key, {
												family: family as SentimentCauseFamily,
											})
										}
										allowDeselect={false}
										comboboxProps={{ withinPortal: true }}
										aria-label={t('sentiment.causes.columns.family')}
									/>
								</Table.Td>
								<Table.Td>
									<Textarea
										value={cause.description}
										onChange={(e) =>
											patchCustom(cause.key, {
												description: e.currentTarget.value,
											})
										}
										placeholder={t('sentiment.causes.descriptionPlaceholder')}
										maxLength={MAX_DESCRIPTION_LENGTH}
										autosize
										minRows={1}
										maxRows={5}
										error={
											issues.emptyDescriptions.has(cause.key)
												? t('sentiment.causes.errors.emptyDescription')
												: undefined
										}
										aria-label={t('sentiment.causes.columns.description')}
									/>
								</Table.Td>
								<Table.Td />
							</Table.Tr>
						);
					})}
					{SENTIMENT_CAUSE_ORDER.map((key) => {
						const Icon = causeIcon(key);
						const override = value.descriptions[key] ?? '';
						return (
							<Table.Tr key={key}>
								<Table.Td>
									<Group gap='xs' wrap='nowrap'>
										<ThemeIcon size='md' variant='light' color='gray'>
											<Icon size={16} />
										</ThemeIcon>
										<Text size='sm' fw={500}>
											{t(`causes.${key}`, { ns: SENTIMENT_CAUSES_NS })}
										</Text>
										<Badge size='xs' variant='outline' color='gray' tt='none'>
											{t('sentiment.causes.default')}
										</Badge>
									</Group>
								</Table.Td>
								<Table.Td>
									<Badge size='sm' variant='outline' color='gray' tt='none'>
										{familyLabel(SENTIMENT_CAUSES[key].family)}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Textarea
										value={override}
										onChange={(e) => setDescription(key, e.currentTarget.value)}
										placeholder={t(`causeDescriptions.${key}`, {
											ns: SENTIMENT_CAUSES_NS,
										})}
										maxLength={MAX_DESCRIPTION_LENGTH}
										autosize
										minRows={1}
										maxRows={5}
										aria-label={t('sentiment.causes.columns.description')}
									/>
								</Table.Td>
								<Table.Td>
									<Button
										variant='subtle'
										size='compact-xs'
										color='gray'
										disabled={override === ''}
										onClick={() => setDescription(key, '')}
									>
										{t('sentiment.causes.restoreDefault')}
									</Button>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</Stack>
	);
};

export default CauseCatalogueEditor;
