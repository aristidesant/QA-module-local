import { Grid, Select, SegmentedControl, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { CELEBRATION_EMOJIS } from '~/modules/qa/triggers/constants';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

interface RecognitionSectionProps {
	form: UseFormReturnType<RuleFormValues>;
}

export function RecognitionSection({ form }: RecognitionSectionProps) {
	const { t } = useTranslation('qa.triggers');
	const badges = useTriggerRulesStore((s) => s.badges);

	const activeBadges = badges.filter((b) => b.status === 'ACTIVE');

	const badgeOptions = activeBadges.map((badge) => ({
		label: `${badge.icon} ${badge.name}`,
		value: badge.id,
	}));

	return (
		<SectionCard title={t('editor.sections.recognition')}>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Select
						label={t('editor.fields.badge')}
						placeholder={t('editor.fields.badgePlaceholder')}
						data={badgeOptions}
						value={form.values.badgeId}
						onChange={(v) =>
							form.setFieldValue('badgeId', v)
						}
						searchable
						clearable
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Stack gap='xs'>
						<Text size='sm' fw={500}>{t('editor.fields.visibility')}</Text>
						<SegmentedControl
							data={[
								{ label: t('visibility.PRIVATE'), value: 'PRIVATE' },
								{ label: t('visibility.TEAM_FEED'), value: 'TEAM_FEED' },
							]}
							value={form.values.visibility}
							onChange={(v) =>
								form.setFieldValue('visibility', v as any)
							}
							fullWidth
						/>
					</Stack>
				</Grid.Col>
			</Grid>

			<Stack gap='md' mt='md'>
				<div>
					<Text size='sm' fw={500} mb='xs'>
						{t('editor.fields.celebrationEmoji')}
					</Text>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns:
								'repeat(auto-fill, minmax(44px, 1fr))',
							gap: 'var(--mantine-spacing-xs)',
						}}
					>
						{CELEBRATION_EMOJIS.map((emoji) => (
							<button
								key={emoji}
								onClick={() =>
									form.setFieldValue(
										'celebrationEmoji',
										emoji
									)
								}
								style={{
									border:
										form.values.celebrationEmoji ===
										emoji
											? '2px solid var(--mantine-color-blue-5)'
											: '1px solid var(--mantine-color-gray-3)',
									borderRadius:
										'var(--mantine-radius-sm)',
									padding: '8px',
									fontSize: '24px',
									cursor: 'pointer',
									backgroundColor:
										form.values.celebrationEmoji ===
										emoji
											? 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-blue-9))'
											: 'transparent',
									transition: 'all 200ms ease',
								}}
								type='button'
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			</Stack>
		</SectionCard>
	);
}
