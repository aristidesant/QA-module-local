import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Group,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconArrowDown,
	IconArrowUp,
	IconCircleCheck,
	IconFileDescription,
	IconFileSearch,
	IconRefresh,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useSettingsDraft } from '~/modules/qa/settings/useSettingsDraft';
import { SettingsActions } from '~/modules/qa/settings/components/SettingsActions';
import {
	selectNamingConvention,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { ActiveClientBanner } from '../components/ActiveClientBanner';
import { CodeText } from '../components/CodeText';
import {
	DATE_TIME_FORMATS,
	NAMING_SEPARATORS,
	NAMING_TOKENS,
} from '../constants';
import { parseFilename } from '../helpers';
import { SEED_NAMING_CONVENTION } from '../seed';
import type { DateTimeFormat, NamingSeparator, NamingToken } from '../types';
import classes from '../GlobalConfig.module.css';

/** How exported audio filenames map onto the fields stored on each conversation. */
export const NamingConventionTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const stored = useGlobalConfigStore(selectNamingConvention);
	const save = useGlobalConfigStore((s) => s.saveNamingConvention);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft(stored);
	const [filename, setFilename] = useState(stored.sampleFilename);

	const parsed = useMemo(
		() => parseFilename(filename, draft),
		[filename, draft]
	);
	const configured = stored.tokens.length > 0;

	const moveToken = (index: number, delta: -1 | 1) => {
		const target = index + delta;
		if (target < 0 || target >= draft.tokens.length) return;
		const tokens = [...draft.tokens];
		[tokens[index], tokens[target]] = [tokens[target], tokens[index]];
		setDraft({ ...draft, tokens });
	};

	const setToken = (index: number, token: NamingToken) => {
		const tokens = [...draft.tokens];
		tokens[index] = token;
		setDraft({ ...draft, tokens });
	};

	const duplicateTokens = new Set(draft.tokens).size !== draft.tokens.length;

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconFileDescription}
				title={t('naming.title')}
				description={t('naming.description')}
			>
				<Stack gap='lg'>
					<ActiveClientBanner
						title={t('naming.banner.title')}
						description={t(
							configured ? 'naming.banner.configured' : 'naming.banner.missing'
						)}
						configured={configured}
					/>
					<Text size='sm' c='dimmed'>
						{t('naming.note')}
					</Text>

					<Paper withBorder p='md' radius='md'>
						<Stack gap='md'>
							<Group justify='space-between' align='flex-start' wrap='wrap'>
								<Group gap='xs' wrap='nowrap'>
									<IconFileSearch size={18} stroke={1.5} />
									<Stack gap={2}>
										<Text size='sm' fw={600}>
											{t('naming.preview.title')}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('naming.preview.description')}
										</Text>
									</Stack>
								</Group>
								<Button
									variant='subtle'
									color='gray'
									leftSection={<IconRefresh size={16} />}
									onClick={() => setFilename(stored.sampleFilename)}
								>
									{t('naming.preview.useExample')}
								</Button>
							</Group>

							<TextInput
								label={t('naming.preview.sample.label')}
								description={t('naming.preview.sample.help')}
								value={filename}
								onChange={(event) => setFilename(event.currentTarget.value)}
								classNames={{ input: classes.code }}
							/>

							<Table verticalSpacing='xs' className={classes.previewTable}>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>{t('naming.columns.field')}</Table.Th>
										<Table.Th>{t('naming.columns.raw')}</Table.Th>
										<Table.Th>{t('naming.columns.transformed')}</Table.Th>
										<Table.Th ta='right'>{t('naming.columns.status')}</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{parsed.map((field) => (
										<Table.Tr key={field.token}>
											<Table.Td>
												<CodeText>{t(`naming.tokens.${field.token}`)}</CodeText>
											</Table.Td>
											<Table.Td>
												<CodeText c={field.raw ? undefined : 'dimmed'}>
													{field.raw ?? '—'}
												</CodeText>
											</Table.Td>
											<Table.Td>
												<CodeText c={field.transformed ? undefined : 'dimmed'}>
													{field.transformed ?? '—'}
												</CodeText>
											</Table.Td>
											<Table.Td ta='right'>
												{field.ok ? (
													<IconCircleCheck
														size={18}
														className={classes.okIcon}
														aria-label={t('naming.status.ok')}
													/>
												) : (
													<IconAlertCircle
														size={18}
														className={classes.errorIcon}
														aria-label={t('naming.status.error')}
													/>
												)}
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Stack>
					</Paper>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('naming.convention.title')}
				description={t('naming.convention.description')}
				footer={
					<SettingsActions
						dirty={dirty}
						invalid={duplicateTokens}
						onSave={() => save(draft)}
						onDiscard={discard}
						onReset={() => fillWith(SEED_NAMING_CONVENTION)}
					/>
				}
			>
				<Stack gap='lg'>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
						<Select
							label={t('naming.convention.separator')}
							data={NAMING_SEPARATORS.map((separator) => ({
								value: separator,
								label: `"${separator}"`,
							}))}
							value={draft.separator}
							onChange={(value) =>
								value &&
								setDraft({ ...draft, separator: value as NamingSeparator })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
						<Select
							label={t('naming.convention.dateFormat')}
							data={DATE_TIME_FORMATS.map((format) => ({
								value: format,
								label: format,
							}))}
							value={draft.dateTimeFormat}
							onChange={(value) =>
								value &&
								setDraft({ ...draft, dateTimeFormat: value as DateTimeFormat })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
					</SimpleGrid>

					<Stack gap='xs'>
						<Text size='sm' fw={500}>
							{t('naming.convention.order')}
						</Text>
						{duplicateTokens && (
							<Text size='xs' c='red'>
								{t('naming.convention.duplicate')}
							</Text>
						)}
						{draft.tokens.map((token, index) => (
							<div key={index} className={classes.tokenRow}>
								<span className={classes.tokenIndex}>{index + 1}</span>
								<Select
									data={NAMING_TOKENS.map((option) => ({
										value: option,
										label: t(`naming.tokens.${option}`),
									}))}
									value={token}
									onChange={(value) =>
										value && setToken(index, value as NamingToken)
									}
									allowDeselect={false}
									comboboxProps={{ withinPortal: true }}
								/>
								<Group gap={4} wrap='nowrap'>
									<ActionIcon
										variant='subtle'
										color='gray'
										aria-label={t('naming.convention.moveUp')}
										disabled={index === 0}
										onClick={() => moveToken(index, -1)}
									>
										<IconArrowUp size={16} />
									</ActionIcon>
									<ActionIcon
										variant='subtle'
										color='gray'
										aria-label={t('naming.convention.moveDown')}
										disabled={index === draft.tokens.length - 1}
										onClick={() => moveToken(index, 1)}
									>
										<IconArrowDown size={16} />
									</ActionIcon>
								</Group>
							</div>
						))}
					</Stack>
				</Stack>
			</SectionCard>
		</Stack>
	);
};

export default NamingConventionTab;
